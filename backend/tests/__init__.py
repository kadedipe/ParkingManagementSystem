# ============================================================================
# Tests Package
# ============================================================================

"""
Tests package for the parking management system.

This package contains all test modules including unit tests, integration tests,
and end-to-end tests for the application.
"""

import os
import sys
from pathlib import Path

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Test configuration
TEST_ENVIRONMENT = "testing"
TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL", "sqlite:///./test.db")
TEST_REDIS_URL = os.environ.get("TEST_REDIS_URL", "redis://localhost:6379/15")

# Test constants
TEST_USER_ID = 1
TEST_VEHICLE_ID = 1
TEST_PARKING_SPOT_ID = 1
TEST_CHARGING_STATION_ID = 1
TEST_PAYMENT_ID = 1
TEST_NOTIFICATION_ID = 1

# Test data
TEST_USER_DATA = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "first_name": "Test",
    "last_name": "User",
    "phone": "+1234567890",
}

TEST_VEHICLE_DATA = {
    "license_plate": "TEST123",
    "state": "CA",
    "country": "US",
    "make": "Tesla",
    "model": "Model 3",
    "year": 2023,
    "color": "white",
    "vehicle_type": "ev",
    "fuel_type": "electric",
    "vehicle_size": "standard",
    "owner_id": 1,
}

TEST_PARKING_SPOT_DATA = {
    "spot_number": "A-101",
    "floor": 1,
    "section": "North",
    "spot_type": "standard",
    "status": "available",
    "access_level": "public",
    "location_id": 1,
}

TEST_CHARGING_STATION_DATA = {
    "station_name": "Test Station",
    "location_id": 1,
    "connector_type": "CCS",
    "power_rating_kw": 50,
    "status": "available",
    "charging_rate": 0.30,
}

TEST_PAYMENT_DATA = {
    "amount": 100.00,
    "currency": "USD",
    "payment_method": "credit_card",
    "description": "Test payment",
}

# ============================================================================
# Test Utilities
# ============================================================================

def get_test_settings():
    """
    Get test settings.
    
    Returns:
        Settings: Test settings instance
    """
    from src.shared.config import Settings
    
    class TestSettings(Settings):
        """Test settings with overrides."""
        
        ENVIRONMENT = "testing"
        DEBUG = True
        DATABASE_NAME = "test_parking_db"
        DATABASE_URL = TEST_DATABASE_URL
        REDIS_DB = 15
        REDIS_URL = TEST_REDIS_URL
        JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 5
        JWT_REFRESH_TOKEN_EXPIRE_DAYS = 1
        EMAIL_ENABLED = False
        SMS_ENABLED = False
        PAYMENT_ENABLED = False
        WEBHOOK_ENABLED = False
        NOTIFICATION_ENABLED = False
        ANALYTICS_ENABLED = False
        MONITORING_ENABLED = False
        RATE_LIMIT_ENABLED = False
        CACHE_ENABLED = False
        QUEUE_ENABLED = False
        LOG_LEVEL = "DEBUG"
        LOG_FILE = None
    
    return TestSettings()


def setup_test_environment():
    """
    Setup test environment.
    
    This function should be called before running tests to ensure
    the test environment is properly configured.
    """
    # Set environment variables
    os.environ["ENVIRONMENT"] = "testing"
    os.environ["DEBUG"] = "true"
    
    # Setup logging for tests
    import logging
    logging.basicConfig(level=logging.ERROR)
    
    # Suppress warnings
    import warnings
    warnings.filterwarnings("ignore", category=DeprecationWarning)
    warnings.filterwarnings("ignore", category=UserWarning)


def teardown_test_environment():
    """
    Teardown test environment.
    
    This function should be called after all tests have run to
    clean up any resources.
    """
    # Clean up any test resources
    pass


# ============================================================================
# Test Fixtures
# ============================================================================

class TestFixtures:
    """
    Test fixtures for common test data.
    """
    
    @staticmethod
    def create_test_user():
        """Create a test user."""
        from src.application.services.user_service import UserService
        from src.infrastructure.repositories.user_repository import UserRepository
        from src.infrastructure.database import get_db_session
        
        async def _create():
            async with get_db_session() as session:
                repo = UserRepository(session)
                service = UserService(repo)
                
                # Check if user exists
                user = await service.get_user_by_email(TEST_USER_DATA["email"])
                if user:
                    return user
                
                # Create user
                return await service.create_user(TEST_USER_DATA)
        
        import asyncio
        return asyncio.run(_create())
    
    @staticmethod
    def create_test_vehicle():
        """Create a test vehicle."""
        from src.application.services.vehicle_service import VehicleService
        from src.infrastructure.repositories.vehicle_repository import VehicleRepository
        from src.infrastructure.database import get_db_session
        
        async def _create():
            async with get_db_session() as session:
                repo = VehicleRepository(session)
                service = VehicleService(repo)
                
                # Create vehicle
                return await service.create_vehicle(TEST_VEHICLE_DATA)
        
        import asyncio
        return asyncio.run(_create())
    
    @staticmethod
    def create_test_parking_spot():
        """Create a test parking spot."""
        from src.application.services.parking_service import ParkingService
        from src.infrastructure.repositories.parking_repository import ParkingRepository
        from src.infrastructure.database import get_db_session
        
        async def _create():
            async with get_db_session() as session:
                repo = ParkingRepository(session)
                service = ParkingService(repo)
                
                # Create parking spot
                return await service.create_spot(TEST_PARKING_SPOT_DATA)
        
        import asyncio
        return asyncio.run(_create())


# ============================================================================
# Test Helpers
# ============================================================================

class TestHelpers:
    """
    Helper functions for tests.
    """
    
    @staticmethod
    def generate_test_id() -> str:
        """
        Generate a unique test ID.
        
        Returns:
            str: Unique test ID
        """
        import uuid
        return f"test_{uuid.uuid4().hex[:8]}"
    
    @staticmethod
    def create_test_data(data: dict, prefix: str = "test") -> dict:
        """
        Create test data with unique identifiers.
        
        Args:
            data: Base data dictionary
            prefix: Prefix for unique fields
            
        Returns:
            dict: Data with unique fields
        """
        result = data.copy()
        
        # Generate unique identifiers
        import uuid
        uid = uuid.uuid4().hex[:8]
        
        # Update unique fields
        for key in ["username", "email", "license_plate", "spot_number"]:
            if key in result:
                result[key] = f"{prefix}_{uid}_{result[key]}"
        
        return result
    
    @staticmethod
    def assert_response_equal(response, expected, exclude=None):
        """
        Assert that a response matches expected data.
        
        Args:
            response: Response object
            expected: Expected data
            exclude: Fields to exclude from comparison
        """
        if exclude is None:
            exclude = ["id", "created_at", "updated_at"]
        
        response_data = response.model_dump() if hasattr(response, "model_dump") else response
        
        for key, value in expected.items():
            if key in exclude:
                continue
            assert response_data.get(key) == value, f"Field {key} mismatch: {response_data.get(key)} != {value}"
    
    @staticmethod
    def assert_valid_response(response, expected_status=200):
        """
        Assert that a response is valid.
        
        Args:
            response: Response object
            expected_status: Expected HTTP status
        """
        assert response is not None, "Response is None"
        if hasattr(response, "status_code"):
            assert response.status_code == expected_status, f"Status code mismatch: {response.status_code} != {expected_status}"
    
    @staticmethod
    def async_to_sync(async_func, *args, **kwargs):
        """
        Run an async function synchronously.
        
        Args:
            async_func: Async function to run
            *args: Positional arguments
            **kwargs: Keyword arguments
            
        Returns:
            Any: Function result
        """
        import asyncio
        
        try:
            loop = asyncio.get_running_loop()
            # If we're already in an event loop, create a new one
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(asyncio.run, async_func(*args, **kwargs))
                return future.result()
        except RuntimeError:
            # No running event loop
            return asyncio.run(async_func(*args, **kwargs))
    
    @staticmethod
    def mock_request():
        """
        Create a mock request for testing.
        
        Returns:
            Request: Mock request object
        """
        from fastapi import Request
        from starlette.datastructures import Headers, QueryParams
        
        class MockRequest:
            def __init__(self):
                self.url = "http://test.com/api/test"
                self.method = "GET"
                self.headers = Headers({})
                self.query_params = QueryParams({})
                self.path_params = {}
                self.client = {"host": "127.0.0.1", "port": 8000}
                self.state = {}
            
            async def body(self):
                return b""
        
        return MockRequest()


# ============================================================================
# Test Database
# ============================================================================

class TestDatabase:
    """
    Test database utilities.
    """
    
    @staticmethod
    async def create_test_database():
        """
        Create test database.
        """
        from src.infrastructure.database import engine, Base
        
        # Create all tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    
    @staticmethod
    async def drop_test_database():
        """
        Drop test database.
        """
        from src.infrastructure.database import engine, Base
        
        # Drop all tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
    
    @staticmethod
    async def clean_test_database():
        """
        Clean test database (truncate all tables).
        """
        from src.infrastructure.database import engine
        
        async with engine.begin() as conn:
            # Get all table names
            tables = await conn.run_sync(
                lambda conn: conn.dialect.get_table_names(conn)
            )
            
            # Truncate all tables
            for table in tables:
                if table != "alembic_version":
                    await conn.execute(f"TRUNCATE TABLE {table} CASCADE")
    
    @staticmethod
    async def get_session():
        """
        Get a test database session.
        
        Returns:
            Session: Database session
        """
        from src.infrastructure.database import get_db_session
        
        async for session in get_db_session():
            return session


# ============================================================================
# Test Client
# ============================================================================

class TestClient:
    """
    Test client for API testing.
    """
    
    def __init__(self, app):
        """
        Initialize test client.
        
        Args:
            app: FastAPI application
        """
        from fastapi.testclient import TestClient as FastAPITestClient
        
        self.client = FastAPITestClient(app)
        self.headers = {}
        self.auth_token = None
    
    def set_auth_token(self, token: str):
        """
        Set authentication token for requests.
        
        Args:
            token: JWT token
        """
        self.auth_token = token
        if token:
            self.headers["Authorization"] = f"Bearer {token}"
        else:
            self.headers.pop("Authorization", None)
    
    def set_header(self, key: str, value: str):
        """
        Set a header for requests.
        
        Args:
            key: Header key
            value: Header value
        """
        self.headers[key] = value
    
    def remove_header(self, key: str):
        """
        Remove a header.
        
        Args:
            key: Header key
        """
        self.headers.pop(key, None)
    
    def get(self, path: str, **kwargs):
        """
        Send a GET request.
        
        Args:
            path: Request path
            **kwargs: Additional arguments
            
        Returns:
            Response: Response object
        """
        return self.client.get(path, headers=self.headers, **kwargs)
    
    def post(self, path: str, data=None, json=None, **kwargs):
        """
        Send a POST request.
        
        Args:
            path: Request path
            data: Form data
            json: JSON data
            **kwargs: Additional arguments
            
        Returns:
            Response: Response object
        """
        return self.client.post(path, headers=self.headers, data=data, json=json, **kwargs)
    
    def put(self, path: str, data=None, json=None, **kwargs):
        """
        Send a PUT request.
        
        Args:
            path: Request path
            data: Form data
            json: JSON data
            **kwargs: Additional arguments
            
        Returns:
            Response: Response object
        """
        return self.client.put(path, headers=self.headers, data=data, json=json, **kwargs)
    
    def patch(self, path: str, data=None, json=None, **kwargs):
        """
        Send a PATCH request.
        
        Args:
            path: Request path
            data: Form data
            json: JSON data
            **kwargs: Additional arguments
            
        Returns:
            Response: Response object
        """
        return self.client.patch(path, headers=self.headers, data=data, json=json, **kwargs)
    
    def delete(self, path: str, **kwargs):
        """
        Send a DELETE request.
        
        Args:
            path: Request path
            **kwargs: Additional arguments
            
        Returns:
            Response: Response object
        """
        return self.client.delete(path, headers=self.headers, **kwargs)


# ============================================================================
# Test Constants
# ============================================================================

class TestConstants:
    """Test constants."""
    
    # Timeouts
    DEFAULT_TIMEOUT = 30
    LONG_TIMEOUT = 60
    SHORT_TIMEOUT = 5
    
    # Pagination
    PAGE_SIZE = 10
    MAX_PAGE_SIZE = 100
    
    # Test data sizes
    SMALL_DATA_SIZE = 10
    MEDIUM_DATA_SIZE = 100
    LARGE_DATA_SIZE = 1000
    
    # HTTP Status Codes
    HTTP_OK = 200
    HTTP_CREATED = 201
    HTTP_NO_CONTENT = 204
    HTTP_BAD_REQUEST = 400
    HTTP_UNAUTHORIZED = 401
    HTTP_FORBIDDEN = 403
    HTTP_NOT_FOUND = 404
    HTTP_CONFLICT = 409
    HTTP_UNPROCESSABLE = 422
    HTTP_TOO_MANY_REQUESTS = 429
    HTTP_INTERNAL_SERVER_ERROR = 500
    
    # Error codes
    ERROR_VALIDATION = "validation_error"
    ERROR_NOT_FOUND = "not_found"
    ERROR_UNAUTHORIZED = "unauthorized"
    ERROR_FORBIDDEN = "forbidden"
    ERROR_CONFLICT = "conflict"


# ============================================================================
# Exports
# ============================================================================

__all__ = [
    # Configuration
    "TEST_ENVIRONMENT",
    "TEST_DATABASE_URL",
    "TEST_REDIS_URL",
    "TEST_USER_ID",
    "TEST_VEHICLE_ID",
    "TEST_PARKING_SPOT_ID",
    "TEST_CHARGING_STATION_ID",
    "TEST_PAYMENT_ID",
    "TEST_NOTIFICATION_ID",
    
    # Test Data
    "TEST_USER_DATA",
    "TEST_VEHICLE_DATA",
    "TEST_PARKING_SPOT_DATA",
    "TEST_CHARGING_STATION_DATA",
    "TEST_PAYMENT_DATA",
    
    # Utilities
    "get_test_settings",
    "setup_test_environment",
    "teardown_test_environment",
    
    # Fixtures
    "TestFixtures",
    
    # Helpers
    "TestHelpers",
    
    # Database
    "TestDatabase",
    
    # Client
    "TestClient",
    
    # Constants
    "TestConstants",
]


# ============================================================================
# Package Version
# ============================================================================

__version__ = "1.0.0"


# ============================================================================
# Package Documentation
# ============================================================================

"""
Tests Package Documentation
===========================

This package contains all test modules for the parking management system.

Structure:
----------
- unit/: Unit tests for individual components
- integration/: Integration tests for component interactions
- e2e/: End-to-end tests for full workflows
- fixtures/: Test fixtures and data factories
- utils/: Test utilities and helpers

Running Tests:
-------------
```bash
# Run all tests
pytest

# Run specific test file
pytest tests/unit/test_vehicle_service.py

# Run tests with coverage
pytest --cov=src --cov-report=html

# Run tests in parallel
pytest -n auto

# Run tests with specific marker
pytest -m "unit or integration"