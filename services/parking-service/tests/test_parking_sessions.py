from datetime import datetime, timedelta


def _auth_headers(client):
    register = client.post(
        "/v1/auth/register",
        json={
            "username": "session-user",
            "email": "session@example.com",
            "password": "password123",
            "full_name": "Session User",
        },
    )
    assert register.status_code == 200
    return {"Authorization": f"Bearer {register.json()['access_token']}"}


def _confirmed_reservation(client, headers):
    lot = client.post(
        "/v1/parking-lots/",
        json={
            "name": "Session Test Lot",
            "address": {"street": "1 Test Road", "city": "Test City"},
            "total_spots": 1,
            "price_per_hour": 6.0,
        },
    )
    assert lot.status_code == 201
    lot_id = lot.json()["id"]

    spot = client.post(
        "/v1/parking-spots/",
        json={
            "parking_lot_id": lot_id,
            "number": "P-001",
            "level": 1,
            "type": "standard",
        },
    )
    assert spot.status_code == 201
    spot_id = spot.json()["id"]

    start = datetime.utcnow() + timedelta(hours=1)
    reservation = client.post(
        "/v1/reservations/",
        headers=headers,
        json={
            "parking_spot_id": spot_id,
            "start_time": start.isoformat(),
            "end_time": (start + timedelta(hours=2)).isoformat(),
        },
    )
    assert reservation.status_code == 201

    confirmed = client.post(
        f"/v1/reservations/{reservation.json()['id']}/confirm",
        headers=headers,
    )
    assert confirmed.status_code == 200
    return confirmed.json(), spot_id


def test_session_start_end_and_dashboard_metrics(client):
    headers = _auth_headers(client)
    reservation, spot_id = _confirmed_reservation(client, headers)

    session_start = datetime.utcnow() - timedelta(hours=1)
    started = client.post(
        "/v1/parking-sessions/start",
        headers=headers,
        json={
            "reservation_id": reservation["id"],
            "start_time": session_start.isoformat(),
        },
    )
    assert started.status_code == 201
    session = started.json()
    assert session["status"] == "active"

    occupied_spot = client.get(f"/v1/parking-spots/{spot_id}")
    assert occupied_spot.status_code == 200
    assert occupied_spot.json()["status"] == "occupied"

    active_dashboard = client.get("/v1/parking-sessions/dashboard", headers=headers)
    assert active_dashboard.status_code == 200
    assert active_dashboard.json()["stats"]["active_sessions"] == 1
    assert active_dashboard.json()["stats"]["occupied_spots"] == 1
    assert len(active_dashboard.json()["occupancy_data"]) == 24

    ended = client.post(
        f"/v1/parking-sessions/{session['id']}/end",
        headers=headers,
        json={"end_time": datetime.utcnow().isoformat()},
    )
    assert ended.status_code == 200
    completed = ended.json()
    assert completed["status"] == "completed"
    assert completed["duration_minutes"] >= 59
    assert completed["total_amount"] >= 5.9

    available_spot = client.get(f"/v1/parking-spots/{spot_id}")
    assert available_spot.status_code == 200
    assert available_spot.json()["status"] == "available"

    dashboard = client.get("/v1/parking-sessions/dashboard", headers=headers)
    assert dashboard.status_code == 200
    payload = dashboard.json()
    assert payload["stats"]["active_sessions"] == 0
    assert payload["stats"]["today_sessions"] == 1
    assert payload["stats"]["total_revenue"] >= 5.9
    assert payload["stats"]["weekly_revenue"] >= payload["stats"]["total_revenue"]
    assert len(payload["revenue_data"]) == 7
    assert len(payload["activity_data"]) >= 2
