from app.core.security import create_session, decode_session, hash_password, verify_password


def test_password_hash_round_trip() -> None:
    encoded = hash_password("a-long-customer-password")
    assert "a-long-customer-password" not in encoded
    assert verify_password("a-long-customer-password", encoded)
    assert not verify_password("wrong-password", encoded)


def test_signed_session_round_trip() -> None:
    payload = decode_session(create_session("customer-id", "customer"))
    assert payload["sub"] == "customer-id"
    assert payload["role"] == "customer"
