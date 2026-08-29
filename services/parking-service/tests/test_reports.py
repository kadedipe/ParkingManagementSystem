from datetime import date, datetime, timedelta


def _headers(client):
    response = client.post(
        "/v1/auth/register",
        json={
            "username": "report-user",
            "email": "report@example.com",
            "password": "password123",
            "full_name": "Report User",
        },
    )
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def test_report_generates_historical_summary(client, monkeypatch):
    monkeypatch.setenv("PAYMENT_PROVIDER", "local")
    headers = _headers(client)

    lot = client.post(
        "/v1/parking-lots/",
        json={
            "name": "Report Lot",
            "address": {"street": "2 Analytics Road", "city": "Test City"},
            "total_spots": 1,
            "price_per_hour": 5.0,
        },
    )
    assert lot.status_code == 201
    spot = client.post(
        "/v1/parking-spots/",
        json={
            "parking_lot_id": lot.json()["id"],
            "number": "RPT-001",
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
            "end_time": (start + timedelta(hours=1)).isoformat(),
        },
    )
    assert reservation.status_code == 201

    payment = client.post(
        "/v1/payments/",
        headers=headers,
        json={
            "reservation_id": reservation.json()["id"],
            "payment_method": "credit_card",
            "currency": "USD",
        },
    )
    assert payment.status_code == 201
    processed = client.post(
        f"/v1/payments/{payment.json()['id']}/process",
        headers=headers,
        json={},
    )
    assert processed.status_code == 200

    today = date.today().isoformat()
    report = client.get(
        "/v1/reports/analytics",
        headers=headers,
        params={
            "start_date": today,
            "end_date": today,
            "report_type": "operations",
        },
    )
    assert report.status_code == 200
    body = report.json()
    assert body["summary"]["total_spots"] == 1
    assert body["summary"]["revenue"] == 5.0
    assert body["summary"]["completed_payments"] == 1
    assert body["summary"]["reservations"] == 1
    assert body["summary"]["activity"] >= 2
    assert len(body["daily"]) == 1
    assert body["daily"][0]["revenue"] == 5.0


def test_report_rejects_inverted_date_range(client):
    headers = _headers(client)
    response = client.get(
        "/v1/reports/analytics",
        headers=headers,
        params={
            "start_date": "2026-08-30",
            "end_date": "2026-08-29",
            "report_type": "operations",
        },
    )
    assert response.status_code == 400
