from __future__ import annotations

import threading
import time
from collections import defaultdict, deque

from fastapi import Request
from fastapi.responses import JSONResponse

_lock = threading.Lock()
_attempts: dict[str, deque[float]] = defaultdict(deque)

_AUTH_LIMITS: dict[tuple[str, str], tuple[int, int]] = {
    ("POST", "/auth/identify"): (30, 60),
    ("POST", "/auth/login"): (10, 60),
    ("POST", "/auth/password/forgot"): (5, 60),
    ("POST", "/auth/phone/start"): (5, 60),
    ("POST", "/auth/phone/confirm"): (10, 60),
    ("POST", "/auth/phone/verify"): (10, 60),
}


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def check_auth_rate_limit(request: Request, api_prefix: str) -> JSONResponse | None:
    """Rate-limit sensitive authentication routes for the current single-worker API.

    The storefront currently runs one Uvicorn worker, so an in-process sliding
    window is sufficient for this deployment shape. If the API is scaled to
    multiple workers or replicas, this should be moved to Redis or another shared
    store so all instances enforce the same counters.
    """

    path = request.url.path
    if path.startswith(api_prefix):
        relative_path = path[len(api_prefix):]
    else:
        relative_path = path

    rule = _AUTH_LIMITS.get((request.method.upper(), relative_path))
    if rule is None:
        return None

    limit, window_seconds = rule
    key = f"{request.method.upper()}:{relative_path}:{_client_ip(request)}"
    now = time.monotonic()
    cutoff = now - window_seconds

    with _lock:
        bucket = _attempts[key]
        while bucket and bucket[0] <= cutoff:
            bucket.popleft()
        if len(bucket) >= limit:
            retry_after = max(1, int(window_seconds - (now - bucket[0])))
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many authentication attempts. Try again shortly."},
                headers={"Retry-After": str(retry_after), "Cache-Control": "no-store"},
            )
        bucket.append(now)

    return None
