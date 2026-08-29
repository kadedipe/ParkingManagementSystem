from __future__ import annotations

import os
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

SERVICE_MAP = {
    "auth": "parking",
    "parking-lots": "parking",
    "parking-spots": "parking",
    "parking-sessions": "parking",
    "reservations": "parking",
    "payments": "parking",
    "reports": "parking",
    "vehicles": "vehicle",
    "notifications": "notification",
    "charging-stations": "charging",
    "charging-sessions": "charging",
}

LEGACY_PARKING_ALIASES = {
    "lots": "parking-lots",
    "spots": "parking-spots",
    "sessions": "parking-sessions",
    "reservations": "reservations",
    "payments": "payments",
    "reports": "reports",
}

DEFAULT_URLS = {
    "parking": "http://parking-service:8080",
    "vehicle": "http://vehicle-service:8080",
    "notification": "http://notification-service:8080",
    "charging": "http://charging-service:8080",
}
URLS = {k: os.getenv(f"{k.upper()}_SERVICE_URL", v) for k, v in DEFAULT_URLS.items()}
DEFAULT_CORS_ORIGINS = (
    "http://localhost:5173,"
    "https://frontend-production-fcc8.up.railway.app"
)
CORS = [origin.strip() for origin in os.getenv("CORS_ORIGINS", DEFAULT_CORS_ORIGINS).split(",") if origin.strip()]

client: httpx.AsyncClient | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global client
    client = httpx.AsyncClient(timeout=httpx.Timeout(20.0, connect=3.0), follow_redirects=False)
    yield
    await client.aclose()


app = FastAPI(title="Parking API Gateway", version="2.3.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=CORS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.get("/", tags=["meta"])
async def root():
    return {"status": "healthy", "service": "api-gateway", "version": app.version, "health": "/health", "readiness": "/ready", "documentation": "/docs"}


@app.get("/health", tags=["health"])
async def health():
    return {"status": "healthy", "service": "api-gateway"}


@app.get("/ready", tags=["health"])
async def ready():
    assert client is not None
    results: dict[str, str] = {}
    for service, base_url in URLS.items():
        try:
            response = await client.get(f"{base_url.rstrip('/')}/health")
            results[service] = "healthy" if response.status_code == 200 else f"http_{response.status_code}"
        except httpx.HTTPError:
            results[service] = "unavailable"
    ready_state = all(value == "healthy" for value in results.values())
    body = {"status": "ready" if ready_state else "not_ready", "services": results}
    return JSONResponse(body, status_code=200 if ready_state else 503)


def resolve(path: str):
    trailing_slash = path.endswith("/")
    parts = path.strip("/").split("/")
    first = parts[0] if parts else ""
    if first == "v1" and len(parts) > 1:
        first, rest = parts[1], parts[2:]
    else:
        rest = parts[1:]
    if first == "parking" and rest:
        canonical = LEGACY_PARKING_ALIASES.get(rest[0])
        if canonical:
            first, rest = canonical, rest[1:]
    service = SERVICE_MAP.get(first)
    if not service:
        return None
    target = f"/v1/{first}" + (("/" + "/".join(rest)) if rest else "")
    if trailing_slash and not target.endswith("/"):
        target += "/"
    return URLS[service].rstrip("/") + target


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def proxy(path: str, request: Request):
    if path == "health":
        return JSONResponse({"status": "healthy", "service": "api-gateway"})
    if path == "ready":
        return await ready()
    target = resolve(path)
    if not target:
        return JSONResponse({"error": "route_not_found"}, status_code=404)
    assert client is not None
    headers = {k: v for k, v in request.headers.items() if k.lower() not in {"host", "content-length"}}
    try:
        upstream = await client.request(request.method, target, headers=headers, content=await request.body(), params=request.query_params)
        excluded = {"content-length", "transfer-encoding", "connection", "content-encoding"}
        out_headers = {k: v for k, v in upstream.headers.items() if k.lower() not in excluded}
        return Response(upstream.content, status_code=upstream.status_code, headers=out_headers, media_type=upstream.headers.get("content-type"))
    except httpx.TimeoutException:
        return JSONResponse({"error": "upstream_timeout"}, status_code=504)
    except httpx.HTTPError:
        return JSONResponse({"error": "upstream_unavailable"}, status_code=503)
