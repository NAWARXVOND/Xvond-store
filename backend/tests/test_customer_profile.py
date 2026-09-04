import uuid

from app.models.profile import CustomerProfile
from app.schemas.profile import ProfileDetailsUpdate


def test_customer_profile_supports_split_name_and_pending_email() -> None:
    profile = CustomerProfile(
        customer_id=uuid.uuid4(),
        first_name="Nawar",
        last_name="Xvond",
        pending_email="member@example.com",
    )
    assert profile.first_name == "Nawar"
    assert profile.last_name == "Xvond"
    assert profile.pending_email == "member@example.com"


def test_profile_update_requires_first_and_last_name() -> None:
    payload = ProfileDetailsUpdate(first_name="Nawar", last_name="Xvond")
    assert payload.first_name == "Nawar"
    assert payload.last_name == "Xvond"
