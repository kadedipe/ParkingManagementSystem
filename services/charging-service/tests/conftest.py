import os
import sys
from pathlib import Path

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

# Ensure the charging service package is importable when pytest runs from repo root.
SERVICE_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVICE_ROOT))

from src.core.database import Base, get_db
from src.main import app


@pytest_asyncio.fixture
async def db_session():
    """Provide an isolated async SQLite session for each test."""
    engine = create_async_engine(
        "sqlite+aiosqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    session_factory = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    # Import models before creating tables so Base.metadata is complete.
    from src.domain.models import charging_session, charging_station, connector  # noqa: F401

    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

    async with session_factory() as session:
        yield session

    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def client(db_session):
    """Provide an async HTTP client backed by the async test DB session."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def test_charging_station_data():
    return {
        "name": "Test Charging Station",
        "address": {"street": "456 Test Ave", "city": "Test City"},
        "connectors": [
            {"type": "ccs", "max_power_kw": 150},
            {"type": "type2", "max_power_kw": 22},
        ],
        "price_per_kwh": 0.50,
    }
