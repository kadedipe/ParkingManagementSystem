# ============================================================================
# End-to-End Flow Tests
# ============================================================================

"""
End-to-end flow tests for complete user journeys.

This module contains E2E tests that verify complete user workflows
from start to finish, simulating real-world user interactions.
"""

import pytest
import asyncio
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, Any, List, Optional

from tests.e2e import (
    BaseWorkflowTest,
    E2ETestHelpers,
    E2EWorkflowHelpers,
    e2e_test,
    workflow_test,
    slow_e2e_test,
)

# Import schemas and models for verification
from src.interfaces.schemas import (
    UserCreateRequest,
    VehicleCreateRequest,
    ParkingSessionCreateRequest,
    ChargingSessionCreateRequest,
    PaymentCreateRequest,
)


# ============================================================================
# User Flow Tests
# ============================================================================

class TestUserFlow(BaseWorkflowTest):
    """E2E tests for user-related flows."""
    
    @e2e_test
    async def test_complete_user_registration_and_login_flow(self):
        """Test complete user registration and login flow."""
        # Arrange
        user_data = {
            "username": "flow_user",
            "email": "flow@example.com",
            "password": "FlowTest123!",
            "first_name": "Flow",
            "last_name": "Tester",
            "phone": "+1234567890"
        }
        
        # Act - Register
        register_response = await self.client.register_user(user_data)
        E2ETestHelpers.assert_response_success(register_response)
        
        # Assert - Registration successful
        assert register_response["data"]["username"] == user_data["username"]
        assert register_response["data"]["email"] == user_data["email"]
        assert "id" in register_response["data"]
        user_id = register_response["data"]["id"]
        
        # Act - Login
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.login_user(login_data)
        E2ETestHelpers.assert_response_success(login_response)
        
        # Assert - Login successful
        assert "access_token" in login_response
        assert "refresh_token" in login_response
        assert login_response["token_type"] == "bearer"
        
        # Act - Get user profile
        headers = {"Authorization": f"Bearer {login_response['access_token']}"}
        profile_response = await self.client.get("/api/v1/users/me", headers=headers)
        E2ETestHelpers.assert_response_success(profile_response)
        
        # Assert - Profile matches
        assert profile_response["data"]["id"] == user_id
        assert profile_response["data"]["username"] == user_data["username"]
        assert profile_response["data"]["email"] == user_data["email"]
        
        # Act - Refresh token
        refresh_response = await self.client.refresh_token(login_response["refresh_token"])
        E2ETestHelpers.assert_response_success(refresh_response)
        
        # Assert - New token issued
        assert "access_token" in refresh_response
        assert refresh_response["access_token"] != login_response["access_token"]
        
        # Act - Logout
        logout_response = await self.client.logout_user(login_response["access_token"])
        E2ETestHelpers.assert_response_success(logout_response)
        
        # Assert - Token invalidated
        response = await self.client.get("/api/v1/users/me", headers=headers)
        assert response["status"] == "error"
    
    @e2e_test
    async def test_user_profile_update_flow(self):
        """Test user profile update flow."""
        # Arrange - Create user and login
        user_data = {
            "username": "profile_user",
            "email": "profile@example.com",
            "password": "ProfileTest123!",
            "first_name": "Profile",
            "last_name": "User"
        }
        
        await self.client.register_user(user_data)
        login_response = await self.client.login_user({
            "email": user_data["email"],
            "password": user_data["password"]
        })
        token = login_response["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Act - Update profile
        update_data = {
            "first_name": "Updated",
            "last_name": "Name",
            "phone": "+1987654321"
        }
        response = await self.client.put("/api/v1/users/me", json=update_data, headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Profile updated
        assert response["data"]["first_name"] == "Updated"
        assert response["data"]["last_name"] == "Name"
        assert response["data"]["phone"] == "+1987654321"
        
        # Act - Change password
        password_data = {
            "current_password": user_data["password"],
            "new_password": "NewPassword456!",
            "confirm_password": "NewPassword456!"
        }
        response = await self.client.post("/api/v1/users/me/change-password", json=password_data, headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Can login with new password
        login_response = await self.client.login_user({
            "email": user_data["email"],
            "password": "NewPassword456!"
        })
        assert login_response["status"] == "success"
    
    @e2e_test
    async def test_user_vehicle_management_flow(self):
        """Test user vehicle management flow."""
        # Arrange - Create user and login
        user_data = {
            "username": "vehicle_user",
            "email": "vehicle@example.com",
            "password": "VehicleTest123!"
        }
        
        await self.client.register_user(user_data)
        login_response = await self.client.login_user({
            "email": user_data["email"],
            "password": user_data["password"]
        })
        token = login_response["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Act - Create vehicle
        vehicle_data = {
            "license_plate": "FLOW123",
            "state": "CA",
            "make": "Tesla",
            "model": "Model 3",
            "year": 2023,
            "color": "white",
            "vehicle_type": "ev",
            "fuel_type": "electric"
        }
        response = await self.client.post("/api/v1/vehicles", json=vehicle_data, headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Vehicle created
        assert response["data"]["license_plate"] == vehicle_data["license_plate"]
        assert response["data"]["make"] == vehicle_data["make"]
        vehicle_id = response["data"]["id"]
        
        # Act - Get vehicles
        response = await self.client.get("/api/v1/vehicles", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        E2ETestHelpers.assert_pagination_response(response["data"])
        
        # Assert - Vehicle in list
        vehicles = response["data"]["items"]
        assert len(vehicles) >= 1
        assert any(v["id"] == vehicle_id for v in vehicles)
        
        # Act - Update vehicle
        update_data = {
            "color": "black",
            "model": "Model Y"
        }
        response = await self.client.put(f"/api/v1/vehicles/{vehicle_id}", json=update_data, headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Vehicle updated
        assert response["data"]["color"] == "black"
        assert response["data"]["model"] == "Model Y"
        
        # Act - Delete vehicle
        response = await self.client.delete(f"/api/v1/vehicles/{vehicle_id}", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Vehicle deleted
        response = await self.client.get(f"/api/v1/vehicles/{vehicle_id}", headers=headers)
        assert response["status"] == "error"


# ============================================================================
# Parking Flow Tests
# ============================================================================

class TestParkingFlow(BaseWorkflowTest):
    """E2E tests for parking-related flows."""
    
    @workflow_test
    async def test_complete_parking_workflow(self):
        """Test complete parking workflow from start to finish."""
        # Arrange - Use workflow helper
        helpers = E2EWorkflowHelpers()
        
        # Act - Complete parking workflow
        result = await helpers.complete_parking_workflow(
            e2e_client=self.client,
            test_user=self.test_data["user"],
            test_vehicle=self.test_data["vehicle"],
            test_parking_spot=self.test_data["parking_spot"]
        )
        
        # Assert - Workflow completed successfully
        assert result["session_id"] is not None
        assert result["payment_id"] is not None
        assert result["session"]["status"] == "completed"
        assert result["payment"]["status"] == "completed"
        
        # Verify database state
        session_data = await self.db.get_table_data("parking_sessions")
        assert len(session_data) > 0
        
        payment_data = await self.db.get_table_data("payments")
        assert len(payment_data) > 0
    
    @e2e_test
    async def test_parking_reservation_flow(self):
        """Test parking reservation and usage flow."""
        # Arrange - Create user and login
        user_data = {
            "username": "reserve_user",
            "email": "reserve@example.com",
            "password": "ReserveTest123!"
        }
        await self.client.register_user(user_data)
        login_response = await self.client.login_user({
            "email": user_data["email"],
            "password": user_data["password"]
        })
        token = login_response["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create vehicle
        vehicle_data = {
            "license_plate": "RES123",
            "state": "CA",
            "make": "Tesla",
            "model": "Model 3",
            "year": 2023,
            "color": "white",
            "vehicle_type": "ev",
            "fuel_type": "electric"
        }
        vehicle_response = await self.client.post("/api/v1/vehicles", json=vehicle_data, headers=headers)
        vehicle_id = vehicle_response["data"]["id"]
        
        # Create parking spot (admin operation)
        spot_data = {
            "spot_number": "RES-101",
            "spot_type": "standard",
            "status": "available"
        }
        spot_response = await self.client.post("/api/v1/parking/spots", json=spot_data, headers=headers)
        spot_id = spot_response["data"]["id"]
        
        # Act - Reserve parking spot
        reserve_data = {
            "vehicle_id": vehicle_id,
            "spot_id": spot_id,
            "start_time": (datetime.now() + timedelta(hours=1)).isoformat(),
            "end_time": (datetime.now() + timedelta(hours=3)).isoformat()
        }
        response = await self.client.post("/api/v1/parking/reservations", json=reserve_data, headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Reservation created
        assert response["data"]["vehicle_id"] == vehicle_id
        assert response["data"]["spot_id"] == spot_id
        assert response["data"]["status"] == "confirmed"
        reservation_id = response["data"]["id"]
        
        # Act - Get reservations
        response = await self.client.get("/api/v1/parking/reservations", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Reservation in list
        reservations = response["data"]["items"]
        assert len(reservations) >= 1
        assert any(r["id"] == reservation_id for r in reservations)
        
        # Act - Cancel reservation
        response = await self.client.post(f"/api/v1/parking/reservations/{reservation_id}/cancel", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Reservation cancelled
        assert response["data"]["status"] == "cancelled"
    
    @e2e_test
    async def test_parking_session_extension_flow(self):
        """Test parking session extension flow."""
        # Arrange - Create user and login
        user_data = {
            "username": "extend_user",
            "email": "extend@example.com",
            "password": "ExtendTest123!"
        }
        await self.client.register_user(user_data)
        login_response = await self.client.login_user({
            "email": user_data["email"],
            "password": user_data["password"]
        })
        token = login_response["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create vehicle
        vehicle_data = {
            "license_plate": "EXT123",
            "state": "CA",
            "make": "Tesla",
            "model": "Model 3",
            "year": 2023,
            "color": "white",
            "vehicle_type": "ev",
            "fuel_type": "electric"
        }
        vehicle_response = await self.client.post("/api/v1/vehicles", json=vehicle_data, headers=headers)
        vehicle_id = vehicle_response["data"]["id"]
        
        # Create parking spot
        spot_data = {
            "spot_number": "EXT-101",
            "spot_type": "standard",
            "status": "available"
        }
        spot_response = await self.client.post("/api/v1/parking/spots", json=spot_data, headers=headers)
        spot_id = spot_response["data"]["id"]
        
        # Create parking session
        session_data = {
            "vehicle_id": vehicle_id,
            "spot_id": spot_id,
            "start_time": datetime.now().isoformat()
        }
        session_response = await self.client.post("/api/v1/parking/sessions", json=session_data, headers=headers)
        session_id = session_response["data"]["id"]
        
        # Act - Extend session
        extend_data = {
            "additional_minutes": 60,
            "reason": "Need more time"
        }
        response = await self.client.post(f"/api/v1/parking/sessions/{session_id}/extend", json=extend_data, headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Session extended
        assert response["data"]["id"] == session_id
        assert "extended" in response["data"]["status"]
        
        # Act - End session
        end_data = {
            "end_time": (datetime.now() + timedelta(hours=2)).isoformat()
        }
        response = await self.client.post(f"/api/v1/parking/sessions/{session_id}/end", json=end_data, headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Session completed
        assert response["data"]["status"] == "completed"


# ============================================================================
# Charging Flow Tests
# ============================================================================

class TestChargingFlow(BaseWorkflowTest):
    """E2E tests for charging-related flows."""
    
    @workflow_test
    async def test_complete_charging_workflow(self):
        """Test complete charging workflow from start to finish."""
        # Arrange - Use workflow helper
        helpers = E2EWorkflowHelpers()
        
        # Act - Complete charging workflow
        result = await helpers.complete_charging_workflow(
            e2e_client=self.client,
            test_user=self.test_data["user"],
            test_vehicle=self.test_data["vehicle"],
            test_charging_station=self.test_data["charging_station"]
        )
        
        # Assert - Workflow completed successfully
        assert result["session_id"] is not None
        assert result["payment_id"] is not None
        assert result["session"]["status"] == "completed"
        assert result["cost"]["amount"] > 0
        
        # Verify database state
        session_data = await self.db.get_table_data("charging_sessions")
        assert len(session_data) > 0
        
        payment_data = await self.db.get_table_data("payments")
        assert len(payment_data) > 0
    
    @e2e_test
    async def test_charging_station_management_flow(self):
        """Test charging station management flow."""
        # Arrange - Create admin user and login
        admin_data = {
            "username": "charging_admin",
            "email": "charging_admin@example.com",
            "password": "ChargingAdmin123!",
            "role": "admin"
        }
        await self.client.register_user(admin_data)
        login_response = await self.client.login_user({
            "email": admin_data["email"],
            "password": admin_data["password"]
        })
        token = login_response["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Act - Create charging station
        station_data = {
            "station_name": "E2E Station",
            "location_id": 1,
            "connector_type": "CCS",
            "power_rating_kw": 150,
            "status": "available",
            "charging_rate": 0.35
        }
        response = await self.client.post("/api/v1/charging/stations", json=station_data, headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Station created
        assert response["data"]["station_name"] == station_data["station_name"]
        assert response["data"]["power_rating_kw"] == station_data["power_rating_kw"]
        station_id = response["data"]["id"]
        
        # Act - Update station
        update_data = {
            "status": "maintenance",
            "charging_rate": 0.40
        }
        response = await self.client.put(f"/api/v1/charging/stations/{station_id}", json=update_data, headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Station updated
        assert response["data"]["status"] == "maintenance"
        assert response["data"]["charging_rate"] == 0.40
        
        # Act - Get stations
        response = await self.client.get("/api/v1/charging/stations", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        E2ETestHelpers.assert_pagination_response(response["data"])
        
        # Assert - Station in list
        stations = response["data"]["items"]
        assert len(stations) >= 1
        assert any(s["id"] == station_id for s in stations)
        
        # Act - Delete station
        response = await self.client.delete(f"/api/v1/charging/stations/{station_id}", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Station deleted
        response = await self.client.get(f"/api/v1/charging/stations/{station_id}", headers=headers)
        assert response["status"] == "error"
    
    @e2e_test
    async def test_charging_session_history_flow(self):
        """Test charging session history flow."""
        # Arrange - Create user and login
        user_data = {
            "username": "history_user",
            "email": "history@example.com",
            "password": "HistoryTest123!"
        }
        await self.client.register_user(user_data)
        login_response = await self.client.login_user({
            "email": user_data["email"],
            "password": user_data["password"]
        })
        token = login_response["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create vehicle
        vehicle_data = {
            "license_plate": "HIS123",
            "state": "CA",
            "make": "Tesla",
            "model": "Model 3",
            "year": 2023,
            "color": "white",
            "vehicle_type": "ev",
            "fuel_type": "electric"
        }
        vehicle_response = await self.client.post("/api/v1/vehicles", json=vehicle_data, headers=headers)
        vehicle_id = vehicle_response["data"]["id"]
        
        # Create charging station
        station_data = {
            "station_name": "History Station",
            "location_id": 1,
            "connector_type": "CCS",
            "power_rating_kw": 50,
            "status": "available",
            "charging_rate": 0.30
        }
        station_response = await self.client.post("/api/v1/charging/stations", json=station_data, headers=headers)
        station_id = station_response["data"]["id"]
        
        # Create multiple charging sessions
        for i in range(3):
            session_data = {
                "vehicle_id": vehicle_id,
                "station_id": station_id,
                "connector_type": "CCS",
                "start_time": (datetime.now() - timedelta(hours=i*2)).isoformat()
            }
            session_response = await self.client.post("/api/v1/charging/sessions/start", json=session_data, headers=headers)
            session_id = session_response["data"]["id"]
            
            # Stop session
            stop_data = {
                "energy_consumed_kwh": 10 + (i * 5)
            }
            await self.client.post(f"/api/v1/charging/sessions/{session_id}/stop", json=stop_data, headers=headers)
        
        # Act - Get charging history
        response = await self.client.get(f"/api/v1/vehicles/{vehicle_id}/charging-history", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        E2ETestHelpers.assert_pagination_response(response["data"])
        
        # Assert - History contains sessions
        history = response["data"]["items"]
        assert len(history) >= 3
        assert all(s["vehicle_id"] == vehicle_id for s in history)
        assert all(s["status"] == "completed" for s in history)


# ============================================================================
# Payment Flow Tests
# ============================================================================

class TestPaymentFlow(BaseWorkflowTest):
    """E2E tests for payment-related flows."""
    
    @e2e_test
    async def test_payment_method_management_flow(self):
        """Test payment method management flow."""
        # Arrange - Create user and login
        user_data = {
            "username": "payment_user",
            "email": "payment@example.com",
            "password": "PaymentTest123!"
        }
        await self.client.register_user(user_data)
        login_response = await self.client.login_user({
            "email": user_data["email"],
            "password": user_data["password"]
        })
        token = login_response["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Act - Add payment method
        payment_method_data = {
            "type": "credit_card",
            "card_number": "4111111111111111",
            "expiry_month": 12,
            "expiry_year": 2025,
            "cvv": "123",
            "name_on_card": "Test User",
            "is_default": True
        }
        response = await self.client.post("/api/v1/payments/methods", json=payment_method_data, headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Payment method added
        assert response["data"]["type"] == "credit_card"
        assert response["data"]["is_default"] is True
        assert "last_four" in response["data"]
        method_id = response["data"]["id"]
        
        # Act - Get payment methods
        response = await self.client.get("/api/v1/payments/methods", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Method in list
        methods = response["data"]["items"]
        assert len(methods) >= 1
        assert any(m["id"] == method_id for m in methods)
        
        # Act - Set default method
        response = await self.client.post(f"/api/v1/payments/methods/{method_id}/set-default", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Default set
        assert response["data"]["is_default"] is True
        
        # Act - Delete payment method
        response = await self.client.delete(f"/api/v1/payments/methods/{method_id}", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Method deleted
        response = await self.client.get("/api/v1/payments/methods", headers=headers)
        methods = response["data"]["items"]
        assert not any(m["id"] == method_id for m in methods)
    
    @e2e_test
    async def test_payment_history_flow(self):
        """Test payment history flow."""
        # Arrange - Create user and login
        user_data = {
            "username": "history_payment",
            "email": "history_payment@example.com",
            "password": "HistoryPay123!"
        }
        await self.client.register_user(user_data)
        login_response = await self.client.login_user({
            "email": user_data["email"],
            "password": user_data["password"]
        })
        token = login_response["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create vehicle and parking session for payment
        vehicle_data = {
            "license_plate": "PAY123",
            "state": "CA",
            "make": "Tesla",
            "model": "Model 3",
            "year": 2023,
            "color": "white",
            "vehicle_type": "ev",
            "fuel_type": "electric"
        }
        vehicle_response = await self.client.post("/api/v1/vehicles", json=vehicle_data, headers=headers)
        vehicle_id = vehicle_response["data"]["id"]
        
        spot_data = {
            "spot_number": "PAY-101",
            "spot_type": "standard",
            "status": "available"
        }
        spot_response = await self.client.post("/api/v1/parking/spots", json=spot_data, headers=headers)
        spot_id = spot_response["data"]["id"]
        
        # Create multiple payments
        payment_ids = []
        for i in range(3):
            # Create session
            session_data = {
                "vehicle_id": vehicle_id,
                "spot_id": spot_id,
                "start_time": (datetime.now() - timedelta(hours=i*3)).isoformat()
            }
            session_response = await self.client.post("/api/v1/parking/sessions", json=session_data, headers=headers)
            session_id = session_response["data"]["id"]
            
            # End session
            await self.client.post(
                f"/api/v1/parking/sessions/{session_id}/end",
                json={"end_time": (datetime.now() - timedelta(hours=i*3-2)).isoformat()},
                headers=headers
            )
            
            # Create payment
            payment_data = {
                "amount": 5.00 + (i * 5),
                "currency": "USD",
                "session_id": session_id,
                "session_type": "parking",
                "payment_method": "credit_card"
            }
            payment_response = await self.client.post("/api/v1/payments", json=payment_data, headers=headers)
            payment_id = payment_response["data"]["id"]
            payment_ids.append(payment_id)
            
            # Process payment
            await self.client.post(f"/api/v1/payments/{payment_id}/process", headers=headers)
        
        # Act - Get payment history
        response = await self.client.get("/api/v1/payments/history", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        E2ETestHelpers.assert_pagination_response(response["data"])
        
        # Assert - History contains payments
        history = response["data"]["items"]
        assert len(history) >= 3
        assert all(p["status"] == "completed" for p in history)
        
        # Act - Get payment summary
        response = await self.client.get("/api/v1/payments/summary", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Summary valid
        assert "total_amount" in response["data"]
        assert "total_payments" in response["data"]
        assert response["data"]["total_payments"] >= 3


# ============================================================================
# Notification Flow Tests
# ============================================================================

class TestNotificationFlow(BaseWorkflowTest):
    """E2E tests for notification-related flows."""
    
    @e2e_test
    async def test_notification_lifecycle_flow(self):
        """Test complete notification lifecycle flow."""
        # Arrange - Create user and login
        user_data = {
            "username": "notify_user",
            "email": "notify@example.com",
            "password": "NotifyTest123!"
        }
        await self.client.register_user(user_data)
        login_response = await self.client.login_user({
            "email": user_data["email"],
            "password": user_data["password"]
        })
        token = login_response["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Act - Create notification
        notification_data = {
            "title": "Test Notification",
            "message": "This is a test notification",
            "type": "info",
            "priority": "normal"
        }
        response = await self.client.post("/api/v1/notifications", json=notification_data, headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Notification created
        assert response["data"]["title"] == notification_data["title"]
        assert response["data"]["message"] == notification_data["message"]
        assert response["data"]["is_read"] is False
        notification_id = response["data"]["id"]
        
        # Act - Get notifications
        response = await self.client.get("/api/v1/notifications", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        E2ETestHelpers.assert_pagination_response(response["data"])
        
        # Assert - Notification in list
        notifications = response["data"]["items"]
        assert len(notifications) >= 1
        assert any(n["id"] == notification_id for n in notifications)
        
        # Act - Mark as read
        response = await self.client.post(f"/api/v1/notifications/{notification_id}/mark-read", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Notification read
        response = await self.client.get(f"/api/v1/notifications/{notification_id}", headers=headers)
        assert response["data"]["is_read"] is True
        
        # Act - Mark as unread
        response = await self.client.post(f"/api/v1/notifications/{notification_id}/mark-unread", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Notification unread
        response = await self.client.get(f"/api/v1/notifications/{notification_id}", headers=headers)
        assert response["data"]["is_read"] is False
        
        # Act - Delete notification
        response = await self.client.delete(f"/api/v1/notifications/{notification_id}", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Notification deleted
        response = await self.client.get(f"/api/v1/notifications/{notification_id}", headers=headers)
        assert response["status"] == "error"
    
    @e2e_test
    async def test_notification_preferences_flow(self):
        """Test notification preferences flow."""
        # Arrange - Create user and login
        user_data = {
            "username": "pref_user",
            "email": "pref@example.com",
            "password": "PrefTest123!"
        }
        await self.client.register_user(user_data)
        login_response = await self.client.login_user({
            "email": user_data["email"],
            "password": user_data["password"]
        })
        token = login_response["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Act - Update preferences
        preferences_data = {
            "email_enabled": True,
            "sms_enabled": False,
            "push_enabled": True,
            "parking_alerts": True,
            "charging_alerts": True,
            "payment_alerts": True,
            "promotional_alerts": False
        }
        response = await self.client.post("/api/v1/notifications/preferences", json=preferences_data, headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Preferences updated
        assert response["data"]["email_enabled"] is True
        assert response["data"]["sms_enabled"] is False
        assert response["data"]["push_enabled"] is True
        
        # Act - Get preferences
        response = await self.client.get("/api/v1/notifications/preferences", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Preferences match
        assert response["data"]["email_enabled"] == preferences_data["email_enabled"]
        assert response["data"]["sms_enabled"] == preferences_data["sms_enabled"]
        
        # Act - Update specific preference
        response = await self.client.patch(
            "/api/v1/notifications/preferences",
            json={"email_enabled": False},
            headers=headers
        )
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Preference updated
        assert response["data"]["email_enabled"] is False


# ============================================================================
# Admin Flow Tests
# ============================================================================

class TestAdminFlow(BaseWorkflowTest):
    """E2E tests for admin-related flows."""
    
    @e2e_test
    async def test_admin_user_management_flow(self):
        """Test admin user management flow."""
        # Arrange - Create admin user and login
        admin_data = {
            "username": "admin_flow",
            "email": "admin_flow@example.com",
            "password": "AdminFlow123!",
            "role": "admin"
        }
        await self.client.register_user(admin_data)
        login_response = await self.client.login_user({
            "email": admin_data["email"],
            "password": admin_data["password"]
        })
        token = login_response["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Act - Get all users
        response = await self.client.get("/api/v1/admin/users", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        E2ETestHelpers.assert_pagination_response(response["data"])
        
        # Assert - Users list
        users = response["data"]["items"]
        assert len(users) >= 1
        
        # Act - Create new user (admin)
        new_user_data = {
            "username": "admin_created",
            "email": "admin_created@example.com",
            "password": "AdminCreated123!",
            "first_name": "Admin",
            "last_name": "Created"
        }
        response = await self.client.post("/api/v1/admin/users", json=new_user_data, headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - User created
        assert response["data"]["username"] == new_user_data["username"]
        new_user_id = response["data"]["id"]
        
        # Act - Update user role
        response = await self.client.patch(
            f"/api/v1/admin/users/{new_user_id}/role",
            json={"role": "manager"},
            headers=headers
        )
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Role updated
        assert response["data"]["role"] == "manager"
        
        # Act - Activate/deactivate user
        response = await self.client.post(
            f"/api/v1/admin/users/{new_user_id}/deactivate",
            headers=headers
        )
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - User deactivated
        assert response["data"]["status"] == "inactive"
        
        response = await self.client.post(
            f"/api/v1/admin/users/{new_user_id}/activate",
            headers=headers
        )
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - User reactivated
        assert response["data"]["status"] == "active"
    
    @e2e_test
    async def test_admin_system_management_flow(self):
        """Test admin system management flow."""
        # Arrange - Create admin user and login
        admin_data = {
            "username": "sys_admin",
            "email": "sys_admin@example.com",
            "password": "SysAdmin123!",
            "role": "admin"
        }
        await self.client.register_user(admin_data)
        login_response = await self.client.login_user({
            "email": admin_data["email"],
            "password": admin_data["password"]
        })
        token = login_response["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Act - Get system metrics
        response = await self.client.get("/api/v1/admin/metrics", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Metrics returned
        assert "total_users" in response["data"]
        assert "total_parking_sessions" in response["data"]
        assert "total_revenue" in response["data"]
        
        # Act - Get audit logs
        response = await self.client.get("/api/v1/admin/audit-logs", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        E2ETestHelpers.assert_pagination_response(response["data"])
        
        # Assert - Audit logs exist
        logs = response["data"]["items"]
        assert len(logs) >= 1
        
        # Act - Get system health
        response = await self.client.get("/api/v1/admin/health", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Health status
        assert "database" in response["data"]
        assert "redis" in response["data"]
        assert "status" in response["data"]
        assert response["data"]["status"] == "healthy"
        
        # Act - Clear cache
        response = await self.client.post("/api/v1/admin/cache/clear", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Cache cleared
        assert response["data"]["success"] is True


# ============================================================================
# Report Flow Tests
# ============================================================================

class TestReportFlow(BaseWorkflowTest):
    """E2E tests for report-related flows."""
    
    @e2e_test
    async def test_report_generation_flow(self):
        """Test report generation and export flow."""
        # Arrange - Create admin user and login
        admin_data = {
            "username": "report_admin",
            "email": "report@example.com",
            "password": "ReportAdmin123!",
            "role": "admin"
        }
        await self.client.register_user(admin_data)
        login_response = await self.client.login_user({
            "email": admin_data["email"],
            "password": admin_data["password"]
        })
        token = login_response["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Act - Generate parking report
        report_data = {
            "report_type": "parking",
            "date_range": {
                "start_date": (datetime.now() - timedelta(days=30)).isoformat(),
                "end_date": datetime.now().isoformat()
            },
            "format": "json",
            "include_details": True
        }
        response = await self.client.post("/api/v1/reports/generate", json=report_data, headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Report generated
        assert "report_id" in response["data"]
        assert "status" in response["data"]
        assert response["data"]["status"] == "processing"
        report_id = response["data"]["report_id"]
        
        # Act - Check report status
        await asyncio.sleep(2)  # Wait for report generation
        response = await self.client.get(f"/api/v1/reports/{report_id}/status", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Report completed
        assert response["data"]["status"] == "completed"
        assert "download_url" in response["data"]
        
        # Act - Get report list
        response = await self.client.get("/api/v1/reports", headers=headers)
        E2ETestHelpers.assert_response_success(response)
        E2ETestHelpers.assert_pagination_response(response["data"])
        
        # Assert - Report in list
        reports = response["data"]["items"]
        assert len(reports) >= 1
        assert any(r["id"] == report_id for r in reports)
        
        # Act - Export report
        export_data = {
            "report_id": report_id,
            "format": "pdf",
            "include_charts": True
        }
        response = await self.client.post("/api/v1/reports/export", json=export_data, headers=headers)
        E2ETestHelpers.assert_response_success(response)
        
        # Assert - Export started
        assert "export_id" in response["data"]
        assert "status" in response["data"]


# ============================================================================
# Comprehensive Integration Tests
# ============================================================================

class TestComprehensiveFlows(BaseWorkflowTest):
    """Comprehensive E2E tests covering multiple flows."""
    
    @slow_e2e_test
    async def test_comprehensive_user_journey(self):
        """Test complete user journey across multiple flows."""
        # Create user journey timeline
        journey = {
            "user": None,
            "vehicle": None,
            "parking_sessions": [],
            "charging_sessions": [],
            "payments": [],
            "notifications": []
        }
        
        try:
            # Step 1: Register and login
            user_data = {
                "username": "journey_user",
                "email": "journey@example.com",
                "password": "JourneyTest123!",
                "first_name": "Journey",
                "last_name": "Tester"
            }
            register_response = await self.client.register_user(user_data)
            E2ETestHelpers.assert_response_success(register_response)
            journey["user"] = register_response["data"]
            
            login_response = await self.client.login_user({
                "email": user_data["email"],
                "password": user_data["password"]
            })
            token = login_response["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            
            # Step 2: Create vehicle
            vehicle_data = {
                "license_plate": "JRN123",
                "state": "CA",
                "make": "Tesla",
                "model": "Model 3",
                "year": 2023,
                "color": "white",
                "vehicle_type": "ev",
                "fuel_type": "electric"
            }
            vehicle_response = await self.client.post("/api/v1/vehicles", json=vehicle_data, headers=headers)
            E2ETestHelpers.assert_response_success(vehicle_response)
            journey["vehicle"] = vehicle_response["data"]
            
            # Step 3: Create parking spot and station
            spot_data = {
                "spot_number": "JRN-101",
                "spot_type": "standard",
                "status": "available"
            }
            spot_response = await self.client.post("/api/v1/parking/spots", json=spot_data, headers=headers)
            spot_id = spot_response["data"]["id"]
            
            station_data = {
                "station_name": "Journey Station",
                "location_id": 1,
                "connector_type": "CCS",
                "power_rating_kw": 50,
                "status": "available",
                "charging_rate": 0.30
            }
            station_response = await self.client.post("/api/v1/charging/stations", json=station_data, headers=headers)
            station_id = station_response["data"]["id"]
            
            # Step 4: Create parking session
            session_data = {
                "vehicle_id": journey["vehicle"]["id"],
                "spot_id": spot_id,
                "start_time": datetime.now().isoformat()
            }
            session_response = await self.client.post("/api/v1/parking/sessions", json=session_data, headers=headers)
            journey["parking_sessions"].append(session_response["data"])
            
            # Step 5: End parking session
            end_data = {
                "end_time": (datetime.now() + timedelta(hours=2)).isoformat()
            }
            end_response = await self.client.post(
                f"/api/v1/parking/sessions/{session_response['data']['id']}/end",
                json=end_data,
                headers=headers
            )
            E2ETestHelpers.assert_response_success(end_response)
            
            # Step 6: Create payment
            payment_data = {
                "amount": 10.00,
                "currency": "USD",
                "session_id": session_response["data"]["id"],
                "session_type": "parking",
                "payment_method": "credit_card"
            }
            payment_response = await self.client.post("/api/v1/payments", json=payment_data, headers=headers)
            E2ETestHelpers.assert_response_success(payment_response)
            journey["payments"].append(payment_response["data"])
            
            # Step 7: Process payment
            process_response = await self.client.post(
                f"/api/v1/payments/{payment_response['data']['id']}/process",
                headers=headers
            )
            E2ETestHelpers.assert_response_success(process_response)
            
            # Step 8: Create notification
            notification_data = {
                "title": "Journey Complete",
                "message": "Your parking journey is complete",
                "type": "success"
            }
            notification_response = await self.client.post("/api/v1/notifications", json=notification_data, headers=headers)
            E2ETestHelpers.assert_response_success(notification_response)
            journey["notifications"].append(notification_response["data"])
            
            # Step 9: Verify all data
            # Check parking sessions
            response = await self.client.get("/api/v1/parking/sessions", headers=headers)
            assert response["status"] == "success"
            assert len(response["data"]["items"]) >= 1
            
            # Check payments
            response = await self.client.get("/api/v1/payments/history", headers=headers)
            assert response["status"] == "success"
            assert len(response["data"]["items"]) >= 1
            
            # Check notifications
            response = await self.client.get("/api/v1/notifications", headers=headers)
            assert response["status"] == "success"
            assert len(response["data"]["items"]) >= 1
            
            # Step 10: Cleanup - logout
            logout_response = await self.client.logout_user(token)
            E2ETestHelpers.assert_response_success(logout_response)
            
        except Exception as e:
            # Log error and cleanup
            print(f"Journey test failed: {e}")
            raise