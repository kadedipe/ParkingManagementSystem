# Parking Management System

A production-oriented smart parking platform deployed on Railway. The system combines parking inventory, reservations, parking sessions, payments, billing reconciliation, EV charging, vehicles, notifications, dashboards, and historical reporting behind a single browser/mobile API gateway.

## Live application

**Open the production web application in any modern browser:**

[Launch Parking Management System](https://frontend-production-fcc8.up.railway.app)

Production API Gateway: `https://api-gateway-production-3a40.up.railway.app`

The frontend and API Gateway are public Railway services. Parking, Vehicle, Notification, Charging, PostgreSQL, and Redis remain private and are reached through Railway private networking.

## Current production capabilities

The current production release includes:

- Persistent parking lots and parking spots backed by PostgreSQL.
- Searchable parking inventory with availability, price and location filters.
- Persistent reservation creation, confirmation and cancellation with ownership checks and inventory reconciliation.
- Reservation Calendar with operational **Start Parking** and **End Parking** controls.
- Persistent parking sessions with start/end timestamps, duration, hourly rate, final charge and spot-status transitions.
- Dashboard occupancy, active-session counts, session duration, recent activity and upcoming reservations.
- Operational payment records with history, statistics, receipts and refunds.
- Local transactional payment processing and Stripe-ready provider integration.
- Automatic end-of-session billing reconciliation for prepaid reservations.
- Overage, credit and no-adjustment reconciliation records with settlement status and audit history.
- Database-backed historical Reports & Analytics with selectable date ranges.
- Historical occupancy calculated from persisted session overlap.
- Revenue reporting derived from completed persisted payments.
- Activity reporting derived from reservations, session starts and completed payments.
- CSV report export.
- Persistent EV charging station/session management.
- User profile persistence and avatar support.
- Vehicle management and hardened vehicle/plate validation.
- In-app notification and notification-preference services.
- Responsive React web interface and React Native / Expo mobile application.
- Railway health checks, readiness checks, migration gates, monitoring and recovery workflows.
- GitHub Actions for CI, migrations, Docker builds, security scanning and production validation.

## End-to-end parking workflow

```text
Search Parking
      |
      v
Select Spot
      |
      v
Create Reservation
      |
      v
Confirm Reservation
      |
      v
Create / Process Payment
      |
      v
Start Parking
      |
      +--> Reservation: ACTIVE
      +--> Spot: OCCUPIED
      +--> Dashboard occupancy/session metrics update
      |
      v
End Parking
      |
      +--> Duration calculated
      +--> Final session charge calculated
      +--> Reservation: COMPLETED
      +--> Spot: AVAILABLE
      |
      v
Automatic Billing Reconciliation
      |
      +--> Overage
      +--> Credit
      +--> No adjustment
      |
      v
Payments + Reports + Recent Activity
```

For the current Local payment processor, overages and credits are automatically settled by reconciling the persisted completed payment to the actual session amount. Stripe credits can use partial refunds; Stripe overages are not silently charged without an authorized tokenized/off-session payment method.

## Architecture

```text
                    +-----------------------+
                    |   React Web Frontend  |
                    |       /frontend       |
                    +-----------+-----------+
                                | HTTPS
                    +-----------v-----------+
                    |      API Gateway      |
                    | services/gateway-*    |
                    +-----------+-----------+
                                | Railway private network
          +---------------------+-------------------------+
          |                     |                         |
          v                     v                         v
 +----------------+   +----------------+       +--------------------+
 | Parking Service|   | Vehicle Service|       |Notification Service|
 | auth / parking |   | user vehicles  |       | notifications      |
 | reservations   |   +----------------+       +--------------------+
 | sessions       |
 | payments       |                +-------------------------+
 | reports        |                | Charging Service        |
 +-------+--------+                | EV charging / sessions  |
         |                         +-------------------------+
         |
         +---------------------+-------------------------+
                               |
                    +----------v---------+
                    | Railway PostgreSQL |
                    +--------------------+
                               |
                    +----------v---------+
                    |   Railway Redis    |
                    +--------------------+

       +------------------------------+
       | React Native / Expo mobile   |
       |            /mobile           |
       +------------------------------+
```

## Deployable services

| Service | Directory | Runtime | Exposure | Responsibility |
|---|---|---|---|---|
| API Gateway | `services/gateway-service` | FastAPI | Public | Single browser/mobile API boundary |
| Parking | `services/parking-service` | FastAPI | Private | Auth, parking, reservations, sessions, payments, reports |
| Vehicle | `services/vehicle-service` | FastAPI | Private | User vehicle CRUD and export |
| Notifications | `services/notification-service` | FastAPI | Private | In-app notifications and preferences |
| Charging | `services/charging-service` | FastAPI | Private | EV stations, connectors and charging sessions |
| Web | `frontend` | React + Vite + Nginx | Public | Browser application |
| Mobile | `mobile` | React Native / Expo | App distribution | Mobile application |
| PostgreSQL | Railway managed | PostgreSQL | Private | Authoritative persistent data store |
| Redis | Railway managed | Redis | Private | Cache and ephemeral messaging |

`backend/`, `apps/`, and `services/common/` contain legacy or experimental code and are not part of the primary production Railway request path.

## Parking and reservation lifecycle

Reservations are persisted and linked to parking spots and users. Confirmation reserves inventory; cancellation releases it. Starting a parking session transitions the reservation to active and the selected spot to occupied. Ending the session records the final duration and charge, completes the reservation and releases the spot.

The Reservation Calendar provides a single operational view for these transitions and displays persisted session timestamps, duration and charge.

## Payments and billing reconciliation

The parking service exposes persistent payment APIs for:

- payment creation;
- payment history;
- payment statistics;
- processing;
- receipts;
- refunds;
- billing-adjustment history.

When a session ends, the service compares the amount already paid for the reservation with the actual elapsed-session charge and creates exactly one reconciliation record per parking session.

```text
actual charge > prepaid amount  -> overage
actual charge < prepaid amount  -> credit
actual charge = prepaid amount  -> no adjustment
```

Reconciliation records preserve the original reserved amount, actual amount, adjustment delta, currency, provider reference, settlement status and timestamps.

## Reports & Analytics

Historical reports use persisted database records rather than frontend placeholder values.

`GET /reports/analytics` supports a selected start date, end date and report type. Reports include:

- occupancy percentage;
- completed-payment revenue;
- reservation/session/payment activity;
- total parking capacity;
- completed sessions;
- average session duration;
- reservation counts;
- completed payment counts;
- daily occupancy, revenue and activity rows;
- CSV export from the web interface.

Occupancy is based on actual parking-session overlap, so a reservation by itself does not count as physical occupancy.

## EV charging

The charging service manages EV charging stations, connectors and charging sessions and is routed through the public API Gateway while remaining private inside Railway. Charging functionality is integrated into the web dashboard and charging management interface.

## Dashboard

The web Dashboard provides operational visibility into:

- total / available / occupied / reserved parking spots;
- active and daily parking sessions;
- average completed-session duration;
- revenue and weekly revenue trends;
- occupancy history;
- parking-spot status distribution;
- recent parking activity;
- upcoming reservations;
- EV charging availability and usage.

## Production URLs

| Resource | URL |
|---|---|
| Web application | https://frontend-production-fcc8.up.railway.app |
| Frontend health | https://frontend-production-fcc8.up.railway.app/healthz |
| API Gateway | https://api-gateway-production-3a40.up.railway.app |
| Gateway health | https://api-gateway-production-3a40.up.railway.app/health |
| Backend readiness | https://api-gateway-production-3a40.up.railway.app/ready |

## Local development

### Python services

Each Python service can run independently. For example:

```bash
cd services/parking-service
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/macOS
source .venv/bin/activate

pip install -r requirements.dev.txt
ENVIRONMENT=test pytest -q
```

For production-like local infrastructure, use PostgreSQL and Redis rather than SQLite.

### Web frontend

```bash
cd frontend
npm ci
npm run dev
```

### Mobile

```bash
cd mobile
npm install
npx expo start
```

## Database migrations

The production Python services use Alembic migrations. Railway runs migration commands before enabling new application revisions. The parking-service migration history includes persistent reservations/payments, parking sessions, profile fields, payment hardening and billing-adjustment persistence.

Typical parking-service migration command:

```bash
cd services/parking-service
alembic upgrade head
```

## CI/CD and production operations

GitHub Actions validates the monorepo with service-specific Python tests, frontend type checking/build/tests, database migration checks, Docker builds, security scanning and production-oriented health/evidence workflows.

Production is hosted on Railway. The public frontend and Gateway route traffic to private application services using Railway private DNS.

Useful operational documentation:

- [`DEPLOYMENT.md`](./DEPLOYMENT.md) — Railway/GitHub deployment configuration.
- [`PRODUCTION_RUNBOOK.md`](./PRODUCTION_RUNBOOK.md) — production health checks, recovery, rollback and incident handling.
- [`faculty-submission/`](./faculty-submission/) — current faculty submission implementation/evidence index.

## Faculty submission

The repository includes an updated faculty-submission record documenting the production architecture and implementation evolution, including persistent parking, reservations, payments, historical reporting, operational parking sessions and automatic billing reconciliation.

See:

- [`faculty-submission/IMPLEMENTATION-UPDATE-2026-08-30.md`](./faculty-submission/IMPLEMENTATION-UPDATE-2026-08-30.md)
- [`faculty-submission/SUBMISSION-MANIFEST.md`](./faculty-submission/SUBMISSION-MANIFEST.md)

## Security

Never commit `.env` files, provider secrets, JWT secrets, database passwords, Stripe secret keys, Railway tokens, Firebase service-account JSON, SMTP/Twilio credentials or other production credentials.

Only example/template environment files belong in Git. Backend/database services should remain private, and browser/mobile clients should communicate through the public API Gateway rather than private Railway domains.

## Repository

GitHub: `kadedipe/ParkingManagementSystem`

Production frontend: [https://frontend-production-fcc8.up.railway.app](https://frontend-production-fcc8.up.railway.app)
