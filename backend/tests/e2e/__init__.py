# ============================================================================
# End-to-End Tests Package
# ============================================================================

"""
End-to-End (E2E) tests package for the parking management system.

This package contains end-to-end tests that verify complete user workflows
and system behavior from end to end, simulating real user interactions
with the full application stack.
"""

import pytest
import asyncio
from typing import Dict, Any, Optional, List, AsyncGenerator, Callable
from datetime import datetime, timedelta
from unittest.mock import Mock, AsyncMock, patch

# Mark all tests in this package as e2e tests
pytestmark = pytest.mark.e2e

# E2E test configuration
E2E_TEST_TIMEOUT = 120  # seconds
E2E_TEST_SLOW_THRESHOLD = 30  # seconds

# Test environment configuration
TEST_ENVIRONMENT = "e2e"
TEST_DATABASE_URL = "postgresql://test:test@localhost:5432/e2e_parking_db"
TEST_REDIS_URL = "redis://localhost:6379/15"
TEST_API_BASE_URL = "http://localhost:8000"


# ============================================================================
# E2E Test Fixtures
# ============================================================================

@pytest.fixture(scope="session")
def event_loop():
    """
    Create an event loop for the test session.
    
    Yields:
        asyncio.AbstractEventLoop: Event loop
    """
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def test_application():
    """
    Start the test application for E2E tests.
    
    Yields:
        FastAPI: Test application
    """
    from src.main import create_application
    from src.shared.config import settings
    
    # Override settings for E2E tests
    settings.DATABASE_URL = TEST_DATABASE_URL
    settings.REDIS_URL = TEST_REDIS_URL
    settings.ENVIRONMENT = TEST_ENVIRONMENT
    
    # Create application
    app = create_application()
    
    # Initialize database
    from src.infrastructure.database import engine, Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    yield app
    
    # Cleanup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def e2e_client(test_application):
    """
    Create an E2E test client.
    
    Args:
        test_application: Test application
        
    Yields:
        E2EClient: E2E test client
    """
    from .client import E2EClient
    
    client = E2EClient(test_application)
    await client.start()
    
    yield client
    
    await client.stop()


@pytest.fixture
async def e2e_db():
    """
    Create E2E database connection.
    
    Yields:
        E2EDatabase: E2E database helper
    """
    from .database import E2EDatabase
    
    db = E2EDatabase(TEST_DATABASE_URL)
    await db.connect()
    
    yield db
    
    await db.cleanup()
    await db.disconnect()


@pytest.fixture
async def e2e_redis():
    """
    Create E2E Redis connection.
    
    Yields:
        E2ERedis: E2E Redis helper
    """
    from .redis import E2ERedis
    
    redis = E2ERedis(TEST_REDIS_URL)
    await redis.connect()
    
    yield redis
    
    await redis.cleanup()
    await redis.disconnect()


@pytest.fixture
async def test_user(e2e_client):
    """
    Create a test user for E2E tests.
    
    Args:
        e2e_client: E2E client
        
    Returns:
        Dict: Test user data
    """
    user_data = {
        "username": "e2e_user",
        "email": "e2e@example.com",
        "password": "E2ETestPassword123!",
        "first_name": "E2E",
        "last_name": "User",
        "phone": "+1234567890"
    }
    
    # Register user
    response = await e2e_client.register_user(user_data)
    assert response["status"] == "success"
    
    # Login user
    login_data = {
        "email": user_data["email"],
        "password": user_data["password"]
    }
    login_response = await e2e_client.login_user(login_data)
    assert "access_token" in login_response
    
    user_data["id"] = login_response.get("user_id")
    user_data["token"] = login_response["access_token"]
    user_data["refresh_token"] = login_response["refresh_token"]
    
    return user_data


@pytest.fixture
async def test_admin(e2e_client):
    """
    Create a test admin user for E2E tests.
    
    Args:
        e2e_client: E2E client
        
    Returns:
        Dict: Test admin user data
    """
    admin_data = {
        "username": "e2e_admin",
        "email": "e2e_admin@example.com",
        "password": "E2EAdminPassword123!",
        "first_name": "E2E",
        "last_name": "Admin",
        "phone": "+1234567890",
        "role": "admin"
    }
    
    # Register admin user
    response = await e2e_client.register_user(admin_data)
    assert response["status"] == "success"
    
    # Login admin
    login_data = {
        "email": admin_data["email"],
        "password": admin_data["password"]
    }
    login_response = await e2e_client.login_user(login_data)
    assert "access_token" in login_response
    
    admin_data["id"] = login_response.get("user_id")
    admin_data["token"] = login_response["access_token"]
    admin_data["refresh_token"] = login_response["refresh_token"]
    
    return admin_data


@pytest.fixture
async def test_vehicle(e2e_client, test_user):
    """
    Create a test vehicle for E2E tests.
    
    Args:
        e2e_client: E2E client
        test_user: Test user
        
    Returns:
        Dict: Test vehicle data
    """
    vehicle_data = {
        "license_plate": "E2E123",
        "state": "CA",
        "country": "US",
        "make": "Tesla",
        "model": "Model 3",
        "year": 2023,
        "color": "white",
        "vehicle_type": "ev",
        "fuel_type": "electric",
        "vehicle_size": "standard",
        "owner_id": test_user["id"]
    }
    
    headers = {"Authorization": f"Bearer {test_user['token']}"}
    response = await e2e_client.post("/api/v1/vehicles", json=vehicle_data, headers=headers)
    assert response["status"] == "success"
    
    vehicle_data["id"] = response["data"]["id"]
    
    return vehicle_data


@pytest.fixture
async def test_parking_spot(e2e_client, test_admin):
    """
    Create a test parking spot for E2E tests.
    
    Args:
        e2e_client: E2E client
        test_admin: Test admin user
        
    Returns:
        Dict: Test parking spot data
    """
    spot_data = {
        "spot_number": "E2E-101",
        "floor": 1,
        "section": "E2E Test",
        "spot_type": "standard",
        "status": "available",
        "access_level": "public",
        "location_id": 1,
        "is_covered": True,
        "is_handicap_accessible": False,
        "is_ev_charging": False
    }
    
    headers = {"Authorization": f"Bearer {test_admin['token']}"}
    response = await e2e_client.post("/api/v1/parking/spots", json=spot_data, headers=headers)
    assert response["status"] == "success"
    
    spot_data["id"] = response["data"]["id"]
    
    return spot_data


@pytest.fixture
async def test_charging_station(e2e_client, test_admin):
    """
    Create a test charging station for E2E tests.
    
    Args:
        e2e_client: E2E client
        test_admin: Test admin user
        
    Returns:
        Dict: Test charging station data
    """
    station_data = {
        "station_name": "E2E Charging Station",
        "location_id": 1,
        "connector_type": "CCS",
        "power_rating_kw": 50,
        "status": "available",
        "charging_rate": 0.30
    }
    
    headers = {"Authorization": f"Bearer {test_admin['token']}"}
    response = await e2e_client.post("/api/v1/charging/stations", json=station_data, headers=headers)
    assert response["status"] == "success"
    
    station_data["id"] = response["data"]["id"]
    
    return station_data


# ============================================================================
# E2E Test Helpers
# ============================================================================

class E2ETestHelpers:
    """
    Helper functions for E2E tests.
    """
    
    @staticmethod
    def generate_e2e_data(prefix: str = "e2e") -> Dict[str, str]:
        """
        Generate unique E2E test data.
        
        Args:
            prefix: Prefix for generated data
            
        Returns:
            Dict: Generated data
        """
        import uuid
        import time
        
        unique_id = f"{prefix}_{int(time.time())}_{uuid.uuid4().hex[:6]}"
        
        return {
            "username": f"{unique_id}_user",
            "email": f"{unique_id}@example.com",
            "license_plate": f"{unique_id[:6].upper()}",
            "spot_number": f"{prefix.upper()}-{unique_id[-4:]}",
            "station_name": f"{prefix.title()} Station {unique_id[-4:]}"
        }
    
    @staticmethod
    async def wait_for_condition(
        condition: Callable,
        timeout: int = 30,
        interval: float = 0.5
    ) -> bool:
        """
        Wait for a condition to be true.
        
        Args:
            condition: Condition function
            timeout: Timeout in seconds
            interval: Check interval in seconds
            
        Returns:
            bool: True if condition met, False if timeout
        """
        start_time = datetime.now()
        while (datetime.now() - start_time).total_seconds() < timeout:
            if await condition():
                return True
            await asyncio.sleep(interval)
        return False
    
    @staticmethod
    async def retry_operation(
        operation: Callable,
        max_retries: int = 3,
        delay: float = 1.0
    ):
        """
        Retry an operation with exponential backoff.
        
        Args:
            operation: Operation function
            max_retries: Maximum retries
            delay: Initial delay in seconds
            
        Returns:
            Any: Operation result
        """
        last_exception = None
        
        for attempt in range(max_retries):
            try:
                return await operation()
            except Exception as e:
                last_exception = e
                if attempt < max_retries - 1:
                    wait_time = delay * (2 ** attempt)
                    await asyncio.sleep(wait_time)
        
        raise last_exception
    
    @staticmethod
    def assert_response_success(response: Dict[str, Any]) -> None:
        """
        Assert that a response indicates success.
        
        Args:
            response: Response dictionary
        """
        assert response is not None
        assert response.get("status") == "success"
        assert "data" in response or "message" in response
    
    @staticmethod
    def assert_response_error(response: Dict[str, Any], expected_error: Optional[str] = None) -> None:
        """
        Assert that a response indicates an error.
        
        Args:
            response: Response dictionary
            expected_error: Expected error message (optional)
        """
        assert response is not None
        assert response.get("status") == "error"
        if expected_error:
            assert expected_error in str(response.get("message", ""))
    
    @staticmethod
    def assert_pagination_response(response: Dict[str, Any]) -> None:
        """
        Assert that a response is a valid paginated response.
        
        Args:
            response: Response dictionary
        """
        assert "items" in response
        assert "total" in response
        assert "skip" in response
        assert "limit" in response
        assert isinstance(response["items"], list)
        assert isinstance(response["total"], int)


# ============================================================================
# E2E Test Workflow Helpers
# ============================================================================

class E2EWorkflowHelpers:
    """
    Helper functions for E2E workflow tests.
    """
    
    @staticmethod
    async def complete_parking_workflow(e2e_client, test_user, test_vehicle, test_parking_spot):
        """
        Complete a full parking workflow.
        
        Args:
            e2e_client: E2E client
            test_user: Test user
            test_vehicle: Test vehicle
            test_parking_spot: Test parking spot
            
        Returns:
            Dict: Workflow results
        """
        headers = {"Authorization": f"Bearer {test_user['token']}"}
        
        # 1. Start parking session
        session_data = {
            "vehicle_id": test_vehicle["id"],
            "spot_id": test_parking_spot["id"],
            "start_time": datetime.now().isoformat()
        }
        response = await e2e_client.post("/api/v1/parking/sessions", json=session_data, headers=headers)
        E2ETestHelpers.assert_response_success(response)
        session_id = response["data"]["id"]
        
        # 2. Wait for session to be active
        await asyncio.sleep(1)
        
        # 3. End parking session
        end_data = {
            "end_time": (datetime.now() + timedelta(hours=2)).isoformat()
        }
        response = await e2e_client.post(
            f"/api/v1/parking/sessions/{session_id}/end",
            json=end_data,
            headers=headers
        )
        E2ETestHelpers.assert_response_success(response)
        
        # 4. Get session details
        response = await e2e_client.get(f"/api/v1/parking/sessions/{session_id}", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        session = response["data"]
        
        # 5. Create payment
        payment_data = {
            "amount": 10.00,
            "currency": "USD",
            "session_id": session_id,
            "session_type": "parking",
            "payment_method": "credit_card"
        }
        response = await e2e_client.post("/api/v1/payments", json=payment_data, headers=headers)
        E2ETestHelpers.assert_response_success(response)
        payment_id = response["data"]["id"]
        
        # 6. Process payment
        response = await e2e_client.post(f"/api/v1/payments/{payment_id}/process", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        return {
            "session_id": session_id,
            "payment_id": payment_id,
            "session": session,
            "payment": response["data"]
        }
    
    @staticmethod
    async def complete_charging_workflow(e2e_client, test_user, test_vehicle, test_charging_station):
        """
        Complete a full charging workflow.
        
        Args:
            e2e_client: E2E client
            test_user: Test user
            test_vehicle: Test vehicle
            test_charging_station: Test charging station
            
        Returns:
            Dict: Workflow results
        """
        headers = {"Authorization": f"Bearer {test_user['token']}"}
        
        # 1. Start charging session
        session_data = {
            "vehicle_id": test_vehicle["id"],
            "station_id": test_charging_station["id"],
            "connector_type": "CCS",
            "start_time": datetime.now().isoformat()
        }
        response = await e2e_client.post("/api/v1/charging/sessions/start", json=session_data, headers=headers)
        E2ETestHelpers.assert_response_success(response)
        session_id = response["data"]["id"]
        
        # 2. Wait for session to be active
        await asyncio.sleep(1)
        
        # 3. Stop charging session
        stop_data = {
            "energy_consumed_kwh": 25.5
        }
        response = await e2e_client.post(
            f"/api/v1/charging/sessions/{session_id}/stop",
            json=stop_data,
            headers=headers
        )
        E2ETestHelpers.assert_response_success(response)
        
        # 4. Get session details
        response = await e2e_client.get(f"/api/v1/charging/sessions/{session_id}", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        session = response["data"]
        
        # 5. Calculate cost
        response = await e2e_client.get(
            f"/api/v1/charging/sessions/{session_id}/cost",
            headers=headers
        )
        E2ETestHelpers.assert_response_success(response)
        cost = response["data"]
        
        # 6. Create payment
        payment_data = {
            "amount": cost["amount"],
            "currency": "USD",
            "session_id": session_id,
            "session_type": "charging",
            "payment_method": "credit_card"
        }
        response = await e2e_client.post("/api/v1/payments", json=payment_data, headers=headers)
        E2ETestHelpers.assert_response_success(response)
        payment_id = response["data"]["id"]
        
        return {
            "session_id": session_id,
            "payment_id": payment_id,
            "session": session,
            "cost": cost
        }
    
    @staticmethod
    async def complete_notification_workflow(e2e_client, test_user):
        """
        Complete a full notification workflow.
        
        Args:
            e2e_client: E2E client
            test_user: Test user
            
        Returns:
            Dict: Workflow results
        """
        headers = {"Authorization": f"Bearer {test_user['token']}"}
        
        # 1. Create notification
        notification_data = {
            "user_id": test_user["id"],
            "title": "E2E Test Notification",
            "message": "This is an end-to-end test notification",
            "type": "info"
        }
        response = await e2e_client.post("/api/v1/notifications", json=notification_data, headers=headers)
        E2ETestHelpers.assert_response_success(response)
        notification_id = response["data"]["id"]
        
        # 2. Get notifications
        response = await e2e_client.get("/api/v1/notifications", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        E2ETestHelpers.assert_pagination_response(response["data"])
        
        # 3. Mark notification as read
        response = await e2e_client.post(
            f"/api/v1/notifications/{notification_id}/mark-read",
            headers=headers
        )
        E2ETestHelpers.assert_response_success(response)
        
        # 4. Get unread count
        response = await e2e_client.get("/api/v1/notifications/unread-count", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        return {
            "notification_id": notification_id,
            "unread_count": response["data"]["unread_count"]
        }


# ============================================================================
# E2E Test Decorators
# ============================================================================

def e2e_test(func):
    """
    Decorator to mark a test as an E2E test.
    
    Args:
        func: Test function
        
    Returns:
        function: Decorated function
    """
    func = pytest.mark.e2e(func)
    func = pytest.mark.timeout(E2E_TEST_TIMEOUT)(func)
    return func


def workflow_test(func):
    """
    Decorator to mark a test as a workflow test.
    
    Args:
        func: Test function
        
    Returns:
        function: Decorated function
    """
    func = pytest.mark.e2e(func)
    func = pytest.mark.workflow(func)
    func = pytest.mark.timeout(E2E_TEST_TIMEOUT)(func)
    return func


def slow_e2e_test(func):
    """
    Decorator to mark a slow E2E test.
    
    Args:
        func: Test function
        
    Returns:
        function: Decorated function
    """
    func = pytest.mark.e2e(func)
    func = pytest.mark.slow(func)
    func = pytest.mark.timeout(E2E_TEST_TIMEOUT * 2)(func)
    return func


def external_dependency_test(func):
    """
    Decorator to mark an E2E test with external dependencies.
    
    Args:
        func: Test function
        
    Returns:
        function: Decorated function
    """
    func = pytest.mark.e2e(func)
    func = pytest.mark.external_dependency(func)
    func = pytest.mark.timeout(E2E_TEST_TIMEOUT)(func)
    return func


# ============================================================================
# E2E Test Base Classes
# ============================================================================

class BaseE2ETest:
    """
    Base class for E2E tests.
    
    This class provides common setup and teardown functionality
    for E2E tests.
    """
    
    @pytest.fixture(autouse=True)
    async def setup_e2e(self, e2e_client, e2e_db, e2e_redis):
        """
        Setup E2E test environment.
        
        Args:
            e2e_client: E2E client
            e2e_db: E2E database helper
            e2e_redis: E2E Redis helper
        """
        self.client = e2e_client
        self.db = e2e_db
        self.redis = e2e_redis
        
        await self.setup()
        yield
        await self.teardown()
    
    async def setup(self):
        """Setup method to be overridden by subclasses."""
        pass
    
    async def teardown(self):
        """Teardown method to be overridden by subclasses."""
        # Clean up test data
        await self.db.cleanup()
        await self.redis.cleanup()
    
    async def create_test_data(self, **kwargs):
        """
        Create test data.
        
        Args:
            **kwargs: Data to create
            
        Returns:
            Dict: Created data
        """
        result = {}
        
        # Create user if provided
        if "user" in kwargs:
            user_data = kwargs["user"]
            response = await self.client.register_user(user_data)
            result["user"] = response["data"]
        
        # Create vehicle if provided
        if "vehicle" in kwargs and "user" in result:
            vehicle_data = kwargs["vehicle"]
            vehicle_data["owner_id"] = result["user"]["id"]
            headers = {"Authorization": f"Bearer {result['user']['token']}"}
            response = await self.client.post("/api/v1/vehicles", json=vehicle_data, headers=headers)
            result["vehicle"] = response["data"]
        
        return result
    
    async def cleanup_test_data(self):
        """Clean up all test data."""
        await self.db.cleanup()
        await self.redis.cleanup()


class BaseWorkflowTest(BaseE2ETest):
    """
    Base class for workflow E2E tests.
    
    This class provides common setup for testing complete workflows.
    """
    
    async def setup(self):
        """Setup method."""
        self.helpers = E2EWorkflowHelpers()
        self.test_data = {}
        
        # Create test user
        user_data = {
            "username": "workflow_test_user",
            "email": "workflow@example.com",
            "password": "WorkflowTest123!",
            "first_name": "Workflow",
            "last_name": "Tester"
        }
        response = await self.client.register_user(user_data)
        self.test_data["user"] = {**user_data, **response["data"]}
        
        # Login
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.login_user(login_data)
        self.test_data["user"]["token"] = login_response["access_token"]
        
        # Create vehicle
        vehicle_data = {
            "license_plate": "WF123",
            "state": "CA",
            "make": "Tesla",
            "model": "Model 3",
            "year": 2023,
            "color": "white",
            "vehicle_type": "ev",
            "fuel_type": "electric"
        }
        headers = {"Authorization": f"Bearer {self.test_data['user']['token']}"}
        response = await self.client.post("/api/v1/vehicles", json=vehicle_data, headers=headers)
        self.test_data["vehicle"] = response["data"]
        
        # Create parking spot (as admin)
        # For simplicity, use existing spot or create one
        spot_data = {
            "spot_number": "WF-101",
            "spot_type": "standard",
            "status": "available"
        }
        # In real tests, you might need admin token
        response = await self.client.post("/api/v1/parking/spots", json=spot_data, headers=headers)
        self.test_data["parking_spot"] = response["data"]
    
    async def teardown(self):
        """Teardown method."""
        await super().teardown()


# ============================================================================
# E2E Test Client
# ============================================================================

class E2EClient:
    """
    E2E test client with utility methods.
    """
    
    def __init__(self, app):
        """
        Initialize E2E client.
        
        Args:
            app: FastAPI application
        """
        from httpx import AsyncClient
        
        self.app = app
        self.client = None
        self.base_url = "http://test"
    
    async def start(self):
        """Start the client."""
        self.client = AsyncClient(app=self.app, base_url=self.base_url)
    
    async def stop(self):
        """Stop the client."""
        if self.client:
            await self.client.aclose()
    
    async def request(self, method: str, path: str, **kwargs):
        """
        Make an HTTP request.
        
        Args:
            method: HTTP method
            path: Request path
            **kwargs: Additional arguments
            
        Returns:
            Dict: Response data
        """
        response = await self.client.request(method, path, **kwargs)
        
        try:
            return response.json()
        except:
            return {"status": "error", "message": response.text}
    
    async def get(self, path: str, **kwargs):
        """Send GET request."""
        return await self.request("GET", path, **kwargs)
    
    async def post(self, path: str, **kwargs):
        """Send POST request."""
        return await self.request("POST", path, **kwargs)
    
    async def put(self, path: str, **kwargs):
        """Send PUT request."""
        return await self.request("PUT", path, **kwargs)
    
    async def patch(self, path: str, **kwargs):
        """Send PATCH request."""
        return await self.request("PATCH", path, **kwargs)
    
    async def delete(self, path: str, **kwargs):
        """Send DELETE request."""
        return await self.request("DELETE", path, **kwargs)
    
    async def register_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Register a user.
        
        Args:
            user_data: User registration data
            
        Returns:
            Dict: Response data
        """
        return await self.post("/api/v1/auth/register", json=user_data)
    
    async def login_user(self, login_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Login a user.
        
        Args:
            login_data: Login credentials
            
        Returns:
            Dict: Response data
        """
        return await self.post("/api/v1/auth/login", json=login_data)
    
    async def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """
        Refresh access token.
        
        Args:
            refresh_token: Refresh token
            
        Returns:
            Dict: Response data
        """
        return await self.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    
    async def logout_user(self, token: str) -> Dict[str, Any]:
        """
        Logout a user.
        
        Args:
            token: Access token
            
        Returns:
            Dict: Response data
        """
        headers = {"Authorization": f"Bearer {token}"}
        return await self.post("/api/v1/auth/logout", headers=headers)


# ============================================================================
# E2E Database Helper
# ============================================================================

class E2EDatabase:
    """
    E2E database helper for managing test data.
    """
    
    def __init__(self, database_url: str):
        """
        Initialize E2E database helper.
        
        Args:
            database_url: Database connection URL
        """
        from sqlalchemy.ext.asyncio import create_async_engine
        from sqlalchemy.orm import sessionmaker
        
        self.database_url = database_url
        self.engine = create_async_engine(database_url)
        self.session_maker = sessionmaker(self.engine, expire_on_commit=False)
    
    async def connect(self):
        """Connect to database."""
        from src.infrastructure.database import Base
        
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    
    async def disconnect(self):
        """Disconnect from database."""
        await self.engine.dispose()
    
    async def cleanup(self):
        """Clean up database."""
        from src.infrastructure.database import Base
        
        async with self.engine.begin() as conn:
            # Get all table names
            tables = await conn.run_sync(
                lambda conn: conn.dialect.get_table_names(conn)
            )
            
            # Truncate all tables
            for table in tables:
                if table != "alembic_version":
                    await conn.execute(f"TRUNCATE TABLE {table} CASCADE")
    
    async def execute(self, query: str):
        """
        Execute SQL query.
        
        Args:
            query: SQL query
            
        Returns:
            Any: Query results
        """
        async with self.engine.begin() as conn:
            result = await conn.execute(query)
            return result.fetchall()
    
    async def get_table_data(self, table_name: str):
        """
        Get all data from a table.
        
        Args:
            table_name: Table name
            
        Returns:
            List: Table data
        """
        return await self.execute(f"SELECT * FROM {table_name}")


# ============================================================================
# E2E Redis Helper
# ============================================================================

class E2ERedis:
    """
    E2E Redis helper for managing test data.
    """
    
    def __init__(self, redis_url: str):
        """
        Initialize E2E Redis helper.
        
        Args:
            redis_url: Redis connection URL
        """
        import redis.asyncio as redis
        
        self.redis_url = redis_url
        self.client = None
    
    async def connect(self):
        """Connect to Redis."""
        self.client = redis.from_url(self.redis_url, decode_responses=True)
    
    async def disconnect(self):
        """Disconnect from Redis."""
        if self.client:
            await self.client.close()
    
    async def cleanup(self):
        """Clean up Redis."""
        if self.client:
            await self.client.flushdb()
    
    async def get(self, key: str):
        """Get value from Redis."""
        return await self.client.get(key)
    
    async def set(self, key: str, value: str, expire: Optional[int] = None):
        """Set value in Redis."""
        return await self.client.set(key, value, ex=expire)
    
    async def delete(self, key: str):
        """Delete key from Redis."""
        return await self.client.delete(key)
    
    async def exists(self, key: str):
        """Check if key exists in Redis."""
        return await self.client.exists(key)


# ============================================================================
# Exports
# ============================================================================

__all__ = [
    # Fixtures
    "event_loop",
    "test_application",
    "e2e_client",
    "e2e_db",
    "e2e_redis",
    "test_user",
    "test_admin",
    "test_vehicle",
    "test_parking_spot",
    "test_charging_station",
    
    # Helpers
    "E2ETestHelpers",
    "E2EWorkflowHelpers",
    
    # Decorators
    "e2e_test",
    "workflow_test",
    "slow_e2e_test",
    "external_dependency_test",
    
    # Base Classes
    "BaseE2ETest",
    "BaseWorkflowTest",
    
    # Client
    "E2EClient",
    
    # Database
    "E2EDatabase",
    
    # Redis
    "E2ERedis",
]


# ============================================================================
# Package Version
# ============================================================================

__version__ = "1.0.0"


# ============================================================================
# Package Documentation
# ============================================================================

"""
End-to-End Tests Package Documentation
======================================

This package contains end-to-end tests for the parking management system.

What are E2E Tests?
-------------------
End-to-end tests verify complete user workflows and system behavior
from end to end, simulating real user interactions with the full
application stack including:
- Database
- Redis cache
- Message queues
- External services (mocked)
- API endpoints
- Authentication flows

Structure:
----------
- workflows/: Complete workflow tests
- scenarios/: User scenario tests
- performance/: Performance and load tests
- smoke/: Smoke tests for critical paths

Running E2E Tests:
-----------------
```bash
# Run all E2E tests
pytest tests/e2e/

# Run workflow tests
pytest tests/e2e/workflows/

# Run smoke tests
pytest tests/e2e/smoke/

# Run with coverage
pytest tests/e2e/ --cov=src --cov-report=html

# Run specific workflow
pytest tests/e2e/workflows/test_parking_workflow.py