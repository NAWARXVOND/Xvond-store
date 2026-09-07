from __future__ import annotations

import hashlib
import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

_lock = threading.Lock()
_attempts: dict[str, deque[float]] = defaultdict(deque)


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def _safe_identifier(value: str) -> str:
    normalized = value.strip().lower()
    return hashlib.sha256(normalized.encode()).hexdigest()[:24]


def enforce_auth_rate_limit(
    request: Request,
    *,
    scope: str,
    identifier: str | None = None,
    limit: int,
    window_seconds: int = 60,
) -> None:
    """Small in-process limiter for the current single-worker storefront API.

    Keys use both the client address and a hash of the submitted identifier when
    available. This keeps the Temu-style identify step while making bulk account
    enumeration and password guessing materially harder.
    """

    client = _client_ip(request)
    suffix = f":{_safe_identifier(identifier)}" if identifier else ""
    key = f"{scope}:{client}{suffix}"
    now = time.monotonic()
    cutoff = now - window_seconds

    with _lock:
        bucket = _attempts[key]
        while bucket and bucket[0] <= cutoff:
            bucket.popleft()
        if len(bucket) >= limit:
            retry_after = max(1, int(window_seconds - (now - bucket[0])))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many authentication attempts. Try again shortly.",
                headers={"Retry-After": str(retry_after)},
            )
        bucket.append(now)
