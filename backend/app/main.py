from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.db.database import engine


app = FastAPI(
    title=settings.app_name,
    description=(
        "API para el monitoreo inteligente del proceso "
        "de secado de café"
    ),
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["General"])
async def read_root():
    return {
        "message": "Bienvenido a la API de AgroCoffee AI",
        "version": settings.app_version,
        "environment": settings.environment,
    }


@app.get(
    f"{settings.api_v1_prefix}/health",
    tags=["Health"],
)
async def health_check():
    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))

        return {
            "status": "ok",
            "service": "agrocoffee-api",
            "version": settings.app_version,
            "database": "connected",
        }

    except SQLAlchemyError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No fue posible conectar con la base de datos",
        ) from error