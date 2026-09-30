import pytest
from fastapi import HTTPException

from app.services.process_lifecycle import validate_process_transition


@pytest.mark.parametrize(
    ("current_state", "new_state"),
    [
        ("EN_PROCESO", "PAUSADO"),
        ("EN_PROCESO", "FINALIZADO"),
        ("PAUSADO", "EN_PROCESO"),
        ("PAUSADO", "FINALIZADO"),
    ],
)
def test_valid_process_transitions_are_accepted(
    current_state: str,
    new_state: str,
) -> None:
    validate_process_transition(current_state, new_state)


@pytest.mark.parametrize("final_state", ["FINALIZADO", "CANCELADO"])
def test_final_process_cannot_be_reactivated(final_state: str) -> None:
    with pytest.raises(HTTPException) as error:
        validate_process_transition(final_state, "EN_PROCESO")

    assert error.value.status_code == 409


def test_same_state_is_idempotent() -> None:
    validate_process_transition("EN_PROCESO", "EN_PROCESO")
