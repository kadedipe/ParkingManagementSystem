import pytest


@pytest.mark.asyncio
async def test_create_charging_station(client, test_charging_station_data):
    response = await client.post(
        "/v1/charging-stations/", json=test_charging_station_data
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == test_charging_station_data["name"]
    assert data["total_connectors"] == len(test_charging_station_data["connectors"])
    assert data["available_connectors"] == len(
        test_charging_station_data["connectors"]
    )
    assert "id" in data


@pytest.mark.asyncio
async def test_get_charging_stations(client, test_charging_station_data):
    await client.post("/v1/charging-stations/", json=test_charging_station_data)
    response = await client.get("/v1/charging-stations/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


@pytest.mark.asyncio
async def test_get_charging_station_by_id(client, test_charging_station_data):
    create_response = await client.post(
        "/v1/charging-stations/", json=test_charging_station_data
    )
    station_id = create_response.json()["id"]

    response = await client.get(f"/v1/charging-stations/{station_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == test_charging_station_data["name"]


@pytest.mark.asyncio
async def test_charging_availability(client, test_charging_station_data):
    create_response = await client.post(
        "/v1/charging-stations/", json=test_charging_station_data
    )
    station_id = create_response.json()["id"]

    availability_response = await client.get(
        f"/v1/charging-stations/{station_id}/availability"
    )
    assert availability_response.status_code == 200
    data = availability_response.json()
    assert data["total_connectors"] == 2
    assert data["available_connectors"] == 2
