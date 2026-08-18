from __future__ import annotations
import os
from contextlib import asynccontextmanager
import httpx
from fastapi import FastAPI,Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response,JSONResponse

SERVICE_MAP={
 "auth":"parking","parking-lots":"parking","parking-spots":"parking","reservations":"parking",
 "vehicles":"vehicle","notifications":"notification","charging-stations":"charging","charging-sessions":"charging",
}
URLS={k:os.getenv(k.upper()+"_SERVICE_URL",v) for k,v in {"parking":"http://parking-service:8080","vehicle":"http://vehicle-service:8080","notification":"http://notification-service:8080","charging":"http://charging-service:8080"}.items()}
CORS=[x.strip() for x in os.getenv("CORS_ORIGINS","http://localhost:5173").split(",") if x.strip()]
client: httpx.AsyncClient|None=None
@asynccontextmanager
async def lifespan(app):
 global client; client=httpx.AsyncClient(timeout=httpx.Timeout(30.0,connect=5.0),follow_redirects=False); yield; await client.aclose()
app=FastAPI(title="Parking API Gateway",version="2.1.0",lifespan=lifespan)
app.add_middleware(CORSMiddleware,allow_origins=CORS,allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
@app.get("/health")
async def health(): return {"status":"healthy","service":"api-gateway"}
@app.get("/ready")
async def ready(): return {"status":"ready","services":list(URLS)}

def resolve(path:str):
    parts=path.strip("/").split("/"); first=parts[0] if parts else ""
    if first=="v1" and len(parts)>1: first=parts[1]; rest=parts[2:]
    else: rest=parts[1:]
    service=SERVICE_MAP.get(first)
    if not service: return None
    prefix="/v1/"+first
    # parking route names match directly; auth maps to /v1/auth.
    target=prefix+(("/"+"/".join(rest)) if rest else "")
    if service=="charging": target="/v1/"+first+(("/"+"/".join(rest)) if rest else "")
    return URLS[service]+target

@app.api_route("/{path:path}",methods=["GET","POST","PUT","PATCH","DELETE","OPTIONS","HEAD"])
async def proxy(path:str,request:Request):
    if path in ("health","ready"): return JSONResponse({"status":"ok"})
    target=resolve(path)
    if not target: return JSONResponse({"error":"route_not_found"},status_code=404)
    assert client is not None
    headers={k:v for k,v in request.headers.items() if k.lower() not in {"host","content-length"}}
    try:
        upstream=await client.request(request.method,target,headers=headers,content=await request.body(),params=request.query_params)
        excluded={"content-length","transfer-encoding","connection","content-encoding"}
        out_headers={k:v for k,v in upstream.headers.items() if k.lower() not in excluded}
        return Response(upstream.content,status_code=upstream.status_code,headers=out_headers,media_type=upstream.headers.get("content-type"))
    except httpx.TimeoutException: return JSONResponse({"error":"upstream_timeout"},status_code=504)
    except httpx.HTTPError: return JSONResponse({"error":"upstream_unavailable"},status_code=503)
