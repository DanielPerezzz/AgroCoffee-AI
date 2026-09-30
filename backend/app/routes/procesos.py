from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError

from app.api.access import ensure_owner_or_admin, is_administrator
from app.api.dependencies import CurrentUser, DatabaseSession
from app.models.dispositivo import Dispositivo
from app.models.lote_cafe import LoteCafe
from app.models.proceso_secado import ProcesoSecado
from app.schemas.proceso_secado import (
    ProcesoSecadoCreate,
    ProcesoSecadoResponse,
    ProcesoSecadoUpdate,
)
from app.services.subscriptions import ensure_process_capacity
from app.services.process_lifecycle import validate_process_transition


router = APIRouter(prefix="/procesos", tags=["Procesos de secado"])
ACTIVE_STATES = {"EN_PROCESO", "PAUSADO"}
FINAL_STATES = {"FINALIZADO", "CANCELADO"}


async def get_process_or_404(
    process_id: int,
    db: DatabaseSession,
) -> ProcesoSecado:
    proceso = await db.get(ProcesoSecado, process_id)
    if proceso is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proceso de secado no encontrado",
        )
    return proceso


async def get_authorized_batch(
    batch_id: int,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> LoteCafe:
    lote = await db.get(LoteCafe, batch_id)
    if lote is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lote de café no encontrado",
        )
    ensure_owner_or_admin(lote.id_usuario, current_user, "lote")
    return lote


async def get_device_for_batch_or_error(
    device_id: int,
    lote: LoteCafe,
    db: DatabaseSession,
) -> Dispositivo:
    dispositivo = await db.get(Dispositivo, device_id)
    if dispositivo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dispositivo no encontrado",
        )
    if dispositivo.estado != "ACTIVO":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El dispositivo seleccionado no está activo",
        )
    if (
        dispositivo.id_usuario is None
        or dispositivo.id_usuario != lote.id_usuario
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El dispositivo no pertenece al propietario del lote",
        )
    return dispositivo


@router.get("", response_model=list[ProcesoSecadoResponse])
async def list_processes(
    db: DatabaseSession,
    current_user: CurrentUser,
    batch_id: int | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[ProcesoSecado]:
    query = select(ProcesoSecado).join(LoteCafe)
    if not is_administrator(current_user):
        query = query.where(LoteCafe.id_usuario == current_user.id_usuario)
    if batch_id is not None:
        query = query.where(ProcesoSecado.id_lote == batch_id)
    result = await db.scalars(
        query.order_by(ProcesoSecado.id_proceso)
        .offset(max(skip, 0))
        .limit(min(max(limit, 1), 100))
    )
    return list(result)


@router.post(
    "",
    response_model=ProcesoSecadoResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_process(
    data: ProcesoSecadoCreate,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> ProcesoSecado:
    await ensure_process_capacity(db, current_user)
    lote = await get_authorized_batch(data.id_lote, db, current_user)
    await get_device_for_batch_or_error(data.id_dispositivo, lote, db)
    active_process = await db.scalar(
        select(ProcesoSecado).where(
            ProcesoSecado.estado.in_(ACTIVE_STATES),
            or_(
                ProcesoSecado.id_lote == data.id_lote,
                ProcesoSecado.id_dispositivo == data.id_dispositivo,
            ),
        )
    )
    if active_process is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El lote o dispositivo ya tiene un proceso de secado activo",
        )
    values = data.model_dump(exclude_none=True)
    proceso = ProcesoSecado(**values)
    db.add(proceso)
    await db.commit()
    await db.refresh(proceso)
    return proceso


@router.get("/{process_id}", response_model=ProcesoSecadoResponse)
async def read_process(
    process_id: int,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> ProcesoSecado:
    proceso = await get_process_or_404(process_id, db)
    await get_authorized_batch(proceso.id_lote, db, current_user)
    return proceso


@router.patch("/{process_id}", response_model=ProcesoSecadoResponse)
async def update_process(
    process_id: int,
    data: ProcesoSecadoUpdate,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> ProcesoSecado:
    proceso = await get_process_or_404(process_id, db)
    await get_authorized_batch(proceso.id_lote, db, current_user)
    changes = data.model_dump(exclude_unset=True)
    new_state = changes.get("estado")
    if new_state is not None:
        validate_process_transition(proceso.estado, new_state)

    target_state = new_state or proceso.estado
    if (
        target_state in FINAL_STATES
        and changes.get("fecha_fin", proceso.fecha_fin) is None
    ):
        changes["fecha_fin"] = datetime.now(timezone.utc)

    final_date = changes.get("fecha_fin", proceso.fecha_fin)
    if target_state in ACTIVE_STATES and final_date is not None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Un proceso activo no puede tener fecha de finalización",
        )
    if final_date is not None and final_date < proceso.fecha_inicio:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="La fecha final no puede ser anterior al inicio",
        )
    for field, value in changes.items():
        setattr(proceso, field, value)
    await db.commit()
    await db.refresh(proceso)
    return proceso


@router.delete("/{process_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_process(
    process_id: int,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> Response:
    proceso = await get_process_or_404(process_id, db)
    await get_authorized_batch(proceso.id_lote, db, current_user)
    await db.delete(proceso)
    try:
        await db.commit()
    except IntegrityError as error:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El proceso tiene mediciones asociadas",
        ) from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)
