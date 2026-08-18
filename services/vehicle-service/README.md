# Vehicle Service

FastAPI microservice responsible for user-owned vehicles.

## API

- `GET /health`
- `GET /ready`
- `GET /v1/vehicles`
- `POST /v1/vehicles`
- `GET /v1/vehicles/{id}`
- `PUT /v1/vehicles/{id}`
- `DELETE /v1/vehicles/{id}` (soft delete)
- `GET /v1/vehicles/export?format=csv`

All vehicle endpoints require the same JWT issued by the parking service. The service validates the JWT signature and scopes every record to `user_id` from the token.

## Production

Run `alembic upgrade head` as the Railway pre-deploy command. Do not enable `create_all` in production.
