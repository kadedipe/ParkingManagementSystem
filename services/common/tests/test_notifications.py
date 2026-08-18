import pytest

def test_create_notification(client, test_user_data):
    # Create user first
    user_response = client.post("/v1/users/", json=test_user_data)
    user_id = user_response.json()["id"]
    
    notification_data = {
        "user_id": user_id,
        "type": "email",
        "title": "Test Notification",
        "content": "This is a test notification"
    }
    response = client.post("/v1/notifications/", json=notification_data)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == notification_data["title"]
    assert data["status"] == "pending"

def test_get_notifications(client, test_user_data):
    user_response = client.post("/v1/users/", json=test_user_data)
    user_id = user_response.json()["id"]
    
    client.post("/v1/notifications/", json={
        "user_id": user_id,
        "type": "email",
        "title": "Test",
        "content": "Content"
    })
    
    response = client.get("/v1/notifications/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1

def test_mark_notification_read(client, test_user_data):
    user_response = client.post("/v1/users/", json=test_user_data)
    user_id = user_response.json()["id"]
    
    notification_response = client.post("/v1/notifications/", json={
        "user_id": user_id,
        "type": "email",
        "title": "Test",
        "content": "Content"
    })
    notification_id = notification_response.json()["id"]
    
    response = client.post(f"/v1/notifications/{notification_id}/read")
    assert response.status_code == 200
    assert response.json()["message"] == "Notification marked as read"