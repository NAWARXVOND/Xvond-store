from app.api.router import api_router


def test_guest_safe_session_route_is_registered() -> None:
    paths = {route.path for route in api_router.routes}
    assert "/auth/session" in paths
