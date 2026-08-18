import sys
import os
from pathlib import Path

# Add the parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Now import after path fix
from src.main import app
from src.core.database import Base, get_db

# Get worker ID for parallel tests
try:
    from xdist import is_xdist_worker, get_xdist_worker_id
    if is_xdist_worker():
        worker_id = get_xdist_worker_id()
        db_file = f"test_{worker_id}.db"
    else:
        db_file = "test.db"
except:
    db_file = "test.db"

# Test database - use different files for different workers
SQLALCHEMY_DATABASE_URL = f"sqlite:///./{db_file}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def client():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create test client
    with TestClient(app) as test_client:
        yield test_client
    
    # Clean up
    Base.metadata.drop_all(bind=engine)
    engine.dispose()

@pytest.fixture
def test_user_data():
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123",
        "full_name": "Test User",
        "phone_number": "+1-555-123-4567"
    }