from app.main import app


def test_guest_safe_session_route_is_registered() -> None:
    paths = {route.path for route in app.routes if hasattr(route, "path")}
    assert "/api/v1/auth/session" in paths
