from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_token,
    verify_password,
)


def test_password_is_hashed_and_verified() -> None:
    password = "CafeSeguro123"
    password_hash = hash_password(password)

    assert password_hash != password
    assert verify_password(password, password_hash)
    assert not verify_password("Incorrecta123", password_hash)


def test_access_token_contains_expected_data() -> None:
    token, _ = create_access_token(
        subject=7,
        role="PRODUCTOR",
    )
    payload = decode_token(token, expected_type="access")

    assert payload is not None
    assert payload["sub"] == "7"
    assert payload["role"] == "PRODUCTOR"


def test_refresh_token_cannot_be_used_as_access_token() -> None:
    token, _ = create_refresh_token(
        subject=7,
        role="PRODUCTOR",
    )

    assert decode_token(token, expected_type="access") is None
    assert decode_token(token, expected_type="refresh") is not None


def test_token_hash_is_stable_and_not_plaintext() -> None:
    token = "token-de-prueba"

    assert hash_token(token) == hash_token(token)
    assert hash_token(token) != token
