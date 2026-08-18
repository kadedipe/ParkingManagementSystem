# ============================================================================
# API Integration Tests
# ============================================================================

"""
Integration tests for API endpoints.

This module contains integration tests for all API endpoints including
authentication, vehicles, parking, charging, payments, and notifications.
"""

import pytest
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, Any, List
from httpx import AsyncClient

from tests.integration import (
    BaseAPIIntegrationTest,
    IntegrationTestData,
    ExternalServiceMocks,
    api_test,
)

# Import schemas
from src.interfaces.schemas import (
    LoginRequest,
    RegisterRequest,
    VehicleCreateRequest,
    ParkingSessionCreateRequest,
    ChargingSessionCreateRequest,
    PaymentCreateRequest,
    NotificationCreateRequest,
)


# ============================================================================
# Authentication API Tests
# ============================================================================

class TestAuthAPI(BaseAPIIntegrationTest):
    """Integration tests for authentication API endpoints."""
    
    @api_test
    async def test_register_user_success(self):
        """Test user registration successfully."""
        # Arrange
        user_data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "TestPassword123!",
            "first_name": "New",
            "last_name": "User",
            "phone": "+1234567890"
        }
        
        # Act
        response = await self.client.post("/api/v1/auth/register", json=user_data)
        
        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == user_data["username"]
        assert data["email"] == user_data["email"]
        assert "id" in data
        assert "password" not in data
        
        # Verify user was created in database
        from src.infrastructure.repositories.user_repository import UserRepository
        repo = UserRepository(self.db_session)
        user = await repo.find_by_email(user_data["email"])
        assert user is not None
        assert user.username == user_data["username"]
    
    @api_test
    async def test_register_user_duplicate_email(self):
        """Test user registration with duplicate email."""
        # Arrange
        user_data = IntegrationTestData.USER
        
        # Act - First registration
        response1 = await self.client.post("/api/v1/auth/register", json=user_data)
        assert response1.status_code == 201
        
        # Act - Second registration with same email
        response2 = await self.client.post("/api/v1/auth/register", json=user_data)
        
        # Assert
        assert response2.status_code == 400
        data = response2.json()
        assert "Email already registered" in str(data)
    
    @api_test
    async def test_register_user_invalid_data(self):
        """Test user registration with invalid data."""
        # Arrange
        invalid_data = {
            "username": "newuser",
            "email": "invalid-email",  # Invalid email
            "password": "123",  # Too short
        }
        
        # Act
        response = await self.client.post("/api/v1/auth/register", json=invalid_data)
        
        # Assert
        assert response.status_code == 422
        data = response.json()
        assert "validation_error" in str(data) or "detail" in data
    
    @api_test
    async def test_login_success(self):
        """Test login successfully."""
        # Arrange - Create user
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        # Act
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        response = await self.client.post("/api/v1/auth/login", json=login_data)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
    
    @api_test
    async def test_login_invalid_credentials(self):
        """Test login with invalid credentials."""
        # Arrange - Create user
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        # Act
        login_data = {
            "email": user_data["email"],
            "password": "WrongPassword123!"
        }
        response = await self.client.post("/api/v1/auth/login", json=login_data)
        
        # Assert
        assert response.status_code == 401
        data = response.json()
        assert "Invalid credentials" in str(data)
    
    @api_test
    async def test_refresh_token_success(self):
        """Test refreshing access token successfully."""
        # Arrange - Create user and login
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.post("/api/v1/auth/login", json=login_data)
        refresh_token = login_response.json()["refresh_token"]
        
        # Act
        response = await self.client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token}
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["access_token"] != login_response.json()["access_token"]
    
    @api_test
    async def test_refresh_token_invalid(self):
        """Test refreshing with invalid token."""
        # Act
        response = await self.client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "invalid_token"}
        )
        
        # Assert
        assert response.status_code == 401
        data = response.json()
        assert "Invalid token" in str(data)
    
    @api_test
    async def test_logout_success(self):
        """Test logout successfully."""
        # Arrange - Login
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Act
        response = await self.client.post("/api/v1/auth/logout", headers=headers)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        
        # Verify token is invalidated
        response = await self.client.get("/api/v1/users/me", headers=headers)
        assert response.status_code == 401


# ============================================================================
# Vehicle API Tests
# ============================================================================

class TestVehicleAPI(BaseAPIIntegrationTest):
    """Integration tests for vehicle API endpoints."""
    
    @api_test
    async def test_create_vehicle_success(self):
        """Test creating a vehicle successfully."""
        # Arrange - Create user and login
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Act
        vehicle_data = IntegrationTestData.VEHICLE
        response = await self.client.post(
            "/api/v1/vehicles",
            json=vehicle_data,
            headers=headers
        )
        
        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["license_plate"] == vehicle_data["license_plate"]
        assert data["make"] == vehicle_data["make"]
        assert data["model"] == vehicle_data["model"]
        assert "id" in data
    
    @api_test
    async def test_create_vehicle_duplicate(self):
        """Test creating a vehicle with duplicate license plate."""
        # Arrange - Create user and login
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create first vehicle
        vehicle_data = IntegrationTestData.VEHICLE
        response1 = await self.client.post("/api/v1/vehicles", json=vehicle_data, headers=headers)
        assert response1.status_code == 201
        
        # Act - Create duplicate
        response2 = await self.client.post("/api/v1/vehicles", json=vehicle_data, headers=headers)
        
        # Assert
        assert response2.status_code == 409
        data = response2.json()
        assert "License plate already exists" in str(data)
    
    @api_test
    async def test_get_vehicles(self):
        """Test getting list of vehicles."""
        # Arrange - Create user and login
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create multiple vehicles
        for i in range(3):
            vehicle_data = IntegrationTestData.VEHICLE.copy()
            vehicle_data["license_plate"] = f"TEST{i}23"
            await self.client.post("/api/v1/vehicles", json=vehicle_data, headers=headers)
        
        # Act
        response = await self.client.get("/api/v1/vehicles", headers=headers)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert len(data["items"]) >= 3
        assert data["total"] >= 3
    
    @api_test
    async def test_get_vehicle_by_id(self):
        """Test getting a vehicle by ID."""
        # Arrange - Create user and login
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create vehicle
        vehicle_data = IntegrationTestData.VEHICLE
        create_response = await self.client.post(
            "/api/v1/vehicles",
            json=vehicle_data,
            headers=headers
        )
        vehicle_id = create_response.json()["id"]
        
        # Act
        response = await self.client.get(f"/api/v1/vehicles/{vehicle_id}", headers=headers)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == vehicle_id
        assert data["license_plate"] == vehicle_data["license_plate"]
        assert data["make"] == vehicle_data["make"]
    
    @api_test
    async def test_update_vehicle(self):
        """Test updating a vehicle."""
        # Arrange - Create user and login
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create vehicle
        vehicle_data = IntegrationTestData.VEHICLE
        create_response = await self.client.post(
            "/api/v1/vehicles",
            json=vehicle_data,
            headers=headers
        )
        vehicle_id = create_response.json()["id"]
        
        # Act
        update_data = {
            "make": "Updated Make",
            "model": "Updated Model",
            "color": "black"
        }
        response = await self.client.put(
            f"/api/v1/vehicles/{vehicle_id}",
            json=update_data,
            headers=headers
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == vehicle_id
        assert data["make"] == "Updated Make"
        assert data["model"] == "Updated Model"
        assert data["color"] == "black"
    
    @api_test
    async def test_delete_vehicle(self):
        """Test deleting a vehicle."""
        # Arrange - Create user and login
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create vehicle
        vehicle_data = IntegrationTestData.VEHICLE
        create_response = await self.client.post(
            "/api/v1/vehicles",
            json=vehicle_data,
            headers=headers
        )
        vehicle_id = create_response.json()["id"]
        
        # Act
        response = await self.client.delete(f"/api/v1/vehicles/{vehicle_id}", headers=headers)
        
        # Assert
        assert response.status_code == 204
        
        # Verify vehicle is deleted
        response = await self.client.get(f"/api/v1/vehicles/{vehicle_id}", headers=headers)
        assert response.status_code == 404


# ============================================================================
# Parking API Tests
# ============================================================================

class TestParkingAPI(BaseAPIIntegrationTest):
    """Integration tests for parking API endpoints."""
    
    @api_test
    async def test_create_parking_session(self):
        """Test creating a parking session."""
        # Arrange - Setup user, vehicle, and spot
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create vehicle
        vehicle_data = IntegrationTestData.VEHICLE
        vehicle_response = await self.client.post(
            "/api/v1/vehicles",
            json=vehicle_data,
            headers=headers
        )
        vehicle_id = vehicle_response.json()["id"]
        
        # Create parking spot (use existing or create)
        spot_data = IntegrationTestData.PARKING_SPOT
        spot_response = await self.client.post(
            "/api/v1/parking/spots",
            json=spot_data,
            headers=headers
        )
        spot_id = spot_response.json()["id"]
        
        # Act
        session_data = {
            "vehicle_id": vehicle_id,
            "spot_id": spot_id,
            "start_time": datetime.now().isoformat()
        }
        response = await self.client.post(
            "/api/v1/parking/sessions",
            json=session_data,
            headers=headers
        )
        
        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["vehicle_id"] == vehicle_id
        assert data["spot_id"] == spot_id
        assert data["status"] == "active"
        assert "id" in data
    
    @api_test
    async def test_end_parking_session(self):
        """Test ending a parking session."""
        # Arrange - Setup session
        # Create user and login
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create vehicle
        vehicle_data = IntegrationTestData.VEHICLE
        vehicle_response = await self.client.post(
            "/api/v1/vehicles",
            json=vehicle_data,
            headers=headers
        )
        vehicle_id = vehicle_response.json()["id"]
        
        # Create parking spot
        spot_data = IntegrationTestData.PARKING_SPOT
        spot_response = await self.client.post(
            "/api/v1/parking/spots",
            json=spot_data,
            headers=headers
        )
        spot_id = spot_response.json()["id"]
        
        # Create session
        session_data = {
            "vehicle_id": vehicle_id,
            "spot_id": spot_id,
            "start_time": datetime.now().isoformat()
        }
        session_response = await self.client.post(
            "/api/v1/parking/sessions",
            json=session_data,
            headers=headers
        )
        session_id = session_response.json()["id"]
        
        # Act
        end_data = {
            "end_time": datetime.now().isoformat()
        }
        response = await self.client.post(
            f"/api/v1/parking/sessions/{session_id}/end",
            json=end_data,
            headers=headers
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == session_id
        assert data["status"] == "completed"
        assert "duration_minutes" in data
    
    @api_test
    async def test_get_available_spots(self):
        """Test getting available parking spots."""
        # Arrange - Create user and login
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create multiple spots
        for i in range(3):
            spot_data = IntegrationTestData.PARKING_SPOT.copy()
            spot_data["spot_number"] = f"A-10{i+1}"
            await self.client.post("/api/v1/parking/spots", json=spot_data, headers=headers)
        
        # Act
        response = await self.client.get("/api/v1/parking/spots/available", headers=headers)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert len(data["items"]) >= 3
        assert all(spot["status"] == "available" for spot in data["items"])
    
    @api_test
    async def test_get_parking_history(self):
        """Test getting parking history."""
        # Arrange - Create user, vehicle, and sessions
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create vehicle
        vehicle_data = IntegrationTestData.VEHICLE
        vehicle_response = await self.client.post(
            "/api/v1/vehicles",
            json=vehicle_data,
            headers=headers
        )
        vehicle_id = vehicle_response.json()["id"]
        
        # Create spot
        spot_data = IntegrationTestData.PARKING_SPOT
        spot_response = await self.client.post(
            "/api/v1/parking/spots",
            json=spot_data,
            headers=headers
        )
        spot_id = spot_response.json()["id"]
        
        # Create multiple sessions
        for i in range(3):
            session_data = {
                "vehicle_id": vehicle_id,
                "spot_id": spot_id,
                "start_time": (datetime.now() - timedelta(hours=i*2)).isoformat()
            }
            await self.client.post("/api/v1/parking/sessions", json=session_data, headers=headers)
        
        # Act
        response = await self.client.get(
            f"/api/v1/vehicles/{vehicle_id}/parking-history",
            headers=headers
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert len(data["items"]) >= 3


# ============================================================================
# Charging API Tests
# ============================================================================

class TestChargingAPI(BaseAPIIntegrationTest):
    """Integration tests for charging API endpoints."""
    
    @api_test
    async def test_start_charging_session(self):
        """Test starting a charging session."""
        # Arrange - Setup user and vehicle
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create vehicle
        vehicle_data = IntegrationTestData.VEHICLE
        vehicle_response = await self.client.post(
            "/api/v1/vehicles",
            json=vehicle_data,
            headers=headers
        )
        vehicle_id = vehicle_response.json()["id"]
        
        # Create charging station
        station_data = IntegrationTestData.CHARGING_STATION
        station_response = await self.client.post(
            "/api/v1/charging/stations",
            json=station_data,
            headers=headers
        )
        station_id = station_response.json()["id"]
        
        # Act
        session_data = {
            "vehicle_id": vehicle_id,
            "station_id": station_id,
            "connector_type": "CCS",
            "start_time": datetime.now().isoformat()
        }
        response = await self.client.post(
            "/api/v1/charging/sessions/start",
            json=session_data,
            headers=headers
        )
        
        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["vehicle_id"] == vehicle_id
        assert data["station_id"] == station_id
        assert data["status"] == "active"
        assert "id" in data
    
    @api_test
    async def test_stop_charging_session(self):
        """Test stopping a charging session."""
        # Arrange - Setup session
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create vehicle
        vehicle_data = IntegrationTestData.VEHICLE
        vehicle_response = await self.client.post(
            "/api/v1/vehicles",
            json=vehicle_data,
            headers=headers
        )
        vehicle_id = vehicle_response.json()["id"]
        
        # Create charging station
        station_data = IntegrationTestData.CHARGING_STATION
        station_response = await self.client.post(
            "/api/v1/charging/stations",
            json=station_data,
            headers=headers
        )
        station_id = station_response.json()["id"]
        
        # Start session
        session_data = {
            "vehicle_id": vehicle_id,
            "station_id": station_id,
            "connector_type": "CCS",
            "start_time": datetime.now().isoformat()
        }
        session_response = await self.client.post(
            "/api/v1/charging/sessions/start",
            json=session_data,
            headers=headers
        )
        session_id = session_response.json()["id"]
        
        # Act
        stop_data = {
            "energy_consumed_kwh": 25.5
        }
        response = await self.client.post(
            f"/api/v1/charging/sessions/{session_id}/stop",
            json=stop_data,
            headers=headers
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == session_id
        assert data["status"] == "completed"
        assert data["energy_consumed_kwh"] == 25.5
    
    @api_test
    async def test_get_charging_stations(self):
        """Test getting charging stations."""
        # Arrange - Create user and login
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create stations
        for i in range(3):
            station_data = IntegrationTestData.CHARGING_STATION.copy()
            station_data["station_name"] = f"Station {i+1}"
            await self.client.post("/api/v1/charging/stations", json=station_data, headers=headers)
        
        # Act
        response = await self.client.get("/api/v1/charging/stations", headers=headers)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert len(data["items"]) >= 3


# ============================================================================
# Payment API Tests
# ============================================================================

class TestPaymentAPI(BaseAPIIntegrationTest):
    """Integration tests for payment API endpoints."""
    
    @api_test
    async def test_create_payment(self):
        """Test creating a payment."""
        # Arrange - Setup user and session
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create vehicle
        vehicle_data = IntegrationTestData.VEHICLE
        vehicle_response = await self.client.post(
            "/api/v1/vehicles",
            json=vehicle_data,
            headers=headers
        )
        vehicle_id = vehicle_response.json()["id"]
        
        # Create parking spot
        spot_data = IntegrationTestData.PARKING_SPOT
        spot_response = await self.client.post(
            "/api/v1/parking/spots",
            json=spot_data,
            headers=headers
        )
        spot_id = spot_response.json()["id"]
        
        # Create parking session
        session_data = {
            "vehicle_id": vehicle_id,
            "spot_id": spot_id,
            "start_time": datetime.now().isoformat()
        }
        session_response = await self.client.post(
            "/api/v1/parking/sessions",
            json=session_data,
            headers=headers
        )
        session_id = session_response.json()["id"]
        
        # End session
        await self.client.post(
            f"/api/v1/parking/sessions/{session_id}/end",
            json={"end_time": datetime.now().isoformat()},
            headers=headers
        )
        
        # Act
        payment_data = {
            "amount": 10.00,
            "currency": "USD",
            "session_id": session_id,
            "session_type": "parking",
            "payment_method": "credit_card"
        }
        response = await self.client.post(
            "/api/v1/payments",
            json=payment_data,
            headers=headers
        )
        
        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["amount"] == 10.00
        assert data["session_id"] == session_id
        assert data["status"] == "pending"
        assert "id" in data
    
    @api_test
    async def test_process_payment(self):
        """Test processing a payment."""
        # Arrange - Create payment
        # (Setup similar to test_create_payment)
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create vehicle, spot, session
        vehicle_data = IntegrationTestData.VEHICLE
        vehicle_response = await self.client.post("/api/v1/vehicles", json=vehicle_data, headers=headers)
        vehicle_id = vehicle_response.json()["id"]
        
        spot_data = IntegrationTestData.PARKING_SPOT
        spot_response = await self.client.post("/api/v1/parking/spots", json=spot_data, headers=headers)
        spot_id = spot_response.json()["id"]
        
        session_data = {
            "vehicle_id": vehicle_id,
            "spot_id": spot_id,
            "start_time": datetime.now().isoformat()
        }
        session_response = await self.client.post("/api/v1/parking/sessions", json=session_data, headers=headers)
        session_id = session_response.json()["id"]
        
        await self.client.post(
            f"/api/v1/parking/sessions/{session_id}/end",
            json={"end_time": datetime.now().isoformat()},
            headers=headers
        )
        
        # Create payment
        payment_data = {
            "amount": 10.00,
            "currency": "USD",
            "session_id": session_id,
            "session_type": "parking",
            "payment_method": "credit_card"
        }
        payment_response = await self.client.post("/api/v1/payments", json=payment_data, headers=headers)
        payment_id = payment_response.json()["id"]
        
        # Act
        response = await self.client.post(
            f"/api/v1/payments/{payment_id}/process",
            headers=headers
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == payment_id
        assert data["status"] == "completed"
        assert "transaction_id" in data


# ============================================================================
# Notification API Tests
# ============================================================================

class TestNotificationAPI(BaseAPIIntegrationTest):
    """Integration tests for notification API endpoints."""
    
    @api_test
    async def test_create_notification(self):
        """Test creating a notification."""
        # Arrange - Create user and login
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Act
        notification_data = IntegrationTestData.NOTIFICATION
        response = await self.client.post(
            "/api/v1/notifications",
            json=notification_data,
            headers=headers
        )
        
        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == notification_data["title"]
        assert data["message"] == notification_data["message"]
        assert data["is_read"] is False
        assert "id" in data
    
    @api_test
    async def test_get_notifications(self):
        """Test getting notifications."""
        # Arrange - Create user and login
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create multiple notifications
        for i in range(3):
            notification_data = IntegrationTestData.NOTIFICATION.copy()
            notification_data["title"] = f"Notification {i+1}"
            await self.client.post("/api/v1/notifications", json=notification_data, headers=headers)
        
        # Act
        response = await self.client.get("/api/v1/notifications", headers=headers)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert len(data["items"]) >= 3
    
    @api_test
    async def test_mark_notification_read(self):
        """Test marking a notification as read."""
        # Arrange - Create user and login
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create notification
        notification_data = IntegrationTestData.NOTIFICATION
        create_response = await self.client.post(
            "/api/v1/notifications",
            json=notification_data,
            headers=headers
        )
        notification_id = create_response.json()["id"]
        
        # Act
        response = await self.client.post(
            f"/api/v1/notifications/{notification_id}/mark-read",
            headers=headers
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        
        # Verify notification is read
        response = await self.client.get(
            f"/api/v1/notifications/{notification_id}",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_read"] is True
    
    @api_test
    async def test_get_unread_count(self):
        """Test getting unread notification count."""
        # Arrange - Create user and login
        user_data = IntegrationTestData.USER
        await self.client.post("/api/v1/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response = await self.client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create notifications
        for i in range(5):
            notification_data = IntegrationTestData.NOTIFICATION.copy()
            notification_data["title"] = f"Notification {i+1}"
            await self.client.post("/api/v1/notifications", json=notification_data, headers=headers)
        
        # Act
        response = await self.client.get("/api/v1/notifications/unread-count", headers=headers)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "unread_count" in data
        assert data["unread_count"] >= 5


# ============================================================================
# Webhook API Tests
# ============================================================================

class TestWebhookAPI(BaseAPIIntegrationTest):
    """Integration tests for webhook API endpoints."""
    
    @api_test
    async def test_stripe_webhook_success(self):
        """Test Stripe webhook processing."""
        # Arrange
        webhook_data = {
            "id": "evt_test_123",
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": "pi_test_123",
                    "amount": 10000,
                    "currency": "usd",
                    "status": "succeeded"
                }
            }
        }
        
        # Act
        response = await self.client.post(
            "/api/v1/webhooks/stripe",
            json=webhook_data,
            headers={"stripe-signature": "test_signature"}
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data.get("received") is True
        assert data.get("status") == "success"
    
    @api_test
    async def test_stripe_webhook_invalid_signature(self):
        """Test Stripe webhook with invalid signature."""
        # Arrange
        webhook_data = {
            "id": "evt_test_123",
            "type": "payment_intent.succeeded"
        }
        
        # Act
        response = await self.client.post(
            "/api/v1/webhooks/stripe",
            json=webhook_data,
            headers={}  # No signature
        )
        
        # Assert
        assert response.status_code == 400
        data = response.json()
        assert "Missing stripe-signature header" in str(data) or "signature" in str(data).lower()


# ============================================================================
# Health Check API Tests
# ============================================================================

class TestHealthAPI(BaseAPIIntegrationTest):
    """Integration tests for health check API endpoints."""
    
    @api_test
    async def test_health_check(self):
        """Test health check endpoint."""
        # Act
        response = await self.client.get("/health")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
    
    @api_test
    async def test_readiness_check(self):
        """Test readiness check endpoint."""
        # Act
        response = await self.client.get("/health/readiness")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ready"
        assert "database" in data
        assert data["database"] == "connected"
    
    @api_test
    async def test_liveness_check(self):
        """Test liveness check endpoint."""
        # Act
        response = await self.client.get("/health/liveness")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "alive"


# ============================================================================
# API Documentation Tests
# ============================================================================

class TestAPIDocumentation(BaseAPIIntegrationTest):
    """Integration tests for API documentation endpoints."""
    
    @api_test
    async def test_swagger_ui(self):
        """Test Swagger UI endpoint."""
        # Act
        response = await self.client.get("/docs")
        
        # Assert
        assert response.status_code == 200
        assert "text/html" in response.headers.get("content-type", "")
    
    @api_test
    async def test_openapi_schema(self):
        """Test OpenAPI schema endpoint."""
        # Act
        response = await self.client.get("/openapi.json")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "info" in data
        assert "paths" in data
        assert data["info"]["title"] == "Parking Management System API"


# ============================================================================
# Error Handling API Tests
# ============================================================================

class TestErrorHandlingAPI(BaseAPIIntegrationTest):
    """Integration tests for API error handling."""
    
    @api_test
    async def test_404_error(self):
        """Test 404 error response."""
        # Act
        response = await self.client.get("/api/v1/nonexistent")
        
        # Assert
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data or "error" in data
        assert "not found" in str(data).lower()
    
    @api_test
    async def test_validation_error(self):
        """Test validation error response."""
        # Act
        response = await self.client.post(
            "/api/v1/auth/register",
            json={"username": "test"}  # Missing required fields
        )
        
        # Assert
        assert response.status_code == 422
        data = response.json()
        assert "validation_error" in str(data).lower() or "detail" in data
    
    @api_test
    async def test_unauthorized_error(self):
        """Test unauthorized error response."""
        # Act - Access protected endpoint without token
        response = await self.client.get("/api/v1/users/me")
        
        # Assert
        assert response.status_code == 401
        data = response.json()
        assert "unauthorized" in str(data).lower() or "authenticate" in str(data).lower()