from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.api.access import ensure_owner_or_admin, is_administrator
from app.api.dependencies import CurrentUser, DatabaseSession
from app.models.dispositivo import Dispositivo
from app.models.sensor import Sensor
from app.schemas.sensor import SensorCreate, SensorResponse, SensorUpdate


router = APIRouter(prefix="/sensores", tags=["Sensores"])


async def get_sensor_or_404(sensor_id: int, db: DatabaseSession) -> Sensor:
    sensor = await db.get(Sensor, sensor_id)
    if sensor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor no encontrado",
        )
    return sensor


async def get_authorized_device(
    device_id: int,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> Dispositivo:
    dispositivo = await db.get(Dispositivo, device_id)
    if dispositivo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dispositivo no encontrado",
        )
    ensure_owner_or_admin(dispositivo.id_usuario, current_user, "dispositivo")
    return dispositivo


@router.get("", response_model=list[SensorResponse])
async def list_sensors(
    db: DatabaseSession,
    current_user: CurrentUser,
    device_id: int | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[Sensor]:
    query = select(Sensor).join(Dispositivo)
    if not is_administrator(current_user):
        query = query.where(Dispositivo.id_usuario == current_user.id_usuario)
    if device_id is not None:
        query = query.where(Sensor.id_dispositivo == device_id)
    result = await db.scalars(
        query.order_by(Sensor.id_sensor)
        .offset(max(skip, 0))
        .limit(min(max(limit, 1), 100))
    )
    return list(result)


@router.post("", response_model=SensorResponse, status_code=status.HTTP_201_CREATED)
async def create_sensor(
    data: SensorCreate,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> Sensor:
    await get_authorized_device(data.id_dispositivo, db, current_user)
    sensor = Sensor(**data.model_dump())
    db.add(sensor)
    await db.commit()
    await db.refresh(sensor)
    return sensor


@router.get("/{sensor_id}", response_model=SensorResponse)
async def read_sensor(
    sensor_id: int,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> Sensor:
    sensor = await get_sensor_or_404(sensor_id, db)
    await get_authorized_device(sensor.id_dispositivo, db, current_user)
    return sensor


@router.patch("/{sensor_id}", response_model=SensorResponse)
async def update_sensor(
    sensor_id: int,
    data: SensorUpdate,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> Sensor:
    sensor = await get_sensor_or_404(sensor_id, db)
    await get_authorized_device(sensor.id_dispositivo, db, current_user)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(sensor, field, value)
    await db.commit()
    await db.refresh(sensor)
    return sensor


@router.delete("/{sensor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sensor(
    sensor_id: int,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> Response:
    sensor = await get_sensor_or_404(sensor_id, db)
    await get_authorized_device(sensor.id_dispositivo, db, current_user)
    await db.delete(sensor)
    try:
        await db.commit()
    except IntegrityError as error:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No fue posible eliminar el sensor",
        ) from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)
