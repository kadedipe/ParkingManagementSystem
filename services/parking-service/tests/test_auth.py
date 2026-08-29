import pytest

def test_register(client):
    response = client.post(
        "/v1/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User",
            "phone_number": "+256 700 000 001"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login(client):
    # First register a user
    client.post(
        "/v1/auth/register",
        json={
            "username": "testuser2",
            "email": "test2@example.com",
            "password": "password123",
            "full_name": "Test User 2"
        }
    )
    
    # Then login
    response = client.post(
        "/v1/auth/login",
        json={
            "username": "testuser2",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_protected_route(client):
    # Register and login
    client.post(
        "/v1/auth/register",
        json={
            "username": "testuser3",
            "email": "test3@example.com",
            "password": "password123",
            "full_name": "Test User 3"
        }
    )
    
    login_response = client.post(
        "/v1/auth/login",
        json={
            "username": "testuser3",
            "password": "password123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Access protected route
    response = client.get(
        "/v1/auth/protected",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"] == "testuser3"
