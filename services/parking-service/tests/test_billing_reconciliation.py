from datetime import datetime, timedelta


def _headers(client, suffix):
    response = client.post(
        "/v1/auth/register",
        json={
            "username": f"reconcile-{suffix}",
            "email": f"reconcile-{suffix}@example.com",
            "password": "password123",
            "full_name": "Billing Reconciliation User",
        },
    )
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def _paid_reservation(client, headers, suffix, reserved_hours=2):
    lot = client.post(
        "/v1/parking-lots/",
        json={
            "name": f"Reconcile Lot {suffix}",
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
            "number": f"REC-{suffix}",
            "level": 1,
            "type": "standard",
        },
    )
    assert spot.status_code == 201

    start = datetime.utcnow() + timedelta(hours=1)
    reservation = client.post(
        "/v1/reservations/",
        headers=headers,
        json={
            "parking_spot_id": spot.json()["id"],
            "start_time": start.isoformat(),
            "end_time": (start + timedelta(hours=reserved_hours)).isoformat(),
        },
    )
    assert reservation.status_code == 201
    reservation_id = reservation.json()["id"]
    assert client.post(f"/v1/reservations/{reservation_id}/confirm", headers=headers).status_code == 200

    payment = client.post(
        "/v1/payments/",
        headers=headers,
        json={"reservation_id": reservation_id, "payment_method": "credit_card", "currency": "USD"},
    )
    assert payment.status_code == 201
    processed = client.post(f"/v1/payments/{payment.json()['id']}/process", headers=headers, json={})
    assert processed.status_code == 200
    return reservation_id, payment.json()["id"]


def _complete_session(client, headers, reservation_id, actual_hours):
    started_at = datetime.utcnow() - timedelta(hours=actual_hours)
    started = client.post(
        "/v1/parking-sessions/start",
        headers=headers,
        json={"reservation_id": reservation_id, "start_time": started_at.isoformat()},
    )
    assert started.status_code == 201
    ended = client.post(
        f"/v1/parking-sessions/{started.json()['id']}/end",
        headers=headers,
        json={"end_time": datetime.utcnow().isoformat()},
    )
    assert ended.status_code == 200
    return ended.json()


def test_local_underage_credit_reconciles_payment(client, monkeypatch):
    monkeypatch.setenv("PAYMENT_PROVIDER", "local")
    headers = _headers(client, "credit")
    reservation_id, payment_id = _paid_reservation(client, headers, "CREDIT", reserved_hours=2)

    completed = _complete_session(client, headers, reservation_id, actual_hours=1)
    billing = completed["billing"]
    assert billing["type"] == "credit"
    assert billing["status"] == "settled"
    assert billing["reserved_amount"] == 8.0
    assert 3.9 <= billing["actual_amount"] <= 4.1
    assert -4.1 <= billing["adjustment_amount"] <= -3.9

    history = client.get("/v1/payments/history", headers=headers)
    assert history.status_code == 200
    payment = next(item for item in history.json() if item["id"] == payment_id)
    assert 3.9 <= payment["amount"] <= 4.1

    adjustments = client.get("/v1/payments/adjustments", headers=headers)
    assert adjustments.status_code == 200
    assert len(adjustments.json()) == 1
    assert adjustments.json()[0]["status"] == "settled"


def test_local_overage_reconciles_payment(client, monkeypatch):
    monkeypatch.setenv("PAYMENT_PROVIDER", "local")
    headers = _headers(client, "overage")
    reservation_id, payment_id = _paid_reservation(client, headers, "OVER", reserved_hours=1)

    completed = _complete_session(client, headers, reservation_id, actual_hours=2)
    billing = completed["billing"]
    assert billing["type"] == "overage"
    assert billing["status"] == "settled"
    assert billing["reserved_amount"] == 4.0
    assert 7.9 <= billing["actual_amount"] <= 8.1
    assert 3.9 <= billing["adjustment_amount"] <= 4.1

    history = client.get("/v1/payments/history", headers=headers)
    assert history.status_code == 200
    payment = next(item for item in history.json() if item["id"] == payment_id)
    assert 7.9 <= payment["amount"] <= 8.1
