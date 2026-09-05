from app.api.session_status import router


def test_guest_safe_session_route_is_registered() -> None:
    paths = {route.path for route in router.routes if hasattr(route, "path")}
    assert "/auth/session" in paths
