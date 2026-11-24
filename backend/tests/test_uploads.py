"""
Upload tests. Run from the backend folder:

    pip install pytest httpx
    python -m pytest tests -q

Uses a throwaway SQLite database and makes the legacy uploads/
directory read-only for the duration of the run, to mimic Vercel.
"""

import io
import os
import secrets
import stat
import sys
import tempfile

import pytest

BACKEND_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)
sys.path.insert(0, BACKEND_DIR)

_tmp_dir = tempfile.mkdtemp()
# Set TEST_DATABASE_URL to run against a throwaway PostgreSQL database.
os.environ["DATABASE_URL"] = os.getenv(
    "TEST_DATABASE_URL",
    f"sqlite:///{os.path.join(_tmp_dir, 'test.db')}",
)
os.environ["JWT_SECRET"] = secrets.token_hex(32)

from fastapi.testclient import TestClient  # noqa: E402
from PIL import Image  # noqa: E402

import main  # noqa: E402
from auth import create_access_token, hash_password  # noqa: E402
from database import SessionLocal  # noqa: E402
from models import AdminUser, StoredFile, SiteSetting  # noqa: E402

LEGACY_DIR = main.LEGACY_UPLOADS_DIR


def _png_bytes(color=(200, 30, 30)) -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (8, 8), color).save(buffer, "PNG")
    return buffer.getvalue()


def _jpeg_bytes() -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (8, 8), (0, 0, 255)).save(buffer, "JPEG")
    return buffer.getvalue()


def _set_tree_writable(writable: bool):
    for root, dirs, files in os.walk(LEGACY_DIR):
        for name in dirs + [""]:
            path = os.path.join(root, name)
            mode = os.stat(path).st_mode
            if writable:
                os.chmod(path, mode | stat.S_IWUSR)
            else:
                os.chmod(path, mode & ~stat.S_IWUSR)


@pytest.fixture(scope="module")
def client():
    db = SessionLocal()
    db.add(
        AdminUser(
            username="tester",
            password_hash=hash_password("pw"),
            is_active=True,
        )
    )
    db.commit()
    db.close()

    existed = os.path.isdir(LEGACY_DIR)
    if existed:
        _set_tree_writable(False)

    try:
        with TestClient(main.app) as test_client:
            yield test_client
    finally:
        if existed:
            _set_tree_writable(True)


@pytest.fixture(scope="module")
def auth_headers(client):
    with SessionLocal() as db:
        admin = db.query(AdminUser).filter_by(username="tester").one()
        token = create_access_token(admin)
    return {"Authorization": f"Bearer {token}"}


def _count_files():
    db = SessionLocal()
    try:
        return db.query(StoredFile).count()
    finally:
        db.close()


def _assert_served(client, url, content, content_type):
    response = client.get(url)
    assert response.status_code == 200, response.text
    assert response.content == content
    assert response.headers["content-type"] == content_type
    assert "immutable" in response.headers["cache-control"]

    etag = response.headers["etag"]
    cached = client.get(url, headers={"If-None-Match": etag})
    assert cached.status_code == 304


def test_upload_requires_auth(client):
    response = client.post(
        "/api/admin/site-settings/upload?setting_key=logo_url",
        files={"file": ("a.png", _png_bytes(), "image/png")},
    )
    assert response.status_code == 401
    assert _count_files() == 0


def test_site_setting_upload_save_and_remove(client, auth_headers):
    data = _png_bytes()

    response = client.post(
        "/api/admin/site-settings/upload?setting_key=home_background",
        files={"file": ("bg.png", data, "image/png")},
        headers=auth_headers,
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["setting_key"] == "home_background"
    url = body["image_url"]
    assert url.startswith("/api/files/site/") and url.endswith(".png")

    _assert_served(client, url, data, "image/png")

    # Save the setting like the admin dashboard does.
    response = client.put(
        "/api/admin/site-settings",
        json={"home_background": url},
        headers=auth_headers,
    )
    assert response.status_code == 200, response.text
    assert client.get("/api/site-settings").json()[
        "home_background"
    ] == url

    db = SessionLocal()
    row = db.query(SiteSetting).filter_by(key="home_background").one()
    assert row.value == url
    db.close()

    # Remove: setting cleared and stored file deleted.
    response = client.delete(
        "/api/admin/site-settings/image?setting_key=home_background",
        headers=auth_headers,
    )
    assert response.status_code == 200, response.text
    assert client.get(url).status_code == 404
    assert client.get("/api/site-settings").json()[
        "home_background"
    ] is None


def test_remove_legacy_site_image_on_read_only_fs(client, auth_headers):
    legacy_url = "/uploads/site/legacy-does-not-matter.png"
    client.put(
        "/api/admin/site-settings",
        json={"logo_url": legacy_url},
        headers=auth_headers,
    )
    response = client.delete(
        "/api/admin/site-settings/image?setting_key=logo_url",
        headers=auth_headers,
    )
    assert response.status_code == 200, response.text


def test_blog_upload_and_post(client, auth_headers):
    data = _jpeg_bytes()
    response = client.post(
        "/api/admin/blog/upload-image",
        files={"file": ("b.jpg", data, "image/jpeg")},
        headers=auth_headers,
    )
    assert response.status_code == 200, response.text
    url = response.json()["image_url"]
    assert url.startswith("/api/files/blog/") and url.endswith(".jpg")
    _assert_served(client, url, data, "image/jpeg")

    response = client.post(
        "/api/admin/blog",
        json={
            "title": "Test",
            "slug": "test-upload-post",
            "content": "Body",
            "featured_image": url,
            "is_published": True,
        },
        headers=auth_headers,
    )
    assert response.status_code == 200, response.text
    assert response.json()["featured_image"] == url


def test_client_logo_upload(client, auth_headers):
    data = _png_bytes((0, 255, 0))
    response = client.post(
        "/api/admin/clients/upload-logo",
        files={"file": ("logo.PNG", data, "image/png")},
        headers=auth_headers,
    )
    assert response.status_code == 200, response.text
    url = response.json()["image_url"]
    assert url.startswith("/api/files/clients/") and url.endswith(".png")
    _assert_served(client, url, data, "image/png")


def test_review_photo_upload(client, auth_headers):
    data = _jpeg_bytes()
    response = client.post(
        "/api/admin/reviews/upload-photo",
        files={"file": ("me.jpeg", data, "image/jpeg")},
        headers=auth_headers,
    )
    assert response.status_code == 200, response.text
    url = response.json()["image_url"]
    assert url.startswith("/api/files/reviews/") and url.endswith(".jpeg")
    _assert_served(client, url, data, "image/jpeg")


def test_rejects_invalid_image(client, auth_headers):
    before = _count_files()
    response = client.post(
        "/api/admin/blog/upload-image",
        files={"file": ("x.png", b"not an image", "image/png")},
        headers=auth_headers,
    )
    assert response.status_code == 400
    assert _count_files() == before


def test_unknown_file_404(client):
    assert client.get("/api/files/site/nope.png").status_code == 404
    assert client.get(
        "/api/files/site/" + "0" * 32 + ".png"
    ).status_code == 404


def test_legacy_uploads_still_served(client):
    site_dir = os.path.join(LEGACY_DIR, "site")
    if not os.path.isdir(site_dir):
        pytest.skip("no legacy uploads present")
    name = sorted(os.listdir(site_dir))[0]
    response = client.get(f"/uploads/site/{name}")
    assert response.status_code == 200
    with open(os.path.join(site_dir, name), "rb") as f:
        assert response.content == f.read()


@pytest.mark.parametrize("value", [None, "", "short", " " * 64, "a" * 64,
                                  "research-guru-dev-secret-change-this"])
def test_rejects_insecure_jwt_configuration(value):
    from auth import require_jwt_secret
    with pytest.raises(RuntimeError, match="JWT_SECRET"):
        require_jwt_secret(value)


def test_accepts_random_jwt_configuration():
    from auth import require_jwt_secret
    key = secrets.token_hex(32)
    assert require_jwt_secret(key) == key


@pytest.mark.parametrize("missing", ["sub", "aid", "binding", "iat", "exp"])
def test_admin_token_requires_claims(client, auth_headers, missing):
    import jwt
    from auth import SECRET_KEY
    claims = jwt.decode(auth_headers["Authorization"].split(" ", 1)[1], SECRET_KEY, algorithms=["HS256"])
    del claims[missing]
    token = jwt.encode(claims, SECRET_KEY, algorithm="HS256")
    response = client.get("/api/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


def test_new_admin_token_expires_after_one_hour(client, auth_headers):
    import jwt
    from auth import SECRET_KEY
    token = auth_headers["Authorization"].split(" ", 1)[1]
    claims = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    assert claims["exp"] - claims["iat"] == 3600
    response = client.get("/api/admin/users", headers=auth_headers)
    assert response.status_code == 200
    assert response.headers["cache-control"] == "no-store"


# Every admin route must reject anonymous and invalid credentials. Discover
# routes from the application so future additions automatically get tested.
import re
from fastapi.routing import APIRoute


ADMIN_ROUTES = [
    (method, re.sub(r"\{[^}]+\}", "1", route.path))
    for route in main.app.routes
    if isinstance(route, APIRoute) and route.path.startswith("/api/admin/")
    for method in sorted(route.methods)
]


@pytest.mark.parametrize("method,path", ADMIN_ROUTES)
@pytest.mark.parametrize("token", [None, "invalid-token"])
def test_admin_routes_reject_unauthorized(client, method, path, token):
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    kwargs = {"headers": headers, "params": {"setting_key": "logo_url"}}
    if "upload" in path:
        kwargs["files"] = {"file": ("test.png", _png_bytes(), "image/png")}
    elif method in {"POST", "PUT", "PATCH"}:
        kwargs["json"] = {}
    response = client.request(method, path, **kwargs)
    assert response.status_code == 401, (method, path, response.status_code, response.text)
    assert response.headers.get("cache-control") == "no-store"


def test_admin_user_response_excludes_password_hash(client, auth_headers):
    response = client.get("/api/admin/users", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()
    assert all(set(user) == {"id", "username", "is_active"} for user in response.json())


def test_expired_and_invalid_signature_rejected(client, auth_headers):
    import jwt
    from datetime import timedelta
    from auth import SECRET_KEY
    with SessionLocal() as db:
        admin = db.query(AdminUser).filter_by(username="tester").one()
        expired = create_access_token(admin, timedelta(minutes=-1))
    claims = jwt.decode(auth_headers["Authorization"].split(" ", 1)[1], SECRET_KEY, algorithms=["HS256"])
    invalid = jwt.encode(claims, secrets.token_hex(32), algorithm="HS256")
    for token in (expired, invalid):
        assert client.get("/api/admin/users", headers={"Authorization": f"Bearer {token}"}).status_code == 401


def test_admin_token_bound_to_account_and_password(client, auth_headers):
    import jwt
    from auth import SECRET_KEY
    with SessionLocal() as db:
        account = AdminUser(username="binding-test", password_hash=hash_password("test-password-123"), is_active=True)
        db.add(account)
        db.commit()
        account_id = account.id
        old = create_access_token(account)
    headers = {"Authorization": f"Bearer {old}"}
    try:
        assert client.get("/api/admin/users", headers=headers).status_code == 200
        changed = client.put(f"/api/admin/users/{account_id}", json={"password": "new-test-password-456"}, headers=auth_headers)
        assert changed.status_code == 200
        assert client.get("/api/admin/users", headers=headers).status_code == 401
        with SessionLocal() as db:
            new_token = create_access_token(db.get(AdminUser, account_id))
        new_headers = {"Authorization": f"Bearer {new_token}"}
        assert client.get("/api/admin/users", headers=new_headers).status_code == 200
        claims = jwt.decode(new_token, SECRET_KEY, algorithms=["HS256"])
        claims["aid"] += 1
        wrong = jwt.encode(claims, SECRET_KEY, algorithm="HS256")
        assert client.get("/api/admin/users", headers={"Authorization": f"Bearer {wrong}"}).status_code == 401
        assert client.put(f"/api/admin/users/{account_id}", json={"is_active": False}, headers=auth_headers).status_code == 200
        assert client.get("/api/admin/users", headers=new_headers).status_code == 401
    finally:
        with SessionLocal() as db:
            row = db.get(AdminUser, account_id)
            if row:
                db.delete(row)
                db.commit()


def test_public_draft_blog_is_hidden(client, auth_headers):
    slug = "private-" + secrets.token_hex(8)
    result = client.post("/api/admin/blog", json={
        "title": "Private article", "slug": slug, "content": "Draft only", "is_published": False
    }, headers=auth_headers)
    assert result.status_code == 200
    try:
        assert client.get(f"/api/blog/{slug}").status_code == 404
        assert slug not in client.get("/api/seo/posts").json()
        assert all(post["slug"] != slug for post in client.get("/api/blog").json())
    finally:
        assert client.delete(f"/api/admin/blog/{result.json()['id']}", headers=auth_headers).status_code == 200


def test_public_review_cannot_publish_itself(client, auth_headers):
    name = "review-" + secrets.token_hex(8)
    result = client.post("/api/reviews", json={
        "client_name": name, "review": "Test moderation", "rating": 5,
        "is_published": True, "display_order": 999
    })
    assert result.status_code == 200
    try:
        assert result.json()["is_published"] is False
        assert result.json()["display_order"] == 0
        assert all(review["client_name"] != name for review in client.get("/api/reviews").json())
    finally:
        assert client.delete(f"/api/admin/reviews/{result.json()['id']}", headers=auth_headers).status_code == 200


def test_admin_login_issues_bound_token(client):
    response = client.post("/api/auth/login", data={"username": "tester", "password": "pw"})
    assert response.status_code == 200, response.text
    assert client.get("/api/admin/users", headers={
        "Authorization": "Bearer " + response.json()["access_token"]
    }).status_code == 200


# Persistent rate limit tests share the existing isolated test database.
import rate_limit
from models import RateLimitBucket
from fastapi import HTTPException, Request


@pytest.fixture
def rate_clock(monkeypatch):
    now = [1800000000]
    monkeypatch.setattr(rate_limit, "time", lambda: now[0])
    monkeypatch.delenv("VERCEL", raising=False)
    with SessionLocal.begin() as db:
        db.query(RateLimitBucket).delete()
    yield now
    with SessionLocal.begin() as db:
        db.query(RateLimitBucket).delete()


@pytest.mark.parametrize("scope,limit,seconds", [
    ("login-ip", 5, 60), ("login-account", 10, 900),
    ("contact", 5, 600), ("review", 3, 600), ("offer", 20, 60),
])
def test_rate_limit_atomic_count_and_reset(rate_clock, scope, limit, seconds):
    for _ in range(limit):
        rate_limit.consume(scope, "identity", limit, seconds)
    with pytest.raises(HTTPException) as error:
        rate_limit.consume(scope, "identity", limit, seconds)
    assert error.value.status_code == 429
    assert int(error.value.headers["Retry-After"]) == seconds
    with SessionLocal() as db:
        row = db.query(RateLimitBucket).one()
        assert row.count == limit
        assert row.key != "identity"
    rate_clock[0] += seconds
    rate_limit.consume(scope, "identity", limit, seconds)


def test_concurrent_rate_limit_requests(rate_clock):
    from concurrent.futures import ThreadPoolExecutor

    def attempt(_):
        try:
            rate_limit.consume("parallel", "same-client", 5, 60)
            return 200
        except HTTPException as error:
            return error.status_code

    with ThreadPoolExecutor(max_workers=8) as pool:
        statuses = list(pool.map(attempt, range(24)))
    assert statuses.count(200) == 5
    assert statuses.count(429) == 19


def test_rate_limit_scope_and_identity_isolation(rate_clock):
    rate_limit.consume("login", "a", 1, 60)
    rate_limit.consume("login", "b", 1, 60)
    rate_limit.consume("contact", "a", 1, 60)
    with pytest.raises(HTTPException) as error:
        rate_limit.consume("login", "a", 1, 60)
    assert error.value.status_code == 429


def test_cleanup_preserves_live_counters(rate_clock):
    rate_limit.consume("short", "a", 1, 60)
    rate_limit.consume("long", "a", 1, 900)
    rate_clock[0] += 60
    rate_limit.cleanup_expired(rate_clock[0])
    with SessionLocal() as db:
        assert db.query(RateLimitBucket).count() == 1
    with pytest.raises(HTTPException) as error:
        rate_limit.consume("long", "a", 1, 900)
    assert error.value.status_code == 429


def test_rate_limit_database_failure_is_closed(rate_clock, monkeypatch):
    from sqlalchemy.exc import OperationalError
    def unavailable():
        raise OperationalError("test", {}, Exception("private detail"))
    # Restore the shared session factory before rate_clock's teardown.
    with monkeypatch.context() as patch:
        patch.setattr(rate_limit.SessionLocal, "begin", unavailable)
        with pytest.raises(HTTPException) as error:
            rate_limit.consume("login", "a", 5, 60)
        assert error.value.status_code == 503
        assert "private detail" not in error.value.detail


def test_rate_limit_proxy_identity(rate_clock, monkeypatch):
    request = Request({
        "type": "http", "client": ("192.0.2.1", 12345),
        "headers": [(b"x-forwarded-for", b"192.0.2.9"), (b"x-vercel-forwarded-for", b"198.51.100.1")],
    })
    assert rate_limit.client_identity(request) == "192.0.2.1"
    monkeypatch.setenv("VERCEL", "1")
    assert rate_limit.client_identity(request) == "198.51.100.1"
    assert rate_limit.client_identity(Request({"type": "http", "headers": []})) == "unknown"


def test_login_ip_limit_counts_failed_attempts(client, rate_clock):
    for _ in range(5):
        response = client.post("/api/auth/login", data={"username": "tester", "password": "incorrect"})
        assert response.status_code == 401
    response = client.post("/api/auth/login", data={"username": "tester", "password": "pw"})
    assert response.status_code == 429
    assert response.headers["retry-after"] == "60"
    rate_clock[0] += 60
    assert client.post("/api/auth/login", data={"username": "tester", "password": "pw"}).status_code == 200


def test_login_account_limit_across_ip_windows(client, rate_clock):
    for minute in range(2):
        for _ in range(5):
            assert client.post("/api/auth/login", data={"username": "nonexistent", "password": "incorrect"}).status_code == 401
        rate_clock[0] += 60
    response = client.post("/api/auth/login", data={"username": "nonexistent", "password": "incorrect"})
    assert response.status_code == 429
    assert int(response.headers["retry-after"]) == 780


@pytest.mark.parametrize("path,method,limit,payload", [
    ("/api/contact", "POST", 5, {"name": "Rate test", "phone": "12345", "email": "rate@example.com"}),
    ("/api/reviews", "POST", 3, {"client_name": "Rate test", "review": "Test only"}),
    ("/api/offers/validate?code=INVALID-TEST", "GET", 20, None),
])
def test_public_endpoint_rate_limits(client, rate_clock, monkeypatch, path, method, limit, payload):
    monkeypatch.setattr(main.resend.Emails, "send", lambda *_: {})
    try:
        for _ in range(limit):
            response = client.request(method, path, **({"json": payload} if payload else {}))
            assert response.status_code == (200 if payload else 404), response.text
        response = client.request(method, path, **({"json": payload} if payload else {}))
        assert response.status_code == 429
        assert "retry-after" in response.headers
        assert response.headers["cache-control"] == "no-store"
    finally:
        with SessionLocal.begin() as db:
            db.query(main.ContactEnquiry).filter_by(name="Rate test").delete()
            db.query(main.ClientReview).filter_by(client_name="Rate test").delete()


# SQL injection regression tests. All requests target the isolated TestClient.
# Inputs are deliberately treated as data, never executed as SQL.
SQL_LIKE_INPUTS = ["O'Reilly", "' OR '1'='1", "test' --"]


@pytest.mark.parametrize("value", SQL_LIKE_INPUTS)
def test_sql_like_login_input_does_not_authenticate(client, rate_clock, value):
    response = client.post("/api/auth/login", data={
        "username": value, "password": "pw",
    })
    assert response.status_code == 401
    assert "access_token" not in response.json()
    assert client.post("/api/auth/login", data={
        "username": "tester", "password": "pw",
    }).status_code == 200


@pytest.fixture
def sql_test_offer():
    code = "SQLTEST-" + secrets.token_hex(8).upper()
    with SessionLocal.begin() as db:
        offer = main.Offer(
            title="SQL regression fixture", offer_code=code,
            start_date="2000-01-01T00:00:00+00:00",
            end_date="2099-01-01T00:00:00+00:00",
            is_active=True, created_at="2000-01-01",
        )
        db.add(offer)
    yield code
    with SessionLocal.begin() as db:
        db.query(main.Offer).filter_by(offer_code=code).delete()


@pytest.mark.parametrize("value", SQL_LIKE_INPUTS)
def test_offer_validation_requires_exact_code(client, rate_clock, sql_test_offer, value):
    assert client.get("/api/offers/validate", params={"code": value}).status_code == 404
    response = client.get("/api/offers/validate", params={"code": sql_test_offer})
    assert response.status_code == 200
    assert response.json()["offer_code"] == sql_test_offer


@pytest.mark.parametrize("value", SQL_LIKE_INPUTS)
def test_blog_lookup_does_not_bypass_publication_filter(client, auth_headers, value):
    from urllib.parse import quote
    slug = "sql-regression-" + secrets.token_hex(8)
    with SessionLocal.begin() as db:
        db.add(main.models.BlogPost(
            title="Private fixture", slug=slug, content="Not public",
            is_published=False,
        ))
    try:
        assert client.get("/api/blog/" + quote(value, safe="")).status_code == 404
        assert client.get("/api/blog/" + slug).status_code == 404
        assert slug not in client.get("/api/seo/posts").json()
    finally:
        with SessionLocal.begin() as db:
            db.query(main.models.BlogPost).filter_by(slug=slug).delete()


def test_sql_like_numeric_id_rejected(client, auth_headers):
    from urllib.parse import quote
    response = client.get(
        "/api/admin/contact/" + quote("1 OR 1=1", safe=""),
        headers=auth_headers,
    )
    assert response.status_code == 422


def test_contact_coupon_does_not_match_unrelated_offer(client, rate_clock, sql_test_offer, monkeypatch):
    monkeypatch.setattr(main.resend.Emails, "send", lambda *_: {})
    with SessionLocal() as db:
        before = db.query(main.ContactEnquiry).count()
    response = client.post("/api/contact", json={
        "name": "SQL fixture", "phone": "12345", "email": "fixture@example.com",
        "coupon": "' OR '1'='1",
    })
    assert response.status_code == 400
    with SessionLocal() as db:
        assert db.query(main.ContactEnquiry).count() == before


def test_sql_like_text_roundtrips_as_data(client, auth_headers):
    slug = "sql-literal-" + secrets.token_hex(8)
    title = "O'Reilly; SELECT example"
    content = "Research notes: ' OR '1'='1"
    result = client.post("/api/admin/blog", headers=auth_headers, json={
        "title": title, "slug": slug, "content": content, "is_published": True,
    })
    assert result.status_code == 200, result.text
    try:
        response = client.get("/api/blog/" + slug)
        assert response.status_code == 200
        assert response.json()["title"] == title
        assert response.json()["content"] == content
        assert client.get("/api/admin/users", headers=auth_headers).status_code == 200
    finally:
        assert client.delete(
            f"/api/admin/blog/{result.json()['id']}", headers=auth_headers
        ).status_code == 200


def test_file_lookup_treats_identifier_as_data(client):
    from urllib.parse import quote
    # Exactly 32 characters before the extension to exercise the database lookup.
    name = ("test' OR '1'='1").ljust(32, "x") + ".png"
    assert client.get("/api/files/site/" + quote(name, safe="")).status_code == 404


def test_new_raw_sql_execution_requires_explicit_review():
    """Conservative AST guard, not a complete taint-analysis engine."""
    import ast
    from pathlib import Path

    root = Path(BACKEND_DIR)
    allowed_pragmas = {"PRAGMA journal_mode=WAL;", "PRAGMA busy_timeout=5000;"}
    violations = []
    for path in sorted(root.rglob("*.py")):
        relative = path.relative_to(root)
        if any(part.startswith(".") or part in {"tests", "venv", "__pycache__", "site-packages", "uploads"} for part in relative.parts):
            continue
        tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(relative))
        for node in ast.walk(tree):
            if not isinstance(node, ast.Call):
                continue
            name = node.func.attr if isinstance(node.func, ast.Attribute) else node.func.id if isinstance(node.func, ast.Name) else ""
            if name in {"text", "literal_column", "exec_driver_sql", "executemany", "from_statement"}:
                violations.append(f"{relative}:{node.lineno}: {name}")
            elif name == "execute":
                # Current reviewed exceptions: constant SQLite PRAGMAs and
                # SQLAlchemy expression objects in the rate limiter.
                arg = node.args[0] if node.args else None
                if str(relative) == "database.py" and isinstance(arg, ast.Constant) and isinstance(arg.value, str) and arg.value in allowed_pragmas:
                    continue
                if str(relative) == "rate_limit.py" and arg is not None and ast.unparse(arg) in {
                    "stmt",
                    "delete(table).where(tuple_(table.c.key, table.c.window_start).in_(expired), table.c.expires_at <= now)",
                }:
                    continue
                violations.append(f"{relative}:{node.lineno}: execute")
    assert not violations, "New SQL execution requires review: " + "; ".join(violations)
