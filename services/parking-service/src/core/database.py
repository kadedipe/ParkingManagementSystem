from typing import AsyncGenerator
from sqlalchemy import MetaData
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker, AsyncEngine
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import StaticPool

from src.core.config import settings

metadata = MetaData(
    naming_convention={
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s",
    }
)

Base = declarative_base(metadata=metadata)

# Production uses PostgreSQL/asyncpg. Tests use in-memory SQLite/aiosqlite.
if settings.ENVIRONMENT == "test":
    DATABASE_URL = "sqlite+aiosqlite:///:memory:"
    engine: AsyncEngine = create_async_engine(
        DATABASE_URL,
        echo=False,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    DATABASE_URL = settings.DATABASE_URL
    engine = create_async_engine(
        DATABASE_URL,
        echo=settings.DB_ECHO,
        connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    )

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise

async def init_db() -> None:
    import src.domain.models  # noqa: F401
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    print("✅ Database initialized successfully!")

async def close_db() -> None:
    await engine.dispose()
    print("✅ Database connection closed")
