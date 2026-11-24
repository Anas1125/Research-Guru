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
def auth_headers():
    token = create_access_token({"sub": "tester"})
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


@pytest.mark.parametrize("missing", ["sub", "iat", "exp"])
def test_admin_token_requires_claims(client, missing):
    import jwt
    from datetime import datetime, timezone
    from auth import SECRET_KEY
    now = int(datetime.now(timezone.utc).timestamp())
    claims = {"sub": "tester", "iat": now, "exp": now + 600}
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
