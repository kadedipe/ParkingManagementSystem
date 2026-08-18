import pytest

def test_create_user(client, test_user_data):
    response = client.post("/v1/users/", json=test_user_data)
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == test_user_data["username"]
    assert data["email"] == test_user_data["email"]
    assert "id" in data

def test_get_users(client, test_user_data):
    client.post("/v1/users/", json=test_user_data)
    response = client.get("/v1/users/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1

def test_get_user_by_id(client, test_user_data):
    create_response = client.post("/v1/users/", json=test_user_data)
    user_id = create_response.json()["id"]
    
    response = client.get(f"/v1/users/{user_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == test_user_data["username"]

def test_update_user(client, test_user_data):
    create_response = client.post("/v1/users/", json=test_user_data)
    user_id = create_response.json()["id"]
    
    update_data = {"full_name": "Updated Name", "phone_number": "+1-555-999-8888"}
    response = client.put(f"/v1/users/{user_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == update_data["full_name"]

def test_delete_user(client, test_user_data):
    create_response = client.post("/v1/users/", json=test_user_data)
    user_id = create_response.json()["id"]
    
    response = client.delete(f"/v1/users/{user_id}")
    assert response.status_code == 204