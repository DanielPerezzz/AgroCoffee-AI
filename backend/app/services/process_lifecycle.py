from fastapi import HTTPException, status


ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "EN_PROCESO": {"PAUSADO", "FINALIZADO", "CANCELADO"},
    "PAUSADO": {"EN_PROCESO", "FINALIZADO", "CANCELADO"},
    "FINALIZADO": set(),
    "CANCELADO": set(),
}


def validate_process_transition(current_state: str, new_state: str) -> None:
    if current_state == new_state:
        return

    allowed = ALLOWED_TRANSITIONS.get(current_state, set())
    if new_state not in allowed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"No se puede cambiar el proceso de {current_state} "
                f"a {new_state}"
            ),
        )
