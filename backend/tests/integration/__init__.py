# ============================================================================
# Integration Tests Package
# ============================================================================

"""
Integration tests package for the parking management system.

This package contains integration tests that verify the interaction between
multiple components, services, and external dependencies including database,
Redis, and external APIs.
"""

import pytest
from typing import Dict, Any, Optional, List, AsyncGenerator
from unittest.mock import Mock, AsyncMock, patch

# Mark all tests in this package as integration tests
pytestmark = pytest.mark.integration

# Integration test configuration
INTEGRATION_TEST_TIMEOUT = 30  # seconds
INTEGRATION_TEST_SLOW_THRESHOLD = 5  # seconds

# Test database configuration
TEST_DATABASE_URL = "postgresql://test:test@localhost:5432/test_parking_db"
TEST_REDIS_URL = "redis://localhost:6379/15"


# ============================================================================
# Integration Test Fixtures
# ============================================================================

@pytest.fixture(scope="session")
def event_loop():
    """
    Create an event loop for the test session.
    
    Yields:
        asyncio.AbstractEventLoop: Event loop
    """
    import asyncio
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def test_database():
    """
    Create and manage test database.
    
    Yields:
        AsyncEngine: Database engine
    """
    from src.infrastructure.database import create_engine, Base
    from sqlalchemy.ext.asyncio import AsyncEngine
    
    # Create test engine
    engine = create_engine(TEST_DATABASE_URL)
    
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    # Cleanup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest.fixture
async def db_session(test_database):
    """
    Create a database session for testing.
    
    Args:
        test_database: Test database engine
        
    Yields:
        AsyncSession: Database session
    """
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.orm import sessionmaker
    
    async_session = sessionmaker(
        test_database, 
        class_=AsyncSession, 
        expire_on_commit=False
    )
    
    async with async_session() as session:
        yield session
        await session.rollback()
        await session.close()


@pytest.fixture
async def redis_client():
    """
    Create a Redis client for testing.
    
    Yields:
        Redis: Redis client
    """
    import redis.asyncio as redis
    
    client = redis.from_url(TEST_REDIS_URL, decode_responses=True)
    
    # Clear test database
    await client.flushdb()
    
    yield client
    
    # Cleanup
    await client.flushdb()
    await client.close()


@pytest.fixture
async def message_bus():
    """
    Create a message bus for testing.
    
    Yields:
        MessageBus: Message bus
    """
    from src.infrastructure.message_bus import MessageBus
    
    bus = MessageBus()
    await bus.start()
    
    yield bus
    
    await bus.stop()


@pytest.fixture
async def cache_service(redis_client):
    """
    Create a cache service for testing.
    
    Args:
        redis_client: Redis client
        
    Yields:
        CacheService: Cache service
    """
    from src.infrastructure.cache_service import CacheService
    
    service = CacheService(redis_client)
    await service.clear()
    
    yield service
    
    await service.clear()


@pytest.fixture
def test_app():
    """
    Create a test FastAPI application.
    
    Returns:
        FastAPI: Test application
    """
    from fastapi import FastAPI
    from src.interfaces.api.v1 import router
    
    app = FastAPI(title="Test API")
    app.include_router(router)
    
    return app


@pytest.fixture
async def test_client(test_app):
    """
    Create a test client for API testing.
    
    Args:
        test_app: Test application
        
    Yields:
        AsyncClient: Test client
    """
    from httpx import AsyncClient
    
    async with AsyncClient(app=test_app, base_url="http://test") as client:
        yield client


@pytest.fixture
async def auth_headers(test_client, test_user):
    """
    Create authentication headers for testing.
    
    Args:
        test_client: Test client
        test_user: Test user
        
    Returns:
        Dict: Authentication headers
    """
    from src.application.services.auth_service import AuthService
    
    # Generate token
    auth_service = AuthService()
    token = await auth_service.generate_access_token(test_user)
    
    return {"Authorization": f"Bearer {token}"}


# ============================================================================
# Test Data Fixtures
# ============================================================================

@pytest.fixture
async def test_user(db_session):
    """
    Create a test user.
    
    Args:
        db_session: Database session
        
    Returns:
        User: Test user
    """
    from src.domain.entities import User
    from src.domain.enums import UserRole, UserStatus
    
    user = User(
        username="testuser",
        email="test@example.com",
        first_name="Test",
        last_name="User",
        role=UserRole.USER,
        status=UserStatus.ACTIVE
    )
    
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    
    return user


@pytest.fixture
async def test_admin_user(db_session):
    """
    Create a test admin user.
    
    Args:
        db_session: Database session
        
    Returns:
        User: Test admin user
    """
    from src.domain.entities import User
    from src.domain.enums import UserRole, UserStatus
    
    user = User(
        username="adminuser",
        email="admin@example.com",
        first_name="Admin",
        last_name="User",
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE
    )
    
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    
    return user


@pytest.fixture
async def test_vehicle(db_session, test_user):
    """
    Create a test vehicle.
    
    Args:
        db_session: Database session
        test_user: Test user
        
    Returns:
        Vehicle: Test vehicle
    """
    from src.domain.entities import Vehicle
    from src.domain.value_objects import LicensePlate
    from src.domain.enums import VehicleType, VehicleStatus
    
    vehicle = Vehicle(
        license_plate=LicensePlate("TEST123", "CA", "US"),
        make="Tesla",
        model="Model 3",
        year=2023,
        color="White",
        vehicle_type=VehicleType.ELECTRIC,
        status=VehicleStatus.ACTIVE,
        owner_id=test_user.id
    )
    
    db_session.add(vehicle)
    await db_session.commit()
    await db_session.refresh(vehicle)
    
    return vehicle


@pytest.fixture
async def test_parking_spot(db_session):
    """
    Create a test parking spot.
    
    Args:
        db_session: Database session
        
    Returns:
        ParkingSpot: Test parking spot
    """
    from src.domain.entities import ParkingSpot
    from src.domain.enums import ParkingSpotStatus, ParkingSpotType
    
    spot = ParkingSpot(
        spot_number="A-101",
        spot_type=ParkingSpotType.STANDARD,
        status=ParkingSpotStatus.AVAILABLE,
        location_id=1
    )
    
    db_session.add(spot)
    await db_session.commit()
    await db_session.refresh(spot)
    
    return spot


@pytest.fixture
async def test_charging_station(db_session):
    """
    Create a test charging station.
    
    Args:
        db_session: Database session
        
    Returns:
        ChargingStation: Test charging station
    """
    from src.domain.entities import ChargingStation
    from src.domain.enums import ChargingConnectorType, ChargingStationStatus
    
    station = ChargingStation(
        station_name="Test Station",
        connector_type=ChargingConnectorType.CCS,
        power_rating_kw=50,
        status=ChargingStationStatus.AVAILABLE,
        location_id=1
    )
    
    db_session.add(station)
    await db_session.commit()
    await db_session.refresh(station)
    
    return station


@pytest.fixture
async def test_parking_session(db_session, test_vehicle, test_parking_spot):
    """
    Create a test parking session.
    
    Args:
        db_session: Database session
        test_vehicle: Test vehicle
        test_parking_spot: Test parking spot
        
    Returns:
        ParkingSession: Test parking session
    """
    from src.domain.entities import ParkingSession
    from src.domain.enums import ParkingSessionStatus
    from datetime import datetime
    
    session = ParkingSession(
        vehicle_id=test_vehicle.id,
        spot_id=test_parking_spot.id,
        start_time=datetime.now(),
        status=ParkingSessionStatus.ACTIVE
    )
    
    db_session.add(session)
    await db_session.commit()
    await db_session.refresh(session)
    
    return session


@pytest.fixture
async def test_payment(db_session, test_parking_session):
    """
    Create a test payment.
    
    Args:
        db_session: Database session
        test_parking_session: Test parking session
        
    Returns:
        Payment: Test payment
    """
    from src.domain.entities import Payment
    from src.domain.value_objects import Money
    from src.domain.enums import PaymentStatus, PaymentMethod
    
    payment = Payment(
        amount=Money(100.00, "USD"),
        session_id=test_parking_session.id,
        session_type="parking",
        payment_method=PaymentMethod.CREDIT_CARD,
        status=PaymentStatus.PENDING
    )
    
    db_session.add(payment)
    await db_session.commit()
    await db_session.refresh(payment)
    
    return payment


# ============================================================================
# Integration Test Helpers
# ============================================================================

class IntegrationTestHelpers:
    """
    Helper functions for integration tests.
    """
    
    @staticmethod
    async def create_test_data(db_session, **kwargs):
        """
        Create test data in database.
        
        Args:
            db_session: Database session
            **kwargs: Data to create
            
        Returns:
            Dict: Created data
        """
        from src.infrastructure.repositories import (
            UserRepository,
            VehicleRepository,
            ParkingRepository,
            ChargingRepository,
        )
        
        user_repo = UserRepository(db_session)
        vehicle_repo = VehicleRepository(db_session)
        parking_repo = ParkingRepository(db_session)
        charging_repo = ChargingRepository(db_session)
        
        result = {}
        
        # Create user if provided
        if "user" in kwargs:
            result["user"] = await user_repo.create(kwargs["user"])
        
        # Create vehicle if provided
        if "vehicle" in kwargs:
            result["vehicle"] = await vehicle_repo.create(kwargs["vehicle"])
        
        # Create parking spot if provided
        if "parking_spot" in kwargs:
            result["parking_spot"] = await parking_repo.create_spot(kwargs["parking_spot"])
        
        # Create charging station if provided
        if "charging_station" in kwargs:
            result["charging_station"] = await charging_repo.create_station(kwargs["charging_station"])
        
        return result
    
    @staticmethod
    async def cleanup_test_data(db_session):
        """
        Clean up test data from database.
        
        Args:
            db_session: Database session
        """
        from src.infrastructure.database import Base
        
        # Delete all data from tables
        for table in reversed(Base.metadata.sorted_tables):
            await db_session.execute(f"TRUNCATE TABLE {table.name} CASCADE")
        
        await db_session.commit()
    
    @staticmethod
    async def assert_database_state(db_session, expected_data: Dict[str, Any]):
        """
        Assert database state.
        
        Args:
            db_session: Database session
            expected_data: Expected state
        """
        from sqlalchemy import text
        
        for table, expected in expected_data.items():
            result = await db_session.execute(text(f"SELECT COUNT(*) FROM {table}"))
            count = result.scalar()
            assert count == expected, f"Table {table} has {count} rows, expected {expected}"


# ============================================================================
# Integration Test Decorators
# ============================================================================

def integration_test(func):
    """
    Decorator to mark a test as an integration test.
    
    Args:
        func: Test function
        
    Returns:
        function: Decorated function
    """
    func = pytest.mark.integration(func)
    func = pytest.mark.timeout(INTEGRATION_TEST_TIMEOUT)(func)
    return func


def database_test(func):
    """
    Decorator to mark a database integration test.
    
    Args:
        func: Test function
        
    Returns:
        function: Decorated function
    """
    func = pytest.mark.integration(func)
    func = pytest.mark.database(func)
    func = pytest.mark.timeout(INTEGRATION_TEST_TIMEOUT)(func)
    return func


def redis_test(func):
    """
    Decorator to mark a Redis integration test.
    
    Args:
        func: Test function
        
    Returns:
        function: Decorated function
    """
    func = pytest.mark.integration(func)
    func = pytest.mark.redis(func)
    func = pytest.mark.timeout(INTEGRATION_TEST_TIMEOUT)(func)
    return func


def api_test(func):
    """
    Decorator to mark an API integration test.
    
    Args:
        func: Test function
        
    Returns:
        function: Decorated function
    """
    func = pytest.mark.integration(func)
    func = pytest.mark.api(func)
    func = pytest.mark.timeout(INTEGRATION_TEST_TIMEOUT)(func)
    return func


def slow_integration_test(func):
    """
    Decorator to mark a slow integration test.
    
    Args:
        func: Test function
        
    Returns:
        function: Decorated function
    """
    func = pytest.mark.integration(func)
    func = pytest.mark.slow(func)
    func = pytest.mark.timeout(INTEGRATION_TEST_TIMEOUT * 2)(func)
    return func


# ============================================================================
# Integration Test Base Class
# ============================================================================

class BaseIntegrationTest:
    """
    Base class for integration tests.
    
    This class provides common setup and teardown functionality
    for integration tests.
    """
    
    @pytest.fixture(autouse=True)
    async def setup_method(self, db_session, redis_client):
        """
        Setup method called before each test.
        
        Args:
            db_session: Database session
            redis_client: Redis client
        """
        self.db_session = db_session
        self.redis_client = redis_client
        
        await self.setup()
        yield
        await self.teardown()
    
    async def setup(self):
        """Setup method to be overridden by subclasses."""
        pass
    
    async def teardown(self):
        """Teardown method to be overridden by subclasses."""
        # Clean up test data
        await IntegrationTestHelpers.cleanup_test_data(self.db_session)
        
        # Clear Redis
        await self.redis_client.flushdb()
    
    async def create_test_data(self, **kwargs):
        """
        Create test data.
        
        Args:
            **kwargs: Data to create
            
        Returns:
            Dict: Created data
        """
        return await IntegrationTestHelpers.create_test_data(self.db_session, **kwargs)
    
    async def assert_database_state(self, expected_data: Dict[str, Any]):
        """
        Assert database state.
        
        Args:
            expected_data: Expected state
        """
        await IntegrationTestHelpers.assert_database_state(self.db_session, expected_data)


# ============================================================================
# API Test Base Class
# ============================================================================

class BaseAPIIntegrationTest(BaseIntegrationTest):
    """
    Base class for API integration tests.
    
    This class provides common setup for testing API endpoints.
    """
    
    @pytest.fixture(autouse=True)
    async def setup_api(self, test_client, test_app):
        """
        Setup API test client.
        
        Args:
            test_client: Test client
            test_app: Test application
        """
        self.client = test_client
        self.app = test_app
        self.auth_headers = {}
    
    async def authenticate(self, user_data: Dict[str, Any]):
        """
        Authenticate a user for API tests.
        
        Args:
            user_data: User credentials
            
        Returns:
            Dict: Authentication headers
        """
        response = await self.client.post("/api/v1/auth/login", json=user_data)
        assert response.status_code == 200
        
        data = response.json()
        token = data.get("access_token")
        self.auth_headers = {"Authorization": f"Bearer {token}"}
        
        return self.auth_headers
    
    async def get_authenticated_client(self):
        """
        Get authenticated client.
        
        Returns:
            Tuple: Client and headers
        """
        return self.client, self.auth_headers
    
    async def assert_response(self, response, expected_status: int = 200, expected_data: Optional[Dict] = None):
        """
        Assert response status and data.
        
        Args:
            response: Response object
            expected_status: Expected status code
            expected_data: Expected response data
        """
        assert response.status_code == expected_status
        
        if expected_data:
            data = response.json()
            for key, value in expected_data.items():
                assert data.get(key) == value, f"Expected {key}={value}, got {data.get(key)}"
    
    async def assert_error_response(self, response, expected_status: int, expected_error: str):
        """
        Assert error response.
        
        Args:
            response: Response object
            expected_status: Expected status code
            expected_error: Expected error message
        """
        assert response.status_code == expected_status
        
        data = response.json()
        assert "error" in data or "detail" in data
        error_message = data.get("error", data.get("detail", ""))
        assert expected_error in error_message, f"Expected error '{expected_error}', got '{error_message}'"


# ============================================================================
# External Service Mocks
# ============================================================================

class ExternalServiceMocks:
    """
    Mock external services for integration tests.
    """
    
    @staticmethod
    @pytest.fixture
    def mock_payment_gateway():
        """
        Mock payment gateway.
        
        Returns:
            Mock: Payment gateway mock
        """
        with patch('src.infrastructure.payment_gateway.PaymentGateway') as mock:
            gateway = Mock()
            gateway.process_payment = AsyncMock(return_value={
                "success": True,
                "transaction_id": "txn_test_123",
                "status": "completed"
            })
            gateway.refund_payment = AsyncMock(return_value={
                "success": True,
                "refund_id": "ref_test_123"
            })
            mock.return_value = gateway
            yield gateway
    
    @staticmethod
    @pytest.fixture
    def mock_email_service():
        """
        Mock email service.
        
        Returns:
            Mock: Email service mock
        """
        with patch('src.infrastructure.email_service.EmailService') as mock:
            service = Mock()
            service.send_email = AsyncMock(return_value={
                "success": True,
                "message_id": "msg_test_123"
            })
            mock.return_value = service
            yield service
    
    @staticmethod
    @pytest.fixture
    def mock_sms_service():
        """
        Mock SMS service.
        
        Returns:
            Mock: SMS service mock
        """
        with patch('src.infrastructure.sms_service.SMSService') as mock:
            service = Mock()
            service.send_sms = AsyncMock(return_value={
                "success": True,
                "message_id": "sms_test_123"
            })
            mock.return_value = service
            yield service
    
    @staticmethod
    @pytest.fixture
    def mock_push_service():
        """
        Mock push notification service.
        
        Returns:
            Mock: Push notification service mock
        """
        with patch('src.infrastructure.push_notification_service.PushNotificationService') as mock:
            service = Mock()
            service.send_push = AsyncMock(return_value={
                "success": True,
                "notification_id": "push_test_123"
            })
            mock.return_value = service
            yield service


# ============================================================================
# Test Data Constants
# ============================================================================

class IntegrationTestData:
    """Test data constants for integration tests."""
    
    # Test user data
    USER = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "TestPassword123!",
        "first_name": "Test",
        "last_name": "User",
        "phone": "+1234567890"
    }
    
    ADMIN_USER = {
        "username": "adminuser",
        "email": "admin@example.com",
        "password": "AdminPassword123!",
        "first_name": "Admin",
        "last_name": "User",
        "role": "admin"
    }
    
    # Test vehicle data
    VEHICLE = {
        "license_plate": "TEST123",
        "state": "CA",
        "country": "US",
        "make": "Tesla",
        "model": "Model 3",
        "year": 2023,
        "color": "white",
        "vehicle_type": "ev",
        "fuel_type": "electric",
        "vehicle_size": "standard"
    }
    
    # Test parking spot data
    PARKING_SPOT = {
        "spot_number": "A-101",
        "floor": 1,
        "section": "North",
        "spot_type": "standard",
        "status": "available",
        "access_level": "public",
        "location_id": 1
    }
    
    # Test charging station data
    CHARGING_STATION = {
        "station_name": "Test Station",
        "location_id": 1,
        "connector_type": "CCS",
        "power_rating_kw": 50,
        "status": "available",
        "charging_rate": 0.30
    }
    
    # Test payment data
    PAYMENT = {
        "amount": 100.00,
        "currency": "USD",
        "payment_method": "credit_card",
        "description": "Test payment"
    }
    
    # Test notification data
    NOTIFICATION = {
        "title": "Test Notification",
        "message": "This is a test notification",
        "type": "info"
    }


# ============================================================================
# Exports
# ============================================================================

__all__ = [
    # Fixtures
    "event_loop",
    "test_database",
    "db_session",
    "redis_client",
    "message_bus",
    "cache_service",
    "test_app",
    "test_client",
    "auth_headers",
    
    # Test Data Fixtures
    "test_user",
    "test_admin_user",
    "test_vehicle",
    "test_parking_spot",
    "test_charging_station",
    "test_parking_session",
    "test_payment",
    
    # Helpers
    "IntegrationTestHelpers",
    
    # Decorators
    "integration_test",
    "database_test",
    "redis_test",
    "api_test",
    "slow_integration_test",
    
    # Base Classes
    "BaseIntegrationTest",
    "BaseAPIIntegrationTest",
    
    # External Service Mocks
    "ExternalServiceMocks",
    
    # Test Data
    "IntegrationTestData",
]


# ============================================================================
# Package Version
# ============================================================================

__version__ = "1.0.0"


# ============================================================================
# Package Documentation
# ============================================================================

"""
Integration Tests Package Documentation
=======================================

This package contains integration tests for the parking management system.

What are Integration Tests?
--------------------------
Integration tests verify that multiple components work together correctly.
They test:
- Database interactions
- Redis caching
- Message queues
- API endpoints
- Service interactions
- External service integrations

Structure:
----------
- database/: Database integration tests
- api/: API endpoint integration tests
- services/: Service layer integration tests
- workflows/: End-to-end workflow tests
- external/: External service integration tests

Running Integration Tests:
-------------------------
```bash
# Run all integration tests
pytest tests/integration/

# Run database tests
pytest tests/integration/database/

# Run API tests
pytest tests/integration/api/

# Run with coverage
pytest tests/integration/ --cov=src --cov-report=html

# Run specific test
pytest tests/integration/test_parking_workflow.py