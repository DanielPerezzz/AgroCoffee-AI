from fastapi import APIRouter

from app.core.config import settings
from app.routes import auth, usuarios


api_router = APIRouter(prefix=settings.api_v1_prefix)
api_router.include_router(auth.router)
api_router.include_router(usuarios.router)
