from datetime import datetime, timedelta, timezone

import pytest

from app.models.suscripcion import SUBSCRIPTION_PROGRESS, Suscripcion
from app.schemas.suscripcion import SuscripcionCreate
from app.services.subscriptions import subscription_is_active


def subscription(state: str, end_at: datetime | None = None) -> Suscripcion:
    return Suscripcion(
        id_usuario=1,
        id_plan=1,
        estado=state,
        fecha_fin=end_at,
    )


def test_active_subscription_with_future_expiration_grants_access() -> None:
    now = datetime.now(timezone.utc)
    current = subscription("ACTIVA", now + timedelta(days=5))
    assert subscription_is_active(current, now)


@pytest.mark.parametrize("state", ["SOLICITADA", "EN_REVISION", "VENCIDA"])
def test_non_active_states_do_not_grant_access(state: str) -> None:
    assert not subscription_is_active(subscription(state))


def test_expired_subscription_does_not_grant_access() -> None:
    now = datetime.now(timezone.utc)
    current = subscription("ACTIVA", now - timedelta(seconds=1))
    assert not subscription_is_active(current, now)


@pytest.mark.parametrize(
    ("state", "expected"),
    list(SUBSCRIPTION_PROGRESS.items()),
)
def test_subscription_progress_matches_contract_state(
    state: str,
    expected: int,
) -> None:
    assert subscription(state).progreso_porcentaje == expected


def test_subscription_request_requires_a_positive_plan_id() -> None:
    with pytest.raises(ValueError):
        SuscripcionCreate(id_plan=0)
