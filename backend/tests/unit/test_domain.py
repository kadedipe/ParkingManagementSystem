# ============================================================================
# Domain Model Unit Tests
# ============================================================================

"""
Unit tests for domain models.

This module contains unit tests for all domain entities, value objects,
and domain services in the parking management system.
"""

import pytest
from datetime import datetime, timedelta
from decimal import Decimal
from unittest.mock import Mock, AsyncMock, patch

from tests.unit import BaseUnitTest, TestDataFactory, async_unit_test

# Import domain models
from src.domain.entities import (
    User,
    Vehicle,
    ParkingSpot,
    ParkingSession,
    ChargingStation,
    ChargingSession,
    Payment,
    Notification,
    Reservation,
    Rate,
)
from src.domain.value_objects import (
    Money,
    Address,
    Location,
    ContactInfo,
    LicensePlate,
    VIN,
    VehicleDimensions,
    TimeRange,
    DateRange,
    Duration,
    Email,
    PhoneNumber,
    PasswordHash,
    Token,
)
from src.domain.enums import (
    VehicleType,
    VehicleStatus,
    ParkingSpotStatus,
    ParkingSessionStatus,
    PaymentStatus,
    NotificationType,
    UserRole,
    UserStatus,
    ChargingConnectorType,
    PaymentMethod,
)
from src.domain.exceptions import (
    DomainError,
    ValidationError,
    BusinessRuleError,
    EntityNotFoundError,
    ConflictError,
)


# ============================================================================
# Value Object Tests
# ============================================================================

class TestMoney(BaseUnitTest):
    """Tests for Money value object."""
    
    def test_create_money(self):
        """Test creating Money instance."""
        money = Money(amount=100.50, currency="USD")
        assert money.amount == Decimal("100.50")
        assert money.currency == "USD"
    
    def test_money_addition(self):
        """Test Money addition."""
        money1 = Money(100.00, "USD")
        money2 = Money(50.00, "USD")
        result = money1 + money2
        assert result.amount == Decimal("150.00")
        assert result.currency == "USD"
    
    def test_money_addition_different_currencies(self):
        """Test Money addition with different currencies."""
        money1 = Money(100.00, "USD")
        money2 = Money(50.00, "EUR")
        with pytest.raises(ValueError):
            money1 + money2
    
    def test_money_subtraction(self):
        """Test Money subtraction."""
        money1 = Money(100.00, "USD")
        money2 = Money(30.00, "USD")
        result = money1 - money2
        assert result.amount == Decimal("70.00")
        assert result.currency == "USD"
    
    def test_money_subtraction_negative(self):
        """Test Money subtraction resulting in negative."""
        money1 = Money(100.00, "USD")
        money2 = Money(150.00, "USD")
        with pytest.raises(ValueError):
            money1 - money2
    
    def test_money_multiplication(self):
        """Test Money multiplication."""
        money = Money(100.00, "USD")
        result = money * 2
        assert result.amount == Decimal("200.00")
        assert result.currency == "USD"
    
    def test_money_comparison(self):
        """Test Money comparison."""
        money1 = Money(100.00, "USD")
        money2 = Money(100.00, "USD")
        money3 = Money(150.00, "USD")
        
        assert money1 == money2
        assert money1 != money3
        assert money1 < money3
        assert money3 > money1
    
    def test_money_validation(self):
        """Test Money validation."""
        with pytest.raises(ValueError):
            Money(-100.00, "USD")
    
    def test_money_format(self):
        """Test Money formatting."""
        money = Money(100.50, "USD")
        assert money.format() == "$100.50"
        assert money.format(symbol=False) == "100.50 USD"


class TestEmail(BaseUnitTest):
    """Tests for Email value object."""
    
    def test_create_email(self):
        """Test creating Email instance."""
        email = Email("test@example.com")
        assert email.value == "test@example.com"
    
    def test_email_validation(self):
        """Test Email validation."""
        with pytest.raises(ValidationError):
            Email("invalid-email")
        
        with pytest.raises(ValidationError):
            Email("test@")
        
        with pytest.raises(ValidationError):
            Email("@example.com")
    
    def test_email_normalization(self):
        """Test Email normalization."""
        email = Email("TEST@Example.com")
        assert email.value == "test@example.com"


class TestPhoneNumber(BaseUnitTest):
    """Tests for PhoneNumber value object."""
    
    def test_create_phone_number(self):
        """Test creating PhoneNumber instance."""
        phone = PhoneNumber("+1234567890")
        assert phone.value == "+1234567890"
        assert phone.country_code == "+1"
        assert phone.number == "234567890"
    
    def test_phone_validation(self):
        """Test PhoneNumber validation."""
        with pytest.raises(ValidationError):
            PhoneNumber("123")
        
        with pytest.raises(ValidationError):
            PhoneNumber("invalid")
    
    def test_phone_format(self):
        """Test PhoneNumber formatting."""
        phone = PhoneNumber("+1234567890")
        assert phone.format_international() == "+1 234 567 890"
        assert phone.format_national() == "(234) 567-890"


class TestLicensePlate(BaseUnitTest):
    """Tests for LicensePlate value object."""
    
    def test_create_license_plate(self):
        """Test creating LicensePlate instance."""
        plate = LicensePlate("ABC123", "CA", "US")
        assert plate.value == "ABC123"
        assert plate.state == "CA"
        assert plate.country == "US"
    
    def test_license_plate_validation(self):
        """Test LicensePlate validation."""
        with pytest.raises(ValidationError):
            LicensePlate("", "CA", "US")
        
        with pytest.raises(ValidationError):
            LicensePlate("ABC123", "", "US")
    
    def test_license_plate_normalization(self):
        """Test LicensePlate normalization."""
        plate = LicensePlate("abc 123", "ca", "us")
        assert plate.value == "ABC123"
        assert plate.state == "CA"
        assert plate.country == "US"


class TestVIN(BaseUnitTest):
    """Tests for VIN value object."""
    
    def test_create_vin(self):
        """Test creating VIN instance."""
        vin = VIN("5YJ3E1EA7PF123456")
        assert vin.value == "5YJ3E1EA7PF123456"
    
    def test_vin_validation(self):
        """Test VIN validation."""
        with pytest.raises(ValidationError):
            VIN("invalid")
        
        with pytest.raises(ValidationError):
            VIN("5YJ3E1EA7PF12345")  # Too short
        
        with pytest.raises(ValidationError):
            VIN("5YJ3E1EA7PF12345X")  # Invalid character
    
    def test_vin_normalization(self):
        """Test VIN normalization."""
        vin = VIN("5yj3e1ea7pf123456")
        assert vin.value == "5YJ3E1EA7PF123456"


class TestLocation(BaseUnitTest):
    """Tests for Location value object."""
    
    def test_create_location(self):
        """Test creating Location instance."""
        location = Location(
            latitude=37.7749,
            longitude=-122.4194,
            address="123 Main St",
            city="San Francisco",
            state="CA",
            country="US",
            zip_code="94105"
        )
        assert location.latitude == 37.7749
        assert location.longitude == -122.4194
        assert location.address == "123 Main St"
    
    def test_location_distance(self):
        """Test location distance calculation."""
        loc1 = Location(latitude=37.7749, longitude=-122.4194)
        loc2 = Location(latitude=37.7750, longitude=-122.4190)
        distance = loc1.distance_to(loc2)
        assert distance > 0
        assert distance < 0.1  # Very close


class TestTimeRange(BaseUnitTest):
    """Tests for TimeRange value object."""
    
    def test_create_time_range(self):
        """Test creating TimeRange instance."""
        start = datetime(2024, 1, 1, 10, 0, 0)
        end = datetime(2024, 1, 1, 12, 0, 0)
        time_range = TimeRange(start, end)
        assert time_range.start == start
        assert time_range.end == end
    
    def test_time_range_validation(self):
        """Test TimeRange validation."""
        start = datetime(2024, 1, 1, 12, 0, 0)
        end = datetime(2024, 1, 1, 10, 0, 0)
        with pytest.raises(ValidationError):
            TimeRange(start, end)
    
    def test_time_range_overlap(self):
        """Test TimeRange overlap detection."""
        range1 = TimeRange(
            datetime(2024, 1, 1, 10, 0, 0),
            datetime(2024, 1, 1, 12, 0, 0)
        )
        range2 = TimeRange(
            datetime(2024, 1, 1, 11, 0, 0),
            datetime(2024, 1, 1, 13, 0, 0)
        )
        range3 = TimeRange(
            datetime(2024, 1, 1, 13, 0, 0),
            datetime(2024, 1, 1, 14, 0, 0)
        )
        
        assert range1.overlaps(range2) is True
        assert range1.overlaps(range3) is False
    
    def test_time_range_duration(self):
        """Test TimeRange duration calculation."""
        start = datetime(2024, 1, 1, 10, 0, 0)
        end = datetime(2024, 1, 1, 12, 30, 0)
        time_range = TimeRange(start, end)
        duration = time_range.duration()
        assert duration.total_seconds() == 9000  # 2.5 hours
        assert duration.minutes == 150


# ============================================================================
# Entity Tests
# ============================================================================

class TestUser(BaseUnitTest):
    """Tests for User entity."""
    
    def test_create_user(self):
        """Test creating User instance."""
        user = User(
            id=1,
            username="testuser",
            email=Email("test@example.com"),
            first_name="Test",
            last_name="User",
            role=UserRole.USER,
            status=UserStatus.ACTIVE
        )
        assert user.id == 1
        assert user.username == "testuser"
        assert user.email.value == "test@example.com"
        assert user.full_name == "Test User"
    
    def test_user_role_validation(self):
        """Test User role validation."""
        user = User(id=1, username="test", email=Email("test@example.com"))
        user.assign_role(UserRole.ADMIN)
        assert user.role == UserRole.ADMIN
        
        with pytest.raises(ValidationError):
            user.assign_role("invalid")
    
    def test_user_deactivation(self):
        """Test User deactivation."""
        user = User(id=1, username="test", email=Email("test@example.com"))
        user.deactivate()
        assert user.status == UserStatus.INACTIVE
        
        with pytest.raises(BusinessRuleError):
            user.deactivate()  # Already inactive


class TestVehicle(BaseUnitTest):
    """Tests for Vehicle entity."""
    
    def test_create_vehicle(self):
        """Test creating Vehicle instance."""
        vehicle = Vehicle(
            id=1,
            license_plate=LicensePlate("ABC123", "CA", "US"),
            make="Tesla",
            model="Model 3",
            year=2023,
            color="White",
            vehicle_type=VehicleType.ELECTRIC,
            owner_id=1
        )
        assert vehicle.id == 1
        assert vehicle.license_plate.value == "ABC123"
        assert vehicle.make == "Tesla"
        assert vehicle.status == VehicleStatus.ACTIVE
    
    def test_vehicle_year_validation(self):
        """Test Vehicle year validation."""
        with pytest.raises(ValidationError):
            Vehicle(
                id=1,
                license_plate=LicensePlate("ABC123", "CA", "US"),
                make="Tesla",
                model="Model 3",
                year=1899,  # Too old
                color="White",
                vehicle_type=VehicleType.ELECTRIC,
                owner_id=1
            )
        
        with pytest.raises(ValidationError):
            Vehicle(
                id=1,
                license_plate=LicensePlate("ABC123", "CA", "US"),
                make="Tesla",
                model="Model 3",
                year=2030,  # Too future
                color="White",
                vehicle_type=VehicleType.ELECTRIC,
                owner_id=1
            )
    
    def test_vehicle_registration(self):
        """Test Vehicle registration."""
        vehicle = Vehicle(
            id=1,
            license_plate=LicensePlate("ABC123", "CA", "US"),
            make="Tesla",
            model="Model 3",
            year=2023,
            color="White",
            vehicle_type=VehicleType.ELECTRIC,
            owner_id=1
        )
        vehicle.register()
        assert vehicle.is_registered is True
    
    def test_vehicle_unregister(self):
        """Test Vehicle unregistration."""
        vehicle = Vehicle(
            id=1,
            license_plate=LicensePlate("ABC123", "CA", "US"),
            make="Tesla",
            model="Model 3",
            year=2023,
            color="White",
            vehicle_type=VehicleType.ELECTRIC,
            owner_id=1
        )
        vehicle.register()
        vehicle.unregister("Sold")
        assert vehicle.is_registered is False
        assert vehicle.status == VehicleStatus.INACTIVE


class TestParkingSpot(BaseUnitTest):
    """Tests for ParkingSpot entity."""
    
    def test_create_parking_spot(self):
        """Test creating ParkingSpot instance."""
        spot = ParkingSpot(
            id=1,
            spot_number="A-101",
            location=Location(latitude=37.7749, longitude=-122.4194),
            spot_type=ParkingSpotType.STANDARD,
            is_covered=True,
            is_handicap_accessible=False,
            is_ev_charging=False
        )
        assert spot.id == 1
        assert spot.spot_number == "A-101"
        assert spot.status == ParkingSpotStatus.AVAILABLE
    
    def test_parking_spot_reservation(self):
        """Test ParkingSpot reservation."""
        spot = ParkingSpot(id=1, spot_number="A-101")
        spot.reserve()
        assert spot.status == ParkingSpotStatus.RESERVED
        
        with pytest.raises(BusinessRuleError):
            spot.reserve()  # Already reserved
    
    def test_parking_spot_occupancy(self):
        """Test ParkingSpot occupancy."""
        spot = ParkingSpot(id=1, spot_number="A-101")
        spot.reserve()
        spot.occupy()
        assert spot.status == ParkingSpotStatus.OCCUPIED
        
        with pytest.raises(BusinessRuleError):
            spot.reserve()  # Already occupied
    
    def test_parking_spot_release(self):
        """Test ParkingSpot release."""
        spot = ParkingSpot(id=1, spot_number="A-101")
        spot.reserve()
        spot.release()
        assert spot.status == ParkingSpotStatus.AVAILABLE


class TestParkingSession(BaseUnitTest):
    """Tests for ParkingSession entity."""
    
    def test_create_parking_session(self):
        """Test creating ParkingSession instance."""
        session = ParkingSession(
            id=1,
            vehicle_id=1,
            spot_id=1,
            start_time=datetime(2024, 1, 1, 10, 0, 0),
            end_time=datetime(2024, 1, 1, 12, 0, 0)
        )
        assert session.id == 1
        assert session.vehicle_id == 1
        assert session.duration_minutes == 120
    
    def test_parking_session_end(self):
        """Test ParkingSession ending."""
        session = ParkingSession(
            id=1,
            vehicle_id=1,
            spot_id=1,
            start_time=datetime(2024, 1, 1, 10, 0, 0)
        )
        session.end()
        assert session.status == ParkingSessionStatus.COMPLETED
        assert session.end_time is not None
    
    def test_parking_session_cancel(self):
        """Test ParkingSession cancellation."""
        session = ParkingSession(
            id=1,
            vehicle_id=1,
            spot_id=1,
            start_time=datetime(2024, 1, 1, 10, 0, 0)
        )
        session.cancel()
        assert session.status == ParkingSessionStatus.CANCELLED


class TestChargingSession(BaseUnitTest):
    """Tests for ChargingSession entity."""
    
    def test_create_charging_session(self):
        """Test creating ChargingSession instance."""
        session = ChargingSession(
            id=1,
            vehicle_id=1,
            station_id=1,
            start_time=datetime(2024, 1, 1, 10, 0, 0),
            connector_type=ChargingConnectorType.CCS,
            max_power_kw=50
        )
        assert session.id == 1
        assert session.vehicle_id == 1
        assert session.connector_type == ChargingConnectorType.CCS
    
    def test_charging_session_end(self):
        """Test ChargingSession ending."""
        session = ChargingSession(
            id=1,
            vehicle_id=1,
            station_id=1,
            start_time=datetime(2024, 1, 1, 10, 0, 0),
            connector_type=ChargingConnectorType.CCS,
            max_power_kw=50
        )
        session.end(energy_consumed_kwh=25.5)
        assert session.status == ParkingSessionStatus.COMPLETED
        assert session.energy_consumed_kwh == 25.5
    
    def test_charging_session_energy_validation(self):
        """Test ChargingSession energy validation."""
        session = ChargingSession(
            id=1,
            vehicle_id=1,
            station_id=1,
            start_time=datetime(2024, 1, 1, 10, 0, 0),
            connector_type=ChargingConnectorType.CCS,
            max_power_kw=50
        )
        with pytest.raises(ValidationError):
            session.end(energy_consumed_kwh=-5)  # Negative energy


class TestPayment(BaseUnitTest):
    """Tests for Payment entity."""
    
    def test_create_payment(self):
        """Test creating Payment instance."""
        payment = Payment(
            id=1,
            amount=Money(100.00, "USD"),
            session_id=1,
            session_type="parking",
            payment_method=PaymentMethod.CREDIT_CARD
        )
        assert payment.id == 1
        assert payment.amount.amount == Decimal("100.00")
        assert payment.status == PaymentStatus.PENDING
    
    def test_payment_processing(self):
        """Test Payment processing."""
        payment = Payment(
            id=1,
            amount=Money(100.00, "USD"),
            session_id=1,
            session_type="parking",
            payment_method=PaymentMethod.CREDIT_CARD
        )
        payment.process()
        assert payment.status == PaymentStatus.PROCESSING
        
        payment.complete()
        assert payment.status == PaymentStatus.COMPLETED
    
    def test_payment_failure(self):
        """Test Payment failure."""
        payment = Payment(
            id=1,
            amount=Money(100.00, "USD"),
            session_id=1,
            session_type="parking",
            payment_method=PaymentMethod.CREDIT_CARD
        )
        payment.fail("Insufficient funds")
        assert payment.status == PaymentStatus.FAILED
        assert payment.failure_reason == "Insufficient funds"


class TestNotification(BaseUnitTest):
    """Tests for Notification entity."""
    
    def test_create_notification(self):
        """Test creating Notification instance."""
        notification = Notification(
            id=1,
            user_id=1,
            title="Test Notification",
            message="This is a test",
            notification_type=NotificationType.INFO
        )
        assert notification.id == 1
        assert notification.user_id == 1
        assert notification.is_read is False
    
    def test_notification_mark_read(self):
        """Test Notification marking as read."""
        notification = Notification(
            id=1,
            user_id=1,
            title="Test",
            message="Test message",
            notification_type=NotificationType.INFO
        )
        notification.mark_read()
        assert notification.is_read is True
        assert notification.read_at is not None


# ============================================================================
# Domain Service Tests
# ============================================================================

class TestParkingService(BaseUnitTest):
    """Tests for Parking domain service."""
    
    @async_unit_test
    async def test_calculate_parking_fee(self):
        """Test parking fee calculation."""
        from src.domain.services import ParkingService
        
        service = ParkingService()
        
        # Test hourly rate
        start = datetime(2024, 1, 1, 10, 0, 0)
        end = datetime(2024, 1, 1, 12, 30, 0)
        fee = service.calculate_fee(start, end, rate_per_hour=Decimal("5.00"))
        assert fee.amount == Decimal("12.50")  # 2.5 hours * $5
        
        # Test minimum fee
        start = datetime(2024, 1, 1, 10, 0, 0)
        end = datetime(2024, 1, 1, 10, 5, 0)
        fee = service.calculate_fee(
            start, end, rate_per_hour=Decimal("5.00"), minimum_fee=Decimal("2.00")
        )
        assert fee.amount == Decimal("2.00")
    
    @async_unit_test
    async def test_parking_availability(self):
        """Test parking availability checking."""
        from src.domain.services import ParkingService
        
        service = ParkingService()
        spots = [
            ParkingSpot(id=1, spot_number="A-101", status=ParkingSpotStatus.AVAILABLE),
            ParkingSpot(id=2, spot_number="A-102", status=ParkingSpotStatus.OCCUPIED),
            ParkingSpot(id=3, spot_number="A-103", status=ParkingSpotStatus.RESERVED),
            ParkingSpot(id=4, spot_number="A-104", status=ParkingSpotStatus.AVAILABLE),
        ]
        
        available = service.get_available_spots(spots)
        assert len(available) == 2
        assert all(spot.status == ParkingSpotStatus.AVAILABLE for spot in available)


class TestChargingService(BaseUnitTest):
    """Tests for Charging domain service."""
    
    @async_unit_test
    async def test_calculate_charging_cost(self):
        """Test charging cost calculation."""
        from src.domain.services import ChargingService
        
        service = ChargingService()
        
        # Test energy-based cost
        cost = service.calculate_cost(
            energy_consumed_kwh=25.5,
            rate_per_kwh=Decimal("0.30")
        )
        assert cost.amount == Decimal("7.65")
        
        # Test time-based cost
        start = datetime(2024, 1, 1, 10, 0, 0)
        end = datetime(2024, 1, 1, 12, 0, 0)
        cost = service.calculate_cost(
            start_time=start,
            end_time=end,
            rate_per_hour=Decimal("10.00")
        )
        assert cost.amount == Decimal("20.00")


# ============================================================================
# Domain Event Tests
# ============================================================================

class TestDomainEvents(BaseUnitTest):
    """Tests for domain events."""
    
    def test_vehicle_registered_event(self):
        """Test VehicleRegistered event."""
        from src.domain.events import VehicleRegisteredEvent
        
        vehicle = Vehicle(
            id=1,
            license_plate=LicensePlate("ABC123", "CA", "US"),
            make="Tesla",
            model="Model 3",
            year=2023,
            color="White",
            vehicle_type=VehicleType.ELECTRIC,
            owner_id=1
        )
        event = VehicleRegisteredEvent(vehicle=vehicle)
        assert event.vehicle_id == 1
        assert event.license_plate == "ABC123"
        assert event.event_type == "vehicle.registered"
    
    def test_parking_session_started_event(self):
        """Test ParkingSessionStarted event."""
        from src.domain.events import ParkingSessionStartedEvent
        
        session = ParkingSession(
            id=1,
            vehicle_id=1,
            spot_id=1,
            start_time=datetime(2024, 1, 1, 10, 0, 0)
        )
        event = ParkingSessionStartedEvent(session=session)
        assert event.session_id == 1
        assert event.vehicle_id == 1
        assert event.event_type == "parking.session.started"


# ============================================================================
# Repository Tests (with mocks)
# ============================================================================

class TestRepositoryInterfaces(BaseUnitTest):
    """Tests for repository interfaces."""
    
    @async_unit_test
    async def test_vehicle_repository_interface(self):
        """Test Vehicle repository interface."""
        from src.domain.repositories import VehicleRepository
        from src.domain.entities import Vehicle
        
        repo = VehicleRepository()
        
        # Test interface methods
        assert hasattr(repo, "get_by_id")
        assert hasattr(repo, "get_by_license_plate")
        assert hasattr(repo, "get_by_owner")
        assert hasattr(repo, "save")
        assert hasattr(repo, "delete")
        assert hasattr(repo, "find_all")
        assert hasattr(repo, "count")
    
    @async_unit_test
    async def test_parking_repository_interface(self):
        """Test Parking repository interface."""
        from src.domain.repositories import ParkingRepository
        
        repo = ParkingRepository()
        
        # Test interface methods
        assert hasattr(repo, "get_by_id")
        assert hasattr(repo, "get_by_spot_number")
        assert hasattr(repo, "get_available_spots")
        assert hasattr(repo, "reserve_spot")
        assert hasattr(repo, "release_spot")
        assert hasattr(repo, "save")
        assert hasattr(repo, "delete")


# ============================================================================
# Error Tests
# ============================================================================

class TestDomainErrors(BaseUnitTest):
    """Tests for domain errors."""
    
    def test_validation_error(self):
        """Test ValidationError."""
        error = ValidationError("Invalid email address", field="email")
        assert error.message == "Invalid email address"
        assert error.field == "email"
        assert error.code == "validation_error"
    
    def test_business_rule_error(self):
        """Test BusinessRuleError."""
        error = BusinessRuleError("Cannot reserve occupied spot")
        assert error.message == "Cannot reserve occupied spot"
        assert error.code == "business_rule_error"
    
    def test_entity_not_found_error(self):
        """Test EntityNotFoundError."""
        error = EntityNotFoundError("Vehicle", "id", 123)
        assert error.entity == "Vehicle"
        assert error.field == "id"
        assert error.value == 123
        assert "Vehicle with id 123 not found" in error.message


# ============================================================================
# Factory Tests
# ============================================================================

class TestDomainFactories(BaseUnitTest):
    """Tests for domain factories."""
    
    def test_user_factory(self):
        """Test User factory."""
        from src.domain.factories import UserFactory
        
        user = UserFactory.create_user(
            username="testuser",
            email="test@example.com",
            password="TestPassword123!",
            first_name="Test",
            last_name="User"
        )
        
        assert user.username == "testuser"
        assert user.email.value == "test@example.com"
        assert user.first_name == "Test"
        assert user.last_name == "User"
        assert user.role == UserRole.USER
    
    def test_vehicle_factory(self):
        """Test Vehicle factory."""
        from src.domain.factories import VehicleFactory
        
        vehicle = VehicleFactory.create_vehicle(
            license_plate="ABC123",
            state="CA",
            make="Tesla",
            model="Model 3",
            year=2023,
            owner_id=1
        )
        
        assert vehicle.license_plate.value == "ABC123"
        assert vehicle.make == "Tesla"
        assert vehicle.model == "Model 3"
        assert vehicle.year == 2023
        
    def test_parking_session_factory(self):
        """Test ParkingSession factory."""
        from src.domain.factories import ParkingSessionFactory
        
        session = ParkingSessionFactory.create_session(
            vehicle_id=1,
            spot_id=1,
            start_time=datetime(2024, 1, 1, 10, 0, 0)
        )
        
        assert session.vehicle_id == 1
        assert session.spot_id == 1
        assert session.start_time == datetime(2024, 1, 1, 10, 0, 0)
        assert session.status == ParkingSessionStatus.ACTIVE