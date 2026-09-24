from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.api.access import ensure_owner_or_admin, is_administrator
from app.api.dependencies import CurrentUser, DatabaseSession
from app.models.lote_cafe import LoteCafe
from app.schemas.lote_cafe import LoteCafeCreate, LoteCafeResponse, LoteCafeUpdate


router = APIRouter(prefix="/lotes", tags=["Lotes de café"])


async def get_batch_or_404(batch_id: int, db: DatabaseSession) -> LoteCafe:
    lote = await db.get(LoteCafe, batch_id)
    if lote is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lote de café no encontrado",
        )
    return lote


@router.get("", response_model=list[LoteCafeResponse])
async def list_batches(
    db: DatabaseSession,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 50,
) -> list[LoteCafe]:
    query = select(LoteCafe).order_by(LoteCafe.id_lote)
    if not is_administrator(current_user):
        query = query.where(LoteCafe.id_usuario == current_user.id_usuario)
    result = await db.scalars(
        query.offset(max(skip, 0)).limit(min(max(limit, 1), 100))
    )
    return list(result)


@router.post("", response_model=LoteCafeResponse, status_code=status.HTTP_201_CREATED)
async def create_batch(
    data: LoteCafeCreate,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> LoteCafe:
    lote = LoteCafe(**data.model_dump(), id_usuario=current_user.id_usuario)
    db.add(lote)
    try:
        await db.commit()
    except IntegrityError as error:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un lote con ese código",
        ) from error
    await db.refresh(lote)
    return lote


@router.get("/{batch_id}", response_model=LoteCafeResponse)
async def read_batch(
    batch_id: int,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> LoteCafe:
    lote = await get_batch_or_404(batch_id, db)
    ensure_owner_or_admin(lote.id_usuario, current_user, "lote")
    return lote


@router.patch("/{batch_id}", response_model=LoteCafeResponse)
async def update_batch(
    batch_id: int,
    data: LoteCafeUpdate,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> LoteCafe:
    lote = await get_batch_or_404(batch_id, db)
    ensure_owner_or_admin(lote.id_usuario, current_user, "lote")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(lote, field, value)
    try:
        await db.commit()
    except IntegrityError as error:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un lote con ese código",
        ) from error
    await db.refresh(lote)
    return lote


@router.delete("/{batch_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_batch(
    batch_id: int,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> Response:
    lote = await get_batch_or_404(batch_id, db)
    ensure_owner_or_admin(lote.id_usuario, current_user, "lote")
    await db.delete(lote)
    try:
        await db.commit()
    except IntegrityError as error:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El lote tiene procesos de secado asociados",
        ) from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)
