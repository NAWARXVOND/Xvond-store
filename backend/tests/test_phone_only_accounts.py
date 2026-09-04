from app.api.phone_auth import phone_confirm
from app.api.router import api_router
from app.models.commerce import Customer
from app.schemas.auth import ProfileRead


def test_customer_email_is_optional_for_phone_only_accounts() -> None:
    assert Customer.__table__.c.email.nullable is True


def test_phone_only_profile_is_valid() -> None:
    profile = ProfileRead(
        id="00000000-0000-0000-0000-000000000001",
        full_name="Xvond Member",
        email=None,
        phone="+96891234567",
        email_verified=False,
    )
    assert profile.email is None
    assert profile.phone == "+96891234567"


def test_legacy_phone_verify_uses_phone_only_flow_first() -> None:
    verify_routes = [
        route
        for route in api_router.routes
        if getattr(route, "path", None) == "/auth/phone/verify"
        and "POST" in getattr(route, "methods", set())
    ]
    assert verify_routes
    assert verify_routes[0].endpoint is phone_confirm
