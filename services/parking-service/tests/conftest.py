import os
import sys
import asyncio
from pathlib import Path
from uuid import uuid4

# Set this before importing src.main, because Settings is instantiated at import time.
os.environ["ENVIRONMENT"] = "test"

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import pytest
from fastapi.testclient import TestClient

from src.main import app
from src.core.database import Base, engine, AsyncSessionLocal, get_db

async def _create_tables():
    import src.domain.models  # noqa: F401
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def _drop_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

async def override_get_db():
    async with AsyncSessionLocal() as db:
        try:
            yield db
        except Exception:
            await db.rollback()
            raise

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def client():
    asyncio.run(_create_tables())
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        asyncio.run(_drop_tables())

@pytest.fixture
def test_parking_lot_data():
    return {
        "name": f"Test Parking Lot {uuid4().hex[:8]}",
        "address": {"street": "123 Test St", "city": "Test City"},
        "total_spots": 50,
        "price_per_hour": 5.00,
    }
