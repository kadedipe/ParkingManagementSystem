# Notification Service

FastAPI microservice for durable in-app notifications and user notification preferences.

## API

- `GET /health`
- `GET /ready`
- `GET /v1/notifications`
- `GET /v1/notifications/{id}`
- `POST /v1/notifications/send`
- `POST /v1/notifications/{id}/read`
- `POST /v1/notifications/read-all`
- `DELETE /v1/notifications/{id}`
- `DELETE /v1/notifications/clear`
- `GET /v1/notifications/unread-count`
- `GET /v1/notifications/preferences`
- `PUT /v1/notifications/preferences`
- `PATCH /v1/notifications/preferences/{key}`

The service validates the same JWT used by the parking service and scopes notification records to the authenticated `user_id`.

## Production

Run `alembic upgrade head` as the Railway pre-deploy command. Configure SMTP credentials if email delivery is enabled. In-app notifications remain durable in PostgreSQL regardless of external delivery provider configuration.
