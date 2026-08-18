from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
from src.core.database import init_db, close_db
from src.api.routes import router

@asynccontextmanager
async def lifespan(app):
    if settings.ENVIRONMENT != "production": await init_db()
    yield
    await close_db()

app=FastAPI(title="Vehicle Service",version=settings.VERSION,docs_url="/docs" if settings.DOCS_ENABLED else None,redoc_url="/redoc" if settings.DOCS_ENABLED else None,lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.CORS_ORIGINS, allow_credentials=True, allow_methods=["GET","POST","PUT","DELETE","OPTIONS"], allow_headers=["Authorization","Content-Type"])
app.include_router(router)
@app.get("/health", tags=["health"])
async def health(): return {"status":"healthy","service":settings.SERVICE_NAME,"version":settings.VERSION}
@app.get("/ready", tags=["health"])
async def ready():
    from sqlalchemy import text
    from src.core.database import engine
    try:
        async with engine.connect() as c: await c.execute(text("SELECT 1"))
        return {"status":"ready","service":settings.SERVICE_NAME}
    except Exception: return {"status":"not_ready"}
