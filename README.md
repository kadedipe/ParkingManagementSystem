# Parking Management System

Production-oriented parking management platform organized as a monorepo for GitHub + Railway, with a React web client, React Native mobile app, API gateway, and independently deployable backend services.

## Architecture

```text
                    ┌───────────────────────┐
                    │   React Web Frontend   │
                    │       /frontend        │
                    └───────────┬───────────┘
                                │ HTTPS
                    ┌───────────▼───────────┐
                    │      API Gateway      │
                    │ /services/gateway-*   │
                    └───────────┬───────────┘
                                │ Railway private network
          ┌─────────────────────┼────────────────────────┐
          ▼                     ▼                        ▼
 ┌────────────────┐   ┌────────────────┐      ┌────────────────────┐
 │ Parking Service│   │ Vehicle Service│      │Notification Service│
 │ auth/lots/book │   │ user vehicles │      │ in-app/preferences │
 └───────┬────────┘   └───────┬────────┘      └──────────┬─────────┘
         │                    │                          │
         └────────────────────┼──────────────────────────┘
                              ▼
                    ┌────────────────────┐
                    │ Railway PostgreSQL │
                    └────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Railway Redis   │
                    └───────────────────┘

       ┌──────────────────────────────┐
       │ Charging Service + OCPP/EV  │
       │ /services/charging-service  │
       └──────────────────────────────┘

       ┌──────────────────────────────┐
       │ React Native / Expo mobile   │
       │            /mobile           │
       └──────────────────────────────┘
```

## Deployable services

| Service | Directory | Runtime | Public |
|---|---|---|---|
| API Gateway | `services/gateway-service` | FastAPI | Yes |
| Parking | `services/parking-service` | FastAPI | No |
| Vehicle | `services/vehicle-service` | FastAPI | No |
| Notifications | `services/notification-service` | FastAPI | No |
| Charging | `services/charging-service` | FastAPI | No |
| Web | `frontend` | Vite + Nginx | Yes |
| Mobile | `mobile` | React Native / Expo | App stores, not Railway |

`backend/`, `apps/`, and `services/common/` are retained as legacy/experimental code and are not part of the production Railway request path.

## Important production fixes included

- Portable UUID type for the parking service so SQLite tests and PostgreSQL production use the same ORM models.
- Corrected SQLAlchemy relationship registration for users, reservations, reviews and payments.
- Added missing parking-spot and reservation routers to API v1.
- Added real parking database baseline migration instead of an empty initial migration.
- Corrected Alembic to use a synchronous PostgreSQL driver URL for migrations.
- Replaced the incomplete Vehicle NestJS skeleton with a coherent FastAPI service with PostgreSQL-ready models, JWT validation, CRUD, soft deletion and CSV export.
- Replaced the incomplete Notification NestJS skeleton with a coherent FastAPI service with durable in-app notifications and preference management.
- Added Alembic migrations for vehicle and notification databases/tables.
- Added Railway healthchecks, restart policies and pre-deploy migration commands.
- Added a gateway that provides one browser/mobile API surface and routes to private services.
- Added Railway-compatible `$PORT` handling to containers.
- Added production frontend Docker/Nginx configuration.
- Added mobile environment configuration and EAS build profiles.
- Replaced the old CI assumptions with monorepo service-specific Python and frontend checks.
- Removed runtime artifacts, local databases, caches, `node_modules`, and `.env` files from the production deliverable.

## Local development

### Python services

Each Python service can be run independently. For example:

```bash
cd services/parking-service
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.dev.txt
ENVIRONMENT=test pytest -q
```

For production-like local infrastructure, use PostgreSQL and Redis rather than SQLite.

### Web

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

## Production deployment

Read [`DEPLOYMENT.md`](./DEPLOYMENT.md) for deployment configuration and [`PRODUCTION_RUNBOOK.md`](./PRODUCTION_RUNBOOK.md) for health checks, alerts, backup recovery, rollback, and incident procedures.

## Security

Never commit `.env`, provider secrets, JWT secrets, database passwords, Stripe secret keys, Firebase service-account JSON, or SMTP/Twilio credentials. Only `.env.example` files belong in Git.