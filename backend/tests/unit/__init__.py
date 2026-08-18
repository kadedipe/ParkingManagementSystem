# ============================================================================
# Unit Tests Package
# ============================================================================

"""
Unit tests package for the parking management system.

This package contains unit tests for individual components, services,
repositories, and utilities. Unit tests should be fast, isolated, and
test a single unit of functionality in isolation.
"""

import pytest
from typing import Dict, Any, Optional, Type, List
from unittest.mock import Mock, MagicMock, AsyncMock, patch


# ============================================================================
# Unit Test Configuration
# ============================================================================

# Mark all tests in this package as unit tests
pytestmark = pytest.mark.unit

# Test configuration
UNIT_TEST_TIMEOUT = 5  # seconds
UNIT_TEST_SLOW_THRESHOLD = 0.5  # seconds


# ============================================================================
# Unit Test Fixtures
# ============================================================================

@pytest.fixture
def mock_db_session():
    """
    Create a mock database session.
    
    Returns:
        AsyncMock: Mock database session
    """
    session = AsyncMock()
    session.commit = AsyncMock()
    session.rollback = AsyncMock()
    session.close = AsyncMock()
    session.execute = AsyncMock()
    session.add = Mock()
    session.delete = Mock()
    session.flush = Mock()
    session.refresh = AsyncMock()
    session.merge = Mock()
    session.begin = AsyncMock()
    return session


@pytest.fixture
def mock_redis_client():
    """
    Create a mock Redis client.
    
    Returns:
        AsyncMock: Mock Redis client
    """
    client = AsyncMock()
    client.get = AsyncMock()
    client.set = AsyncMock()
    client.delete = AsyncMock()
    client.exists = AsyncMock()
    client.expire = AsyncMock()
    client.ttl = AsyncMock()
    client.incr = AsyncMock()
    client.decr = AsyncMock()
    client.hget = AsyncMock()
    client.hset = AsyncMock()
    client.hdel = AsyncMock()
    client.hgetall = AsyncMock()
    client.keys = AsyncMock()
    client.flushdb = AsyncMock()
    return client


@pytest.fixture
def mock_message_bus():
    """
    Create a mock message bus.
    
    Returns:
        AsyncMock: Mock message bus
    """
    bus = AsyncMock()
    bus.publish = AsyncMock()
    bus.subscribe = AsyncMock()
    bus.unsubscribe = AsyncMock()
    bus.consume = AsyncMock()
    return bus


@pytest.fixture
def mock_cache_service():
    """
    Create a mock cache service.
    
    Returns:
        AsyncMock: Mock cache service
    """
    cache = AsyncMock()
    cache.get = AsyncMock()
    cache.set = AsyncMock()
    cache.delete = AsyncMock()
    cache.exists = AsyncMock()
    cache.invalidate = AsyncMock()
    cache.clear = AsyncMock()
    return cache


@pytest.fixture
def mock_repository():
    """
    Create a mock repository.
    
    Returns:
        AsyncMock: Mock repository
    """
    repo = AsyncMock()
    repo.create = AsyncMock()
    repo.get_by_id = AsyncMock()
    repo.get_all = AsyncMock()
    repo.update = AsyncMock()
    repo.delete = AsyncMock()
    repo.exists = AsyncMock()
    repo.count = AsyncMock()
    repo.search = AsyncMock()
    return repo


@pytest.fixture
def mock_service():
    """
    Create a mock service.
    
    Returns:
        AsyncMock: Mock service
    """
    service = AsyncMock()
    service.create = AsyncMock()
    service.get_by_id = AsyncMock()
    service.get_all = AsyncMock()
    service.update = AsyncMock()
    service.delete = AsyncMock()
    service.exists = AsyncMock()
    service.count = AsyncMock()
    service.search = AsyncMock()
    return service


# ============================================================================
# Unit Test Helpers
# ============================================================================

class UnitTestHelpers:
    """
    Helper functions for unit tests.
    """
    
    @staticmethod
    def assert_async_called(mock_obj, times: int = 1):
        """
        Assert that an async mock was called a specific number of times.
        
        Args:
            mock_obj: Async mock object
            times: Expected number of calls
        """
        assert mock_obj.call_count == times, f"Expected {times} calls, got {mock_obj.call_count}"
    
    @staticmethod
    def assert_async_called_with(mock_obj, *args, **kwargs):
        """
        Assert that an async mock was called with specific arguments.
        
        Args:
            mock_obj: Async mock object
            *args: Expected positional arguments
            **kwargs: Expected keyword arguments
        """
        mock_obj.assert_called_with(*args, **kwargs)
    
    @staticmethod
    def assert_async_called_once_with(mock_obj, *args, **kwargs):
        """
        Assert that an async mock was called once with specific arguments.
        
        Args:
            mock_obj: Async mock object
            *args: Expected positional arguments
            **kwargs: Expected keyword arguments
        """
        mock_obj.assert_called_once_with(*args, **kwargs)
    
    @staticmethod
    def assert_async_not_called(mock_obj):
        """
        Assert that an async mock was not called.
        
        Args:
            mock_obj: Async mock object
        """
        mock_obj.assert_not_called()
    
    @staticmethod
    def create_mock_response(data: Any = None, status_code: int = 200):
        """
        Create a mock response for testing.
        
        Args:
            data: Response data
            status_code: HTTP status code
            
        Returns:
            Mock: Mock response
        """
        response = Mock()
        response.status_code = status_code
        response.json = Mock(return_value=data)
        response.content = Mock()
        response.text = Mock(return_value=str(data) if data else "")
        return response
    
    @staticmethod
    def create_mock_exception(
        exception_type: Type[Exception] = Exception,
        message: str = "Test exception"
    ):
        """
        Create a mock exception for testing.
        
        Args:
            exception_type: Exception class
            message: Exception message
            
        Returns:
            Exception: Mock exception
        """
        return exception_type(message)
    
    @staticmethod
    def assert_raises_with_message(func, exception_type: Type[Exception], message: str, *args, **kwargs):
        """
        Assert that a function raises an exception with a specific message.
        
        Args:
            func: Function to test
            exception_type: Expected exception type
            message: Expected exception message
            *args: Function arguments
            **kwargs: Function keyword arguments
        """
        with pytest.raises(exception_type) as exc_info:
            func(*args, **kwargs)
        assert str(exc_info.value) == message
    
    @staticmethod
    def async_assert_raises_with_message(async_func, exception_type: Type[Exception], message: str, *args, **kwargs):
        """
        Assert that an async function raises an exception with a specific message.
        
        Args:
            async_func: Async function to test
            exception_type: Expected exception type
            message: Expected exception message
            *args: Function arguments
            **kwargs: Function keyword arguments
        """
        import asyncio
        with pytest.raises(exception_type) as exc_info:
            asyncio.run(async_func(*args, **kwargs))
        assert str(exc_info.value) == message
    
    @staticmethod
    def patch_async(module: str, attribute: str):
        """
        Patch an async attribute.
        
        Args:
            module: Module name
            attribute: Attribute name
            
        Returns:
            AsyncMock: Patched attribute
        """
        from unittest.mock import AsyncMock
        return patch(f"{module}.{attribute}", new_callable=AsyncMock)


# ============================================================================
# Unit Test Decorators
# ============================================================================

def unit_test(func):
    """
    Decorator to mark a test as a unit test.
    
    Args:
        func: Test function
        
    Returns:
        function: Decorated function
    """
    func = pytest.mark.unit(func)
    func = pytest.mark.timeout(UNIT_TEST_TIMEOUT)(func)
    return func


def slow_unit_test(func):
    """
    Decorator to mark a slow unit test.
    
    Args:
        func: Test function
        
    Returns:
        function: Decorated function
    """
    func = pytest.mark.unit(func)
    func = pytest.mark.slow(func)
    func = pytest.mark.timeout(UNIT_TEST_TIMEOUT * 2)(func)
    return func


def async_unit_test(func):
    """
    Decorator to mark an async unit test.
    
    Args:
        func: Test function
        
    Returns:
        function: Decorated function
    """
    func = pytest.mark.unit(func)
    func = pytest.mark.asyncio(func)
    return func


def mock_database(func):
    """
    Decorator to mock database for a test.
    
    Args:
        func: Test function
        
    Returns:
        function: Decorated function
    """
    @pytest.mark.unit
    @pytest.mark.asyncio
    @patch('src.infrastructure.database.get_db_session')
    async def wrapper(mock_get_session, *args, **kwargs):
        mock_session = AsyncMock()
        mock_get_session.return_value = mock_session
        return await func(mock_session, *args, **kwargs)
    
    return wrapper


# ============================================================================
# Unit Test Base Classes
# ============================================================================

class BaseUnitTest:
    """
    Base class for unit tests.
    
    This class provides common setup and teardown functionality
    for unit tests.
    """
    
    @pytest.fixture(autouse=True)
    def setup_method(self):
        """Setup method called before each test."""
        self.setup()
        yield
        self.teardown()
    
    def setup(self):
        """Setup method to be overridden by subclasses."""
        pass
    
    def teardown(self):
        """Teardown method to be overridden by subclasses."""
        pass
    
    def create_mock(self, **kwargs):
        """
        Create a mock object with attributes.
        
        Args:
            **kwargs: Attribute values
            
        Returns:
            Mock: Mock object
        """
        mock = Mock()
        for key, value in kwargs.items():
            setattr(mock, key, value)
        return mock
    
    def create_async_mock(self, **kwargs):
        """
        Create an async mock object with attributes.
        
        Args:
            **kwargs: Attribute values
            
        Returns:
            AsyncMock: Async mock object
        """
        mock = AsyncMock()
        for key, value in kwargs.items():
            if callable(value):
                setattr(mock, key, AsyncMock(return_value=value))
            else:
                setattr(mock, key, value)
        return mock


class BaseServiceUnitTest(BaseUnitTest):
    """
    Base class for service unit tests.
    
    This class provides common setup for testing services
    with mocked dependencies.
    """
    
    def setup(self):
        """Setup method."""
        self.repository = AsyncMock()
        self.cache = AsyncMock()
        self.message_bus = AsyncMock()
        self.validator = Mock()
        self.logger = Mock()
        
        # Create the service with mocked dependencies
        self.service = self.create_service(
            repository=self.repository,
            cache=self.cache,
            message_bus=self.message_bus,
            validator=self.validator,
            logger=self.logger
        )
    
    def create_service(self, **kwargs):
        """
        Create the service to be tested.
        
        This method should be overridden by subclasses.
        
        Args:
            **kwargs: Dependencies
            
        Returns:
            Any: Service instance
        """
        raise NotImplementedError("Subclasses must implement create_service")


class BaseRepositoryUnitTest(BaseUnitTest):
    """
    Base class for repository unit tests.
    
    This class provides common setup for testing repositories
    with mocked database sessions.
    """
    
    def setup(self):
        """Setup method."""
        self.session = AsyncMock()
        self.repository = self.create_repository(session=self.session)
    
    def create_repository(self, **kwargs):
        """
        Create the repository to be tested.
        
        This method should be overridden by subclasses.
        
        Args:
            **kwargs: Dependencies
            
        Returns:
            Any: Repository instance
        """
        raise NotImplementedError("Subclasses must implement create_repository")


# ============================================================================
# Unit Test Data Factory
# ============================================================================

class TestDataFactory:
    """
    Factory for creating test data.
    """
    
    @staticmethod
    def create_user(data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Create test user data.
        
        Args:
            data: Custom data to override defaults
            
        Returns:
            Dict: User data
        """
        default_data = {
            "id": 1,
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPassword123!",
            "first_name": "Test",
            "last_name": "User",
            "phone": "+1234567890",
            "is_active": True,
            "is_admin": False,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00",
        }
        
        if data:
            default_data.update(data)
        
        return default_data
    
    @staticmethod
    def create_vehicle(data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Create test vehicle data.
        
        Args:
            data: Custom data to override defaults
            
        Returns:
            Dict: Vehicle data
        """
        default_data = {
            "id": 1,
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
            "status": "active",
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00",
        }
        
        if data:
            default_data.update(data)
        
        return default_data
    
    @staticmethod
    def create_parking_spot(data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Create test parking spot data.
        
        Args:
            data: Custom data to override defaults
            
        Returns:
            Dict: Parking spot data
        """
        default_data = {
            "id": 1,
            "spot_number": "A-101",
            "floor": 1,
            "section": "North",
            "spot_type": "standard",
            "status": "available",
            "access_level": "public",
            "location_id": 1,
            "is_covered": True,
            "is_handicap_accessible": False,
            "is_ev_charging": False,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00",
        }
        
        if data:
            default_data.update(data)
        
        return default_data
    
    @staticmethod
    def create_charging_station(data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Create test charging station data.
        
        Args:
            data: Custom data to override defaults
            
        Returns:
            Dict: Charging station data
        """
        default_data = {
            "id": 1,
            "station_name": "Test Station",
            "location_id": 1,
            "connector_type": "CCS",
            "power_rating_kw": 50,
            "status": "available",
            "charging_rate": 0.30,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00",
        }
        
        if data:
            default_data.update(data)
        
        return default_data
    
    @staticmethod
    def create_payment(data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Create test payment data.
        
        Args:
            data: Custom data to override defaults
            
        Returns:
            Dict: Payment data
        """
        default_data = {
            "id": 1,
            "amount": 100.00,
            "currency": "USD",
            "payment_method": "credit_card",
            "description": "Test payment",
            "status": "pending",
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00",
        }
        
        if data:
            default_data.update(data)
        
        return default_data
    
    @staticmethod
    def create_notification(data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Create test notification data.
        
        Args:
            data: Custom data to override defaults
            
        Returns:
            Dict: Notification data
        """
        default_data = {
            "id": 1,
            "user_id": 1,
            "title": "Test Notification",
            "message": "This is a test notification",
            "type": "info",
            "is_read": False,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00",
        }
        
        if data:
            default_data.update(data)
        
        return default_data
    
    @staticmethod
    def create_parking_session(data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Create test parking session data.
        
        Args:
            data: Custom data to override defaults
            
        Returns:
            Dict: Parking session data
        """
        default_data = {
            "id": 1,
            "vehicle_id": 1,
            "spot_id": 1,
            "start_time": "2024-01-01T10:00:00",
            "end_time": "2024-01-01T12:00:00",
            "status": "completed",
            "total_amount": 10.00,
            "created_at": "2024-01-01T10:00:00",
            "updated_at": "2024-01-01T12:00:00",
        }
        
        if data:
            default_data.update(data)
        
        return default_data


# ============================================================================
# Exports
# ============================================================================

__all__ = [
    # Fixtures
    "mock_db_session",
    "mock_redis_client",
    "mock_message_bus",
    "mock_cache_service",
    "mock_repository",
    "mock_service",
    
    # Helpers
    "UnitTestHelpers",
    
    # Decorators
    "unit_test",
    "slow_unit_test",
    "async_unit_test",
    "mock_database",
    
    # Base Classes
    "BaseUnitTest",
    "BaseServiceUnitTest",
    "BaseRepositoryUnitTest",
    
    # Data Factory
    "TestDataFactory",
]


# ============================================================================
# Package Version
# ============================================================================

__version__ = "1.0.0"


# ============================================================================
# Package Documentation
# ============================================================================

"""
Unit Tests Package Documentation
================================

This package contains unit tests for the parking management system.

What are Unit Tests?
-------------------
Unit tests test individual components in isolation. They should:
- Be fast (run in milliseconds)
- Test a single unit of functionality
- Use mocks for dependencies
- Be deterministic and repeatable
- Focus on edge cases and error conditions

Structure:
----------
- services/: Tests for service layer
- repositories/: Tests for repository layer
- utils/: Tests for utility functions
- validators/: Tests for validators
- models/: Tests for domain models
- schemas/: Tests for schemas

Running Unit Tests:
------------------
```bash
# Run all unit tests
pytest tests/unit/

# Run with coverage
pytest tests/unit/ --cov=src --cov-report=html

# Run specific test file
pytest tests/unit/test_vehicle_service.py

# Run tests with specific marker
pytest tests/unit/ -m "not slow"