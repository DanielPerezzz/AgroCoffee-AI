from collections.abc import AsyncGenerator

from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


def build_async_database_url():
    database_url = make_url(settings.database_url)

    if database_url.drivername in {"postgres", "postgresql"}:
        database_url = database_url.set(
            drivername="postgresql+psycopg"
        )

    return database_url


engine = create_async_engine(
    build_async_database_url(),
    pool_pre_ping=True,
    echo=settings.sql_echo,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session