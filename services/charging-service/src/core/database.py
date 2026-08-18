from typing import AsyncGenerator
from sqlalchemy import MetaData
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker, AsyncEngine
from sqlalchemy.orm import declarative_base

from src.core.config import settings

# Create metadata with naming convention
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

# ============================================================================
# Database Engine
# ============================================================================

engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# ============================================================================
# Database Dependency
# ============================================================================

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise

# ============================================================================
# Initialization
# ============================================================================

async def init_db() -> None:
    async with engine.begin() as connection:
        # Import models here so SQLAlchemy knows about them
        try:
            from src.domain.models import charging_station, connector, charging_session  # noqa: F401
        except ImportError:
            pass

        await connection.run_sync(Base.metadata.create_all)

    print("✅ Database initialized successfully!")

# ============================================================================
# Shutdown
# ============================================================================

async def close_db() -> None:
    await engine.dispose()
    print("✅ Database connection closed")