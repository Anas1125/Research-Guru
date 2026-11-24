"""Trust Cloudflare client identity only on authenticated proxy requests."""
import hmac
import os

from fastapi import HTTPException, Request

FRONTEND_ORIGIN = "https://research-guru.pages.dev"


def trusted_proxy(request: Request) -> bool:
    secret = os.getenv("ADMIN_PROXY_SECRET", "")
    supplied = request.headers.get("x-rg-proxy-secret", "")
    return len(secret) >= 32 and hmac.compare_digest(
        supplied.encode("utf-8"), secret.encode("utf-8")
    )


def require_cookie_proxy(request: Request):
    if not trusted_proxy(request):
        raise HTTPException(403, "Trusted frontend proxy required.")
    if request.method not in {"GET", "HEAD", "OPTIONS"}:
        if (request.headers.get("origin") != FRONTEND_ORIGIN
                or request.headers.get("x-rg-csrf") != "1"):
            raise HTTPException(403, "Invalid request origin.")
