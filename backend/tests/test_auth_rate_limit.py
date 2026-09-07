from starlette.requests import Request

from app.core import auth_rate_limit


def _request(path: str, method: str = "POST", client: tuple[str, int] = ("127.0.0.1", 12345)) -> Request:
    scope = {
        "type": "http",
        "http_version": "1.1",
        "method": method,
        "scheme": "http",
        "path": path,
        "raw_path": path.encode(),
        "query_string": b"",
        "headers": [],
        "client": client,
        "server": ("testserver", 80),
    }
    return Request(scope)


def setup_function() -> None:
    auth_rate_limit._attempts.clear()


def test_unrelated_route_is_not_limited() -> None:
    request = _request("/api/v1/catalog")
    assert auth_rate_limit.check_auth_rate_limit(request, "/api/v1") is None


def test_login_is_limited_after_ten_requests() -> None:
    request = _request("/api/v1/auth/login")
    for _ in range(10):
        assert auth_rate_limit.check_auth_rate_limit(request, "/api/v1") is None

    response = auth_rate_limit.check_auth_rate_limit(request, "/api/v1")
    assert response is not None
    assert response.status_code == 429
    assert response.headers["retry-after"]
    assert response.headers["cache-control"] == "no-store"


def test_limits_are_separate_per_client() -> None:
    first = _request("/api/v1/auth/password/forgot", client=("10.0.0.1", 1111))
    second = _request("/api/v1/auth/password/forgot", client=("10.0.0.2", 2222))

    for _ in range(5):
        assert auth_rate_limit.check_auth_rate_limit(first, "/api/v1") is None

    assert auth_rate_limit.check_auth_rate_limit(first, "/api/v1").status_code == 429
    assert auth_rate_limit.check_auth_rate_limit(second, "/api/v1") is None
