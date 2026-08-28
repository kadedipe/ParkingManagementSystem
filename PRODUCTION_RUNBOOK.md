# ParkingManagementSystem Production Runbook

Last validated: 2026-08-28  
Platform: Railway  
Project ID: `4f5cbf82-9b5b-45a6-b7f3-3fcf01b6e9fc`  
Environment: `production`

## Release status

The production release closure and scheduled health monitor pass. The six application services have successful serving deployments, the public frontend and API Gateway respond successfully, and the Gateway reports every private backend healthy.

One recovery gate remains open: the Postgres volume has no native backup or backup schedule. See [Database recovery](#database-recovery).

## Production topology

| Role | Railway service | Exposure | Health path |
|---|---|---|---|
| Web frontend | `frontend` | Public | `/healthz` |
| API entry point | `API Gateway` | Public | `/health`, `/ready` |
| Authentication and parking | `Parking` | Private | `/health` |
| User vehicles | `Vehicle` | Private | `/health` |
| Notifications | `notification` | Private | `/health` |
| EV charging | `Charging` | Private | `/health` |
| System of record | `Postgres` | Private | Railway database health |
| Cache and ephemeral events | `Redis` | Private | Railway database health |

The API Gateway reaches backend services through `.railway.internal` private DNS. Do not expose Parking, Vehicle, Notification, Charging, Postgres, or Redis publicly.

## Public URLs

- Frontend: https://frontend-production-fcc8.up.railway.app
- API Gateway: https://api-gateway-production-3a40.up.railway.app
- Frontend health: https://frontend-production-fcc8.up.railway.app/healthz
- Gateway health: https://api-gateway-production-3a40.up.railway.app/health
- Full backend readiness: https://api-gateway-production-3a40.up.railway.app/ready

## Monitoring and alerts

### Automated controls

- `Production Health Monitor` runs every 15 minutes.
- Each public health endpoint is attempted three times, 20 seconds apart.
- It verifies frontend health, Gateway health, backend readiness, successful serving deployments, and fatal runtime-log signatures.
- The ChatGPT `Production Health Watch` provides a secondary hourly condition check.
- `Production Recovery Audit` runs monthly and verifies native backups, volumes, and rollback candidates.

### Escalation thresholds

| Severity | Trigger | Required response |
|---|---|---|
| P1 | Gateway `/ready` fails after three attempts; any backend reports unhealthy; no successful serving deployment; crash, panic, traceback, unhandled exception, segmentation fault, or out-of-memory signature | Acknowledge immediately, freeze deployments, inspect the affected service logs, and roll back if correlated with a release |
| P2 | Frontend `/healthz` fails while Gateway remains healthy; repeated 5xx responses; resource utilization above 85% for 10 minutes; repeated restarts | Investigate within 30 minutes and scale or redeploy as evidence indicates |
| P3 | One transient health failure that recovers on retry; elevated latency without errors; non-fatal warnings | Review during the same business day |

Railway email/in-app notifications and resource alerts should be enabled for crashes, failed deployments, restarts, volume capacity, CPU above 85%, and RAM above 85%. These dashboard-level alert settings require an authenticated Railway owner session.

## Standard incident procedure

1. Confirm scope using the frontend health, Gateway health, and `/ready` endpoints.
2. Open the latest `Production Health Monitor` run and identify the failed gate.
3. Check the affected Railway service's deployment status and runtime logs.
4. Freeze new deployments while P1 diagnosis is active.
5. If the incident began immediately after a release, use the retained rollback candidate for that service.
6. If code is healthy but the process is stuck, restart the current deployment.
7. If a build artifact is damaged, redeploy the current known-good source.
8. After recovery, rerun `Production Authenticated E2E Smoke`, `Production Release Closure`, and `Production Recovery Audit`.
9. Record the timeline, root cause, corrective action, and prevention item.

## Railway recovery actions

Use the least disruptive action that matches the failure:

- **Restart**: same image and configuration; use for a stuck process or transient runtime failure.
- **Redeploy**: rebuild the selected source revision; use for a damaged or missing build.
- **Rollback**: restore a retained previous deployment image, variables, and settings; use for a bad release.

Railway only permits rollback when the target deployment reports `canRollback: true`. See the [Railway deployment actions documentation](https://docs.railway.com/deployments/deployment-actions).

## Validated rollback candidates

The recovery audit confirmed retained rollback-capable deployments for every application service. These IDs are evidence from the validation run and may change as Railway retention advances.

| Role | Railway service | Validated rollback candidate |
|---|---|---|
| Frontend | `frontend` | `96d9ed3e-0206-4a07-84f9-de614e73d35a` |
| Gateway | `API Gateway` | `d5356d11-6881-4abc-b5bd-c415c14d3de3` |
| Parking | `Parking` | `c16839c8-1323-4dea-a04d-550c8bf4295e` |
| Vehicle | `Vehicle` | `c99b834c-8e1f-4f90-9261-a806e77efbf9` |
| Notification | `notification` | `ff56f0d8-9fd2-4e1d-9613-25ea31413e32` |
| Charging | `Charging` | `3f4e9c9f-8c6d-4e3d-98e8-0a124c100155` |

### Rollback procedure

1. Open the affected service in Railway and select **Deployments**.
2. Select the most recent known-good deployment with `canRollback: true`.
3. Review the source revision and timestamp.
4. Choose **Rollback** and confirm.
5. Wait for the Railway health gate.
6. Validate the public Gateway `/health` and `/ready` endpoints.
7. Rerun authenticated production E2E.
8. If the rollback fails, redeploy the last known-good Git commit using the service-specific Railway workflow.

Do not perform routine live rollbacks as tests. The API capability and retained candidates are tested non-destructively; an actual rollback changes production traffic.

## Database recovery

### Postgres

Postgres is the authoritative data store and has a private-only connection, which prevents external runners from connecting directly. The Railway volume is `postgres-volume`.

Current recovery audit:

- Native volume backup: **missing**
- Scheduled backup: **not configured**
- Restore mechanism: Railway staged same-project/environment volume restore
- Restore was not executed against production because it changes the mounted volume and redeploys Postgres

Required configuration:

1. Open the Postgres service in Railway.
2. Open **Backups**.
3. Create one manual backup.
4. Enable **Daily** backups (kept six days).
5. Enable **Weekly** backups (kept one month).
6. For stronger recovery objectives, enable Postgres point-in-time recovery.
7. Rerun `Production Recovery Audit`.

Railway stages volume restores for review before deployment. Follow the [Railway backup documentation](https://docs.railway.com/volumes/backups) and [Postgres backup and restore guide](https://docs.railway.com/guides/postgres-backups-restores).

Recommended objectives:

- RPO: 24 hours with daily snapshots; reduce to minutes after PITR is enabled.
- RTO: 60 minutes until a timed restore drill proves a lower value.

### Redis

Redis uses `redis-volume`, but the production code treats it primarily as TTL cache/session acceleration. PostgreSQL remains authoritative. Redis Pub/Sub is non-durable by design and must not be treated as guaranteed message delivery.

Recovery expectations:

- Redis loss may cause cold-cache latency, session/cache resets, and lost in-flight Pub/Sub messages.
- It must not cause loss of authoritative parking, vehicle, notification, or charging records.
- Restore Redis only if preserving cache/session state is operationally valuable; otherwise restart with an empty cache and allow the application to repopulate it.
- If guaranteed event delivery becomes required, replace Pub/Sub with a durable queue or outbox pattern.

## Deployment validation

After any production change, require:

1. Service-specific Railway deployment workflow succeeds.
2. Service health check succeeds.
3. Gateway `/health` returns HTTP 200.
4. Gateway `/ready` returns HTTP 200 with Parking, Vehicle, Notification, and Charging healthy.
5. Authenticated E2E registration, identity, Vehicle CRUD, Notification, and Charging checks pass.
6. Production fatal-log scan passes.
7. Frontend `/healthz` and root page return HTTP 200.

## CI/CD ownership

Railway production deployments are managed by the service-specific `railway-*.yml` workflows.

The legacy AWS/Kubernetes workflow is retained as **manual-only** and must not be used for Railway production. The temporary duplicate-service deletion workflow has been removed.

## Useful workflows

- `Production Health Monitor`: continuous service and fatal-log gate
- `Production Recovery Audit`: backup and rollback readiness
- `Production Authenticated E2E Smoke`: authenticated user journey
- `Production Release Closure`: complete release audit
- `Railway Production Readiness Audit`: Gateway upstream health
- Service-specific Railway deployment workflows: controlled deployment and health gates

## Security rules

- Never print or copy `RAILWAY_TOKEN`, database URLs, Redis URLs, JWT secrets, or rendered private service variables into logs.
- Keep backend and database services private.
- Rotate a secret immediately if it appears in Git history, workflow logs, screenshots, or support tickets.
- Require a production health gate after every secret rotation.
