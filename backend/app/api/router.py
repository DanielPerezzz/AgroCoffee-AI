from fastapi import APIRouter

from app.core.config import settings
from app.routes import (
    alertas,
    auth,
    dispositivos,
    ia,
    iot,
    lotes,
    mediciones,
    procesos,
    predicciones,
    sensores,
    usuarios,
)


api_router = APIRouter(prefix=settings.api_v1_prefix)
api_router.include_router(auth.router)
api_router.include_router(usuarios.router)
api_router.include_router(dispositivos.router)
api_router.include_router(sensores.router)
api_router.include_router(lotes.router)
api_router.include_router(procesos.router)
api_router.include_router(iot.router)
api_router.include_router(mediciones.router)
api_router.include_router(predicciones.router)
api_router.include_router(alertas.router)
api_router.include_router(ia.router)
