# Production Deployment: Railway + GitHub

This repository is a monorepo. Each deployable application is a separate Railway service sourced from the same GitHub repository.

## Services

| Railway service | Repository directory | Port | Public? | Purpose |
|---|---|---:|---|---|
| `api-gateway` | `services/gateway-service` | `$PORT` (default 8080) | Yes | Single public API entry point |
| `parking-service` | `services/parking-service` | `8080` | No | Auth, lots, spots, reservations, payments |
| `vehicle-service` | `services/vehicle-service` | `8080` | No | User vehicles |
| `notification-service` | `services/notification-service` | `8080` | No | In-app notifications/preferences |
| `charging-service` | `services/charging-service` | `8080` | No | EV charging/OCPP |
| `parking-frontend` | `frontend` | `$PORT` | Yes | React/Vite web app |
| PostgreSQL | Railway managed | — | No | Primary database |
| Redis | Railway managed | — | No | Cache/queue infrastructure |

The mobile application in `mobile/` is built and distributed with Expo/React Native tooling; it is not a Railway web service.

## Railway setup

1. Push this repository to GitHub.
2. Create a Railway project and connect the GitHub repository.
3. Create PostgreSQL and Redis resources.
4. Create one service per deployable directory above. Set each service's **Root Directory** to the listed directory. Railway supports monorepos and per-service source/build/start configuration.
5. Keep only `api-gateway` and `parking-frontend` public. Use Railway private DNS for service-to-service traffic.
6. Generate a domain for the gateway and frontend.
7. Set the frontend `VITE_API_URL` to the gateway public URL.
8. Set the gateway service URL variables to the private Railway domains, for example `http://parking-service.railway.internal:8080`.
9. Configure a strong `JWT_SECRET` (the same value in parking, vehicle and notification services).
10. Set `DATABASE_URL` for parking/vehicle/notification to the Railway Postgres connection string.
11. Run migrations before enabling production traffic. The current parking service contains existing Alembic history; vehicle and notification can initially use their controlled schema bootstrap, then be migrated to dedicated Alembic revisions before zero-downtime schema changes.
12. Configure SMTP/provider credentials for notification delivery when external notifications are enabled.

## Production rules

- Never commit `.env` files or provider credentials.
- Never expose PostgreSQL or Redis publicly.
- Do not use `AUTO_CREATE_TABLES=true` in production for parking.
- Use `/health` for Railway healthchecks and `/ready` for operational readiness.
- Use Railway reference variables for inter-service configuration rather than hard-coded public URLs.
- Keep the gateway as the browser/mobile API boundary.
- The browser/mobile clients must never use Railway private domains.

## GitHub

Recommended branch flow: `main` -> production, `develop` -> staging, feature branches -> pull requests.

The repository should run tests and builds in GitHub Actions before merging to `main`; Railway then deploys the affected service(s) from the connected branch.

## Recommended Railway variables

Use Railway reference variables instead of copying connection strings. Railway supports `${{ServiceName.VARIABLE_NAME}}` references and private service DNS such as `service-name.railway.internal`.

### PostgreSQL

Create one Railway PostgreSQL service named `Postgres` and expose its `DATABASE_URL` as a reference variable:

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### Redis

Create one Railway Redis service named `Redis` and use:

```text
REDIS_URL=${{Redis.REDIS_URL}}
```

### Shared JWT

Create a project shared variable:

```text
JWT_SECRET=<strong-random-secret>
JWT_ALGORITHM=HS256
```

Share those variables with `parking-service`, `vehicle-service`, and `notification-service`.

### Service ports

Set `PORT=8080` for the private Python services and gateway. Railway supplies a `$PORT`, and the containers in this repository also accept that value. The gateway's private references should use port `8080`. Railway private networking uses HTTP and the service's listening port.

### Gateway

```text
PORT=8080
CORS_ORIGINS=https://<frontend-domain>
PARKING_SERVICE_URL=http://parking-service.railway.internal:8080
VEHICLE_SERVICE_URL=http://vehicle-service.railway.internal:8080
NOTIFICATION_SERVICE_URL=http://notification-service.railway.internal:8080
CHARGING_SERVICE_URL=http://charging-service.railway.internal:8080
```

### Frontend

`VITE_API_URL` is a **build-time** variable for Vite, so set it to the public gateway domain and redeploy the frontend whenever it changes. Railway documents that frontend build variables are baked into the generated client bundle.

```text
VITE_API_URL=https://<gateway-domain>
VITE_WS_URL=wss://<gateway-domain>/ws
VITE_ENVIRONMENT=production
```

## Migrations

The parking, vehicle and notification services have `alembic upgrade head` as their Railway pre-deploy command. Railway runs pre-deploy commands between build and deployment and aborts the deployment if the command fails.

Because Railway monorepo services can have independent root directories, configure each service's absolute config-as-code path in Railway if the dashboard does not automatically discover the service-level `railway.json` (for example `/services/vehicle-service/railway.json`). Railway's monorepo documentation explicitly notes that the config file path does not follow the service root-directory setting.
