from datetime import datetime, timedelta


def _auth_headers(client):
    register = client.post(
        "/v1/auth/register",
        json={
            "username": "payment-user",
            "email": "payment@example.com",
            "password": "password123",
            "full_name": "Payment User",
        },
    )
    assert register.status_code == 200
    return {"Authorization": f"Bearer {register.json()['access_token']}"}


def _confirmed_reservation(client, headers):
    lot = client.post(
        "/v1/parking-lots/",
        json={
            "name": "Payment Test Lot",
            "address": {"street": "1 Billing Road", "city": "Test City"},
            "total_spots": 1,
            "price_per_hour": 4.0,
        },
    )
    assert lot.status_code == 201

    spot = client.post(
        "/v1/parking-spots/",
        json={
            "parking_lot_id": lot.json()["id"],
            "number": "PAY-001",
            "level": 1,
            "type": "standard",
        },
    )
    assert spot.status_code == 201

    start = datetime.utcnow() + timedelta(hours=2)
    reservation = client.post(
        "/v1/reservations/",
        headers=headers,
        json={
            "parking_spot_id": spot.json()["id"],
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
    return confirmed.json()


def test_payment_create_process_receipt_refund(client, monkeypatch):
    monkeypatch.setenv("PAYMENT_PROVIDER", "local")
    headers = _auth_headers(client)
    reservation = _confirmed_reservation(client, headers)

    created = client.post(
        "/v1/payments/",
        headers=headers,
        json={
            "reservation_id": reservation["id"],
            "payment_method": "credit_card",
            "currency": "USD",
        },
    )
    assert created.status_code == 201
    payment = created.json()
    assert payment["reservation_id"] == reservation["id"]
    assert payment["status"] == "pending"
    assert payment["amount"] == 8.0

    duplicate = client.post(
        "/v1/payments/",
        headers=headers,
        json={
            "reservation_id": reservation["id"],
            "payment_method": "credit_card",
            "currency": "USD",
        },
    )
    assert duplicate.status_code == 201
    assert duplicate.json()["id"] == payment["id"]

    processed = client.post(
        f"/v1/payments/{payment['id']}/process",
        headers=headers,
        json={},
    )
    assert processed.status_code == 200
    processed_payment = processed.json()
    assert processed_payment["status"] == "completed"
    assert processed_payment["receipt_number"]

    history = client.get("/v1/payments/history", headers=headers)
    assert history.status_code == 200
    assert len(history.json()) == 1
    assert history.json()[0]["status"] == "completed"

    stats = client.get("/v1/payments/stats", headers=headers)
    assert stats.status_code == 200
    assert stats.json()["completed"] == 1
    assert stats.json()["total"] == 8.0

    receipt = client.get(
        f"/v1/payments/{payment['id']}/receipt",
        headers=headers,
    )
    assert receipt.status_code == 200
    assert receipt.json()["receipt_number"] == processed_payment["receipt_number"]

    refunded = client.post(
        f"/v1/payments/{payment['id']}/refund",
        headers=headers,
        json={},
    )
    assert refunded.status_code == 200
    assert refunded.json()["status"] == "refunded"
