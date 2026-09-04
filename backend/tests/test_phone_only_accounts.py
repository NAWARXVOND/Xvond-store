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
