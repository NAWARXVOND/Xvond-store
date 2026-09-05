import pytest

from app.api.session_status import router, session_status


def test_guest_safe_session_route_is_registered() -> None:
    paths = {route.path for route in router.routes if hasattr(route, "path")}
    assert "/auth/session" in paths


@pytest.mark.asyncio
async def test_signed_out_session_returns_guest_snapshot_without_401() -> None:
    result = await session_status(session=object(), session_cookie=None)  # type: ignore[arg-type]
    assert result == {"authenticated": False, "profile": None}
