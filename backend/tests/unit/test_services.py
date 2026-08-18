# ============================================================================
# Service Layer Unit Tests
# ============================================================================

"""
Unit tests for service layer.

This module contains unit tests for all application services including
vehicle, parking, charging, payment, notification, and user services.
"""

import pytest
from datetime import datetime, timedelta
from decimal import Decimal
from unittest.mock import Mock, AsyncMock, patch
from typing import Dict, Any, Optional

from tests.unit import (
    BaseServiceUnitTest,
    TestDataFactory,
    async_unit_test,
    mock_database,
)

# Import services
from src.application.services.vehicle_service import VehicleService
from src.application.services.parking_service import ParkingService
from src.application.services.charging_service import ChargingService
from src.application.services.payment_service import PaymentService
from src.application.services.notification_service import NotificationService
from src.application.services.user_service import UserService
from src.application.services.auth_service import AuthService
from src.application.services.webhook_service import WebhookService
from src.application.services.report_service import ReportService

# Import exceptions
from src.domain.exceptions import (
    ValidationError,
    BusinessRuleError,
    EntityNotFoundError,
    ConflictError,
    UnauthorizedError,
    PermissionDeniedError,
)

# Import schemas
from src.interfaces.schemas import (
    VehicleCreateRequest,
    VehicleUpdateRequest,
    ParkingSessionCreateRequest,
    ChargingSessionCreateRequest,
    PaymentCreateRequest,
    NotificationCreateRequest,
    UserCreateRequest,
)


# ============================================================================
# Vehicle Service Tests
# ============================================================================

class TestVehicleService(BaseServiceUnitTest):
    """Tests for VehicleService."""
    
    def create_service(self, **kwargs):
        """Create VehicleService instance."""
        return VehicleService(**kwargs)
    
    @async_unit_test
    async def test_create_vehicle_success(self):
        """Test creating a vehicle successfully."""
        # Arrange
        vehicle_data = TestDataFactory.create_vehicle()
        self.repository.create.return_value = vehicle_data
        
        # Act
        result = await self.service.create_vehicle(vehicle_data)
        
        # Assert
        self.repository.create.assert_called_once()
        assert result["license_plate"] == vehicle_data["license_plate"]
        assert result["make"] == vehicle_data["make"]
    
    @async_unit_test
    async def test_create_vehicle_duplicate_license(self):
        """Test creating a vehicle with duplicate license plate."""
        # Arrange
        vehicle_data = TestDataFactory.create_vehicle()
        self.repository.find_by_license.return_value = vehicle_data
        
        # Act & Assert
        with pytest.raises(ConflictError) as exc_info:
            await self.service.create_vehicle(vehicle_data)
        assert "License plate already exists" in str(exc_info.value)
    
    @async_unit_test
    async def test_get_vehicle_by_id_success(self):
        """Test getting a vehicle by ID successfully."""
        # Arrange
        vehicle_data = TestDataFactory.create_vehicle()
        self.repository.get_by_id.return_value = vehicle_data
        
        # Act
        result = await self.service.get_vehicle_by_id(1)
        
        # Assert
        self.repository.get_by_id.assert_called_once_with(1)
        assert result["id"] == 1
        assert result["license_plate"] == vehicle_data["license_plate"]
    
    @async_unit_test
    async def test_get_vehicle_by_id_not_found(self):
        """Test getting a vehicle by ID when not found."""
        # Arrange
        self.repository.get_by_id.return_value = None
        
        # Act & Assert
        with pytest.raises(EntityNotFoundError):
            await self.service.get_vehicle_by_id(999)
    
    @async_unit_test
    async def test_update_vehicle_success(self):
        """Test updating a vehicle successfully."""
        # Arrange
        vehicle_data = TestDataFactory.create_vehicle()
        update_data = {"make": "Updated Make", "model": "Updated Model"}
        self.repository.get_by_id.return_value = vehicle_data
        self.repository.update.return_value = {**vehicle_data, **update_data}
        
        # Act
        result = await self.service.update_vehicle(1, update_data)
        
        # Assert
        self.repository.get_by_id.assert_called_once_with(1)
        self.repository.update.assert_called_once()
        assert result["make"] == "Updated Make"
        assert result["model"] == "Updated Model"
    
    @async_unit_test
    async def test_delete_vehicle_success(self):
        """Test deleting a vehicle successfully."""
        # Arrange
        vehicle_data = TestDataFactory.create_vehicle()
        self.repository.get_by_id.return_value = vehicle_data
        self.repository.delete.return_value = True
        
        # Act
        result = await self.service.delete_vehicle(1)
        
        # Assert
        self.repository.get_by_id.assert_called_once_with(1)
        self.repository.delete.assert_called_once_with(1)
        assert result is True
    
    @async_unit_test
    async def test_search_vehicles(self):
        """Test searching for vehicles."""
        # Arrange
        vehicles = [TestDataFactory.create_vehicle() for _ in range(5)]
        self.repository.search.return_value = (vehicles, len(vehicles))
        
        # Act
        results, total = await self.service.search_vehicles(query="Tesla")
        
        # Assert
        self.repository.search.assert_called_once()
        assert len(results) == 5
        assert total == 5
    
    @async_unit_test
    async def test_get_vehicles_by_owner(self):
        """Test getting vehicles by owner ID."""
        # Arrange
        vehicles = [TestDataFactory.create_vehicle() for _ in range(3)]
        self.repository.find_by_owner.return_value = vehicles
        
        # Act
        results = await self.service.get_vehicles_by_owner(1)
        
        # Assert
        self.repository.find_by_owner.assert_called_once_with(1)
        assert len(results) == 3


# ============================================================================
# Parking Service Tests
# ============================================================================

class TestParkingService(BaseServiceUnitTest):
    """Tests for ParkingService."""
    
    def create_service(self, **kwargs):
        """Create ParkingService instance."""
        return ParkingService(**kwargs)
    
    @async_unit_test
    async def test_create_parking_session_success(self):
        """Test creating a parking session successfully."""
        # Arrange
        session_data = {
            "vehicle_id": 1,
            "spot_id": 1,
            "start_time": datetime.now(),
        }
        self.repository.create_session.return_value = {"id": 1, **session_data}
        
        # Act
        result = await self.service.create_parking_session(session_data)
        
        # Assert
        self.repository.create_session.assert_called_once()
        assert result["id"] == 1
        assert result["vehicle_id"] == 1
    
    @async_unit_test
    async def test_create_parking_session_spot_unavailable(self):
        """Test creating a parking session when spot is unavailable."""
        # Arrange
        session_data = {
            "vehicle_id": 1,
            "spot_id": 1,
            "start_time": datetime.now(),
        }
        self.repository.is_spot_available.return_value = False
        
        # Act & Assert
        with pytest.raises(BusinessRuleError) as exc_info:
            await self.service.create_parking_session(session_data)
        assert "Parking spot is not available" in str(exc_info.value)
    
    @async_unit_test
    async def test_end_parking_session_success(self):
        """Test ending a parking session successfully."""
        # Arrange
        session = {
            "id": 1,
            "vehicle_id": 1,
            "spot_id": 1,
            "start_time": datetime.now() - timedelta(hours=2),
            "end_time": None,
            "status": "active",
        }
        self.repository.get_session.return_value = session
        self.repository.end_session.return_value = {**session, "status": "completed"}
        
        # Act
        result = await self.service.end_parking_session(1)
        
        # Assert
        self.repository.get_session.assert_called_once_with(1)
        self.repository.end_session.assert_called_once()
        assert result["status"] == "completed"
    
    @async_unit_test
    async def test_calculate_parking_fee(self):
        """Test calculating parking fee."""
        # Arrange
        session = {
            "id": 1,
            "start_time": datetime.now() - timedelta(hours=2, minutes=30),
            "rate_id": 1,
        }
        self.repository.get_session.return_value = session
        self.repository.get_rate.return_value = {"rate_per_hour": Decimal("5.00")}
        
        # Act
        fee = await self.service.calculate_parking_fee(1)
        
        # Assert
        assert fee["amount"] == Decimal("12.50")  # 2.5 hours * $5
    
    @async_unit_test
    async def test_get_available_spots(self):
        """Test getting available parking spots."""
        # Arrange
        spots = [
            {"id": 1, "spot_number": "A-101", "status": "available"},
            {"id": 2, "spot_number": "A-102", "status": "occupied"},
            {"id": 3, "spot_number": "A-103", "status": "available"},
        ]
        self.repository.get_available_spots.return_value = [spots[0], spots[2]]
        
        # Act
        results = await self.service.get_available_spots()
        
        # Assert
        assert len(results) == 2
        assert all(spot["status"] == "available" for spot in results)
    
    @async_unit_test
    async def test_reserve_spot(self):
        """Test reserving a parking spot."""
        # Arrange
        spot = {"id": 1, "spot_number": "A-101", "status": "available"}
        self.repository.get_spot.return_value = spot
        self.repository.reserve_spot.return_value = {**spot, "status": "reserved"}
        
        # Act
        result = await self.service.reserve_spot(1, user_id=1)
        
        # Assert
        self.repository.reserve_spot.assert_called_once()
        assert result["status"] == "reserved"


# ============================================================================
# Charging Service Tests
# ============================================================================

class TestChargingService(BaseServiceUnitTest):
    """Tests for ChargingService."""
    
    def create_service(self, **kwargs):
        """Create ChargingService instance."""
        return ChargingService(**kwargs)
    
    @async_unit_test
    async def test_start_charging_session_success(self):
        """Test starting a charging session successfully."""
        # Arrange
        session_data = {
            "vehicle_id": 1,
            "station_id": 1,
            "connector_type": "CCS",
            "start_time": datetime.now(),
        }
        self.repository.start_session.return_value = {"id": 1, **session_data}
        
        # Act
        result = await self.service.start_charging_session(session_data)
        
        # Assert
        self.repository.start_session.assert_called_once()
        assert result["id"] == 1
        assert result["vehicle_id"] == 1
    
    @async_unit_test
    async def test_stop_charging_session_success(self):
        """Test stopping a charging session successfully."""
        # Arrange
        session = {
            "id": 1,
            "vehicle_id": 1,
            "station_id": 1,
            "start_time": datetime.now() - timedelta(hours=1),
            "end_time": None,
            "status": "active",
        }
        self.repository.get_session.return_value = session
        self.repository.stop_session.return_value = {
            **session,
            "status": "completed",
            "energy_consumed_kwh": 25.5,
        }
        
        # Act
        result = await self.service.stop_charging_session(1)
        
        # Assert
        self.repository.get_session.assert_called_once_with(1)
        self.repository.stop_session.assert_called_once()
        assert result["status"] == "completed"
        assert result["energy_consumed_kwh"] == 25.5
    
    @async_unit_test
    async def test_calculate_charging_cost(self):
        """Test calculating charging cost."""
        # Arrange
        session = {
            "id": 1,
            "start_time": datetime.now() - timedelta(hours=1),
            "energy_consumed_kwh": 25.5,
        }
        self.repository.get_session.return_value = session
        self.repository.get_rate.return_value = {"rate_per_kwh": Decimal("0.30")}
        
        # Act
        cost = await self.service.calculate_charging_cost(1)
        
        # Assert
        assert cost["amount"] == Decimal("7.65")  # 25.5 * $0.30


# ============================================================================
# Payment Service Tests
# ============================================================================

class TestPaymentService(BaseServiceUnitTest):
    """Tests for PaymentService."""
    
    def create_service(self, **kwargs):
        """Create PaymentService instance."""
        return PaymentService(**kwargs)
    
    @async_unit_test
    async def test_create_payment_success(self):
        """Test creating a payment successfully."""
        # Arrange
        payment_data = {
            "amount": Decimal("100.00"),
            "currency": "USD",
            "session_id": 1,
            "session_type": "parking",
            "payment_method": "credit_card",
        }
        self.repository.create_payment.return_value = {"id": 1, **payment_data}
        
        # Act
        result = await self.service.create_payment(payment_data)
        
        # Assert
        self.repository.create_payment.assert_called_once()
        assert result["id"] == 1
        assert result["amount"] == Decimal("100.00")
    
    @async_unit_test
    async def test_process_payment_success(self):
        """Test processing a payment successfully."""
        # Arrange
        payment = {
            "id": 1,
            "amount": Decimal("100.00"),
            "currency": "USD",
            "status": "pending",
        }
        self.repository.get_payment.return_value = payment
        self.payment_gateway.process_payment.return_value = {"success": True, "transaction_id": "txn_123"}
        self.repository.update_payment.return_value = {**payment, "status": "completed"}
        
        # Act
        result = await self.service.process_payment(1)
        
        # Assert
        self.repository.get_payment.assert_called_once_with(1)
        self.payment_gateway.process_payment.assert_called_once()
        assert result["status"] == "completed"
    
    @async_unit_test
    async def test_process_payment_failure(self):
        """Test processing a payment that fails."""
        # Arrange
        payment = {
            "id": 1,
            "amount": Decimal("100.00"),
            "currency": "USD",
            "status": "pending",
        }
        self.repository.get_payment.return_value = payment
        self.payment_gateway.process_payment.side_effect = Exception("Insufficient funds")
        
        # Act & Assert
        with pytest.raises(Exception) as exc_info:
            await self.service.process_payment(1)
        assert "Insufficient funds" in str(exc_info.value)
    
    @async_unit_test
    async def test_refund_payment_success(self):
        """Test refunding a payment successfully."""
        # Arrange
        payment = {
            "id": 1,
            "amount": Decimal("100.00"),
            "currency": "USD",
            "status": "completed",
            "transaction_id": "txn_123",
        }
        self.repository.get_payment.return_value = payment
        self.payment_gateway.refund_payment.return_value = {"success": True, "refund_id": "ref_123"}
        self.repository.update_payment.return_value = {**payment, "status": "refunded"}
        
        # Act
        result = await self.service.refund_payment(1)
        
        # Assert
        assert result["status"] == "refunded"


# ============================================================================
# Notification Service Tests
# ============================================================================

class TestNotificationService(BaseServiceUnitTest):
    """Tests for NotificationService."""
    
    def create_service(self, **kwargs):
        """Create NotificationService instance."""
        return NotificationService(**kwargs)
    
    @async_unit_test
    async def test_create_notification_success(self):
        """Test creating a notification successfully."""
        # Arrange
        notification_data = {
            "user_id": 1,
            "title": "Test Notification",
            "message": "This is a test notification",
            "type": "info",
        }
        self.repository.create.return_value = {"id": 1, **notification_data}
        
        # Act
        result = await self.service.create_notification(notification_data)
        
        # Assert
        self.repository.create.assert_called_once()
        assert result["id"] == 1
        assert result["user_id"] == 1
    
    @async_unit_test
    async def test_send_notification_email(self):
        """Test sending a notification via email."""
        # Arrange
        notification = {
            "id": 1,
            "user_id": 1,
            "title": "Test",
            "message": "Test message",
            "type": "info",
        }
        user = {"id": 1, "email": "test@example.com"}
        self.repository.get.return_value = notification
        self.user_repository.get_by_id.return_value = user
        self.email_service.send_email.return_value = {"success": True}
        
        # Act
        result = await self.service.send_notification(1, channel="email")
        
        # Assert
        self.email_service.send_email.assert_called_once()
        assert result["success"] is True
    
    @async_unit_test
    async def test_send_notification_push(self):
        """Test sending a notification via push notification."""
        # Arrange
        notification = {
            "id": 1,
            "user_id": 1,
            "title": "Test",
            "message": "Test message",
        }
        self.repository.get.return_value = notification
        self.push_service.send_push.return_value = {"success": True}
        
        # Act
        result = await self.service.send_notification(1, channel="push")
        
        # Assert
        self.push_service.send_push.assert_called_once()
        assert result["success"] is True
    
    @async_unit_test
    async def test_mark_notification_read(self):
        """Test marking a notification as read."""
        # Arrange
        notification = {
            "id": 1,
            "user_id": 1,
            "is_read": False,
        }
        self.repository.get.return_value = notification
        self.repository.update.return_value = {**notification, "is_read": True}
        
        # Act
        result = await self.service.mark_as_read(1)
        
        # Assert
        assert result["is_read"] is True
    
    @async_unit_test
    async def test_get_unread_count(self):
        """Test getting unread notification count."""
        # Arrange
        self.repository.count_unread.return_value = 5
        
        # Act
        count = await self.service.get_unread_count(1)
        
        # Assert
        assert count == 5


# ============================================================================
# User Service Tests
# ============================================================================

class TestUserService(BaseServiceUnitTest):
    """Tests for UserService."""
    
    def create_service(self, **kwargs):
        """Create UserService instance."""
        return UserService(**kwargs)
    
    @async_unit_test
    async def test_create_user_success(self):
        """Test creating a user successfully."""
        # Arrange
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPassword123!",
            "first_name": "Test",
            "last_name": "User",
        }
        self.repository.create.return_value = {"id": 1, **user_data}
        
        # Act
        result = await self.service.create_user(user_data)
        
        # Assert
        self.repository.create.assert_called_once()
        assert result["id"] == 1
        assert result["username"] == "testuser"
    
    @async_unit_test
    async def test_create_user_duplicate_email(self):
        """Test creating a user with duplicate email."""
        # Arrange
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPassword123!",
        }
        self.repository.find_by_email.return_value = {"id": 1, "email": "test@example.com"}
        
        # Act & Assert
        with pytest.raises(ConflictError) as exc_info:
            await self.service.create_user(user_data)
        assert "Email already registered" in str(exc_info.value)
    
    @async_unit_test
    async def test_authenticate_user_success(self):
        """Test authenticating a user successfully."""
        # Arrange
        user = {
            "id": 1,
            "username": "testuser",
            "email": "test@example.com",
            "password_hash": "hashed_password",
        }
        self.repository.find_by_username.return_value = user
        self.auth_service.verify_password.return_value = True
        
        # Act
        result = await self.service.authenticate_user("testuser", "password")
        
        # Assert
        assert result["id"] == 1
        assert result["username"] == "testuser"
    
    @async_unit_test
    async def test_authenticate_user_invalid_password(self):
        """Test authenticating a user with invalid password."""
        # Arrange
        user = {
            "id": 1,
            "username": "testuser",
            "email": "test@example.com",
            "password_hash": "hashed_password",
        }
        self.repository.find_by_username.return_value = user
        self.auth_service.verify_password.return_value = False
        
        # Act & Assert
        with pytest.raises(UnauthorizedError) as exc_info:
            await self.service.authenticate_user("testuser", "wrongpassword")
        assert "Invalid credentials" in str(exc_info.value)
    
    @async_unit_test
    async def test_update_user_success(self):
        """Test updating a user successfully."""
        # Arrange
        user = {"id": 1, "username": "testuser", "first_name": "Test"}
        update_data = {"first_name": "Updated", "last_name": "User"}
        self.repository.get_by_id.return_value = user
        self.repository.update.return_value = {**user, **update_data}
        
        # Act
        result = await self.service.update_user(1, update_data)
        
        # Assert
        assert result["first_name"] == "Updated"
        assert result["last_name"] == "User"


# ============================================================================
# Auth Service Tests
# ============================================================================

class TestAuthService(BaseServiceUnitTest):
    """Tests for AuthService."""
    
    def create_service(self, **kwargs):
        """Create AuthService instance."""
        return AuthService(**kwargs)
    
    @async_unit_test
    async def test_login_success(self):
        """Test login successfully."""
        # Arrange
        user = {
            "id": 1,
            "username": "testuser",
            "email": "test@example.com",
            "password_hash": "hashed_password",
            "is_active": True,
        }
        self.user_repository.find_by_email.return_value = user
        self.auth_service.verify_password.return_value = True
        self.auth_service.generate_tokens.return_value = {
            "access_token": "access_token",
            "refresh_token": "refresh_token",
        }
        
        # Act
        result = await self.service.login("test@example.com", "password")
        
        # Assert
        assert result["access_token"] == "access_token"
        assert result["refresh_token"] == "refresh_token"
    
    @async_unit_test
    async def test_login_inactive_user(self):
        """Test login with inactive user."""
        # Arrange
        user = {
            "id": 1,
            "username": "testuser",
            "email": "test@example.com",
            "password_hash": "hashed_password",
            "is_active": False,
        }
        self.user_repository.find_by_email.return_value = user
        
        # Act & Assert
        with pytest.raises(UnauthorizedError) as exc_info:
            await self.service.login("test@example.com", "password")
        assert "Account is not active" in str(exc_info.value)
    
    @async_unit_test
    async def test_refresh_token_success(self):
        """Test refreshing token successfully."""
        # Arrange
        token_data = {"user_id": 1, "token_type": "refresh"}
        self.auth_service.verify_refresh_token.return_value = token_data
        self.auth_service.generate_access_token.return_value = "new_access_token"
        
        # Act
        result = await self.service.refresh_token("refresh_token")
        
        # Assert
        assert result["access_token"] == "new_access_token"
    
    @async_unit_test
    async def test_validate_token_success(self):
        """Test validating token successfully."""
        # Arrange
        token_data = {"user_id": 1, "username": "testuser"}
        self.auth_service.verify_token.return_value = token_data
        self.user_repository.get_by_id.return_value = {"id": 1, "username": "testuser"}
        
        # Act
        result = await self.service.validate_token("access_token")
        
        # Assert
        assert result["user_id"] == 1
        assert result["username"] == "testuser"


# ============================================================================
# Webhook Service Tests
# ============================================================================

class TestWebhookService(BaseServiceUnitTest):
    """Tests for WebhookService."""
    
    def create_service(self, **kwargs):
        """Create WebhookService instance."""
        return WebhookService(**kwargs)
    
    @async_unit_test
    async def test_process_stripe_webhook_success(self):
        """Test processing Stripe webhook successfully."""
        # Arrange
        payload = {
            "id": "evt_123",
            "type": "payment_intent.succeeded",
            "data": {"object": {"id": "pi_123", "amount": 10000}},
        }
        signature = "test_signature"
        self.webhook_repository.verify_stripe_signature.return_value = True
        self.webhook_repository.process_event.return_value = {"success": True}
        
        # Act
        result = await self.service.process_stripe_webhook(payload, signature)
        
        # Assert
        assert result["success"] is True
    
    @async_unit_test
    async def test_process_stripe_webhook_invalid_signature(self):
        """Test processing Stripe webhook with invalid signature."""
        # Arrange
        payload = {"id": "evt_123"}
        signature = "invalid_signature"
        self.webhook_repository.verify_stripe_signature.return_value = False
        
        # Act & Assert
        with pytest.raises(UnauthorizedError) as exc_info:
            await self.service.process_stripe_webhook(payload, signature)
        assert "Invalid webhook signature" in str(exc_info.value)


# ============================================================================
# Report Service Tests
# ============================================================================

class TestReportService(BaseServiceUnitTest):
    """Tests for ReportService."""
    
    def create_service(self, **kwargs):
        """Create ReportService instance."""
        return ReportService(**kwargs)
    
    @async_unit_test
    async def test_generate_parking_report(self):
        """Test generating parking report."""
        # Arrange
        report_data = {
            "total_sessions": 100,
            "total_revenue": Decimal("1000.00"),
            "average_duration": 120,
            "occupancy_rate": 75.5,
        }
        self.repository.generate_parking_report.return_value = report_data
        
        # Act
        result = await self.service.generate_parking_report(
            start_date=datetime.now() - timedelta(days=30),
            end_date=datetime.now()
        )
        
        # Assert
        assert result["total_sessions"] == 100
        assert result["total_revenue"] == Decimal("1000.00")
    
    @async_unit_test
    async def test_generate_revenue_report(self):
        """Test generating revenue report."""
        # Arrange
        report_data = {
            "total_revenue": Decimal("5000.00"),
            "revenue_by_day": {"2024-01-01": Decimal("500.00")},
            "revenue_by_type": {"parking": Decimal("3000.00"), "charging": Decimal("2000.00")},
        }
        self.repository.generate_revenue_report.return_value = report_data
        
        # Act
        result = await self.service.generate_revenue_report(
            start_date=datetime.now() - timedelta(days=30),
            end_date=datetime.now()
        )
        
        # Assert
        assert result["total_revenue"] == Decimal("5000.00")
        assert "revenue_by_day" in result
        assert "revenue_by_type" in result


# ============================================================================
# Integration-like Service Tests (with real dependencies mocked)
# ============================================================================

class TestServiceIntegration(BaseServiceUnitTest):
    """Integration-like tests for services with multiple dependencies."""
    
    @async_unit_test
    async def test_parking_workflow(self):
        """Test complete parking workflow."""
        # Arrange
        vehicle_data = TestDataFactory.create_vehicle()
        spot_data = TestDataFactory.create_parking_spot()
        session_data = {
            "vehicle_id": 1,
            "spot_id": 1,
            "start_time": datetime.now(),
        }
        
        # Create service
        vehicle_service = VehicleService(
            repository=self.repository,
            cache=self.cache,
            message_bus=self.message_bus
        )
        parking_service = ParkingService(
            parking_repository=self.repository,
            vehicle_repository=self.repository,
            user_repository=self.repository,
            cache=self.cache,
            message_bus=self.message_bus
        )
        
        # Mock repository responses
        self.repository.create.side_effect = [
            vehicle_data,
            {"id": 1, **session_data}
        ]
        self.repository.get_available_spots.return_value = [spot_data]
        self.repository.is_spot_available.return_value = True
        
        # Act - Create vehicle
        vehicle = await vehicle_service.create_vehicle(vehicle_data)
        assert vehicle["id"] == 1
        
        # Act - Get available spots
        spots = await parking_service.get_available_spots()
        assert len(spots) == 1
        
        # Act - Create parking session
        session = await parking_service.create_parking_session(session_data)
        assert session["id"] == 1
        
        # Act - End parking session
        self.repository.get_session.return_value = session
        ended_session = await parking_service.end_parking_session(1)
        assert ended_session["status"] == "completed"
    
    @async_unit_test
    async def test_charging_workflow(self):
        """Test complete charging workflow."""
        # Arrange
        session_data = {
            "vehicle_id": 1,
            "station_id": 1,
            "connector_type": "CCS",
            "start_time": datetime.now(),
        }
        
        charging_service = ChargingService(
            charging_repository=self.repository,
            vehicle_repository=self.repository,
            parking_repository=self.repository,
            cache=self.cache,
            message_bus=self.message_bus
        )
        
        # Mock repository responses
        self.repository.start_session.return_value = {"id": 1, **session_data}
        self.repository.get_session.return_value = {
            "id": 1,
            "start_time": datetime.now() - timedelta(hours=1),
            "energy_consumed_kwh": 25.5,
        }
        self.repository.stop_session.return_value = {
            "id": 1,
            "status": "completed",
            "energy_consumed_kwh": 25.5,
        }
        self.repository.get_rate.return_value = {"rate_per_kwh": Decimal("0.30")}
        
        # Act - Start session
        session = await charging_service.start_charging_session(session_data)
        assert session["id"] == 1
        
        # Act - Calculate cost
        cost = await charging_service.calculate_charging_cost(1)
        assert cost["amount"] == Decimal("7.65")
        
        # Act - Stop session
        stopped = await charging_service.stop_charging_session(1)
        assert stopped["status"] == "completed"
        assert stopped["energy_consumed_kwh"] == 25.5


# ============================================================================
# Error Handling Tests
# ============================================================================

class TestServiceErrorHandling(BaseServiceUnitTest):
    """Tests for service error handling."""
    
    @async_unit_test
    async def test_validation_error_propagation(self):
        """Test validation error propagation."""
        # Arrange
        vehicle_data = {"make": "Tesla"}  # Missing required fields
        self.repository.create.side_effect = ValidationError("Missing required fields")
        
        # Act & Assert
        with pytest.raises(ValidationError) as exc_info:
            await self.service.create_vehicle(vehicle_data)
        assert "Missing required fields" in str(exc_info.value)
    
    @async_unit_test
    async def test_database_error_handling(self):
        """Test database error handling."""
        # Arrange
        self.repository.get_by_id.side_effect = Exception("Database connection failed")
        
        # Act & Assert
        with pytest.raises(Exception) as exc_info:
            await self.service.get_vehicle_by_id(1)
        assert "Database connection failed" in str(exc_info.value)
    
    @async_unit_test
    async def test_cache_error_fallback(self):
        """Test cache error fallback."""
        # Arrange
        vehicle_data = TestDataFactory.create_vehicle()
        self.cache.get.side_effect = Exception("Cache error")
        self.repository.get_by_id.return_value = vehicle_data
        
        # Act
        result = await self.service.get_vehicle_by_id(1)
        
        # Assert
        assert result is not None
        # Should fall back to repository
        self.repository.get_by_id.assert_called_once()