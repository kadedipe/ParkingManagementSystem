import pytest

def test_create_parking_lot(client, test_parking_lot_data):
    response = client.post("/v1/parking-lots/", json=test_parking_lot_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == test_parking_lot_data["name"]
    assert data["total_spots"] == test_parking_lot_data["total_spots"]
    assert data["available_spots"] == test_parking_lot_data["total_spots"]
    assert "id" in data

def test_get_parking_lots(client, test_parking_lot_data):
    client.post("/v1/parking-lots/", json=test_parking_lot_data)
    response = client.get("/v1/parking-lots/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1

def test_get_parking_lot_by_id(client, test_parking_lot_data):
    create_response = client.post("/v1/parking-lots/", json=test_parking_lot_data)
    lot_id = create_response.json()["id"]
    
    response = client.get(f"/v1/parking-lots/{lot_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == test_parking_lot_data["name"]

def test_reserve_spot(client, test_parking_lot_data):
    create_response = client.post("/v1/parking-lots/", json=test_parking_lot_data)
    lot_id = create_response.json()["id"]
    
    # Check availability
    availability_response = client.get(f"/v1/parking-lots/{lot_id}/availability")
    assert availability_response.json()["available_spots"] == 50
    
    # Reserve a spot
    reserve_response = client.post(f"/v1/parking-lots/{lot_id}/reserve")
    assert reserve_response.status_code == 200
    assert reserve_response.json()["remaining_spots"] == 49
    
    # Check availability again
    availability_response = client.get(f"/v1/parking-lots/{lot_id}/availability")
    assert availability_response.json()["available_spots"] == 49