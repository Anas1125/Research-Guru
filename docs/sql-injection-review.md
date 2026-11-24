# SQL injection review

Reviewed the backend Python source at main commit 7b04b3a: auth.py, create_admin.py, database.py, main.py, models.py, rate_limit.py, schemas.py and storage.py. No user-controlled raw SQL construction identified. Login, blog slugs, offer validation, contact coupons, settings, admin resource IDs and stored-file IDs use SQLAlchemy ORM bound values. Rate-limit operations use dialect-specific SQLAlchemy insert/upsert and delete expressions. SQLite setup uses two constant PRAGMAs. No application search query or client-controlled SQL ordering is currently exposed.

No production query rewrite is necessary for these findings. Keep data values parameterized; never interpolate user input into SQL or SQL identifiers. For future dynamic sort/filter fields, use explicit mappings to ORM columns. Do not reject ordinary apostrophes or strip SQL keywords from user content: parameterization is the correct defense.

The regression suite uses the existing isolated test database and TestClient. It covers login, coupon and offer lookups, blog visibility, integer URL validation, stored file IDs, and literal text storage. A conservative AST regression guard flags new raw SQL helpers and unreviewed execute calls; it is not complete static taint analysis. Any new exceptions need code review rather than blanket suppression.

Run with TEST_DATABASE_URL unset for temporary SQLite. For PostgreSQL verification use a disposable test database only, never production. No runtime, schema, environment or dependency changes in this PR. This review does not establish immunity to all injection classes, XSS, or future vulnerabilities.
