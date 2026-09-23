from fastapi import APIRouter

from app.core.config import settings
from app.routes import (
    auth,
    dispositivos,
    lotes,
    procesos,
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
