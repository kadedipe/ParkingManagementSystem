from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

router = APIRouter(prefix="/audit", tags=["audit"])

class AuditLogCreate(BaseModel):
    user_id: Optional[UUID]
    action: str
    resource: str
    resource_id: Optional[str]
    details: Optional[dict]
    ip_address: Optional[str]
    user_agent: Optional[str]

class AuditLogResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    action: str
    resource: str
    resource_id: Optional[str]
    details: Optional[dict]
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime

# In-memory storage
audit_logs = {}

@router.post("/", response_model=AuditLogResponse, status_code=201)
async def create_audit_log(log: AuditLogCreate):
    from uuid import uuid4
    log_id = uuid4()
    now = datetime.now()
    
    new_log = {
        "id": log_id,
        "user_id": log.user_id,
        "action": log.action,
        "resource": log.resource,
        "resource_id": log.resource_id,
        "details": log.details,
        "ip_address": log.ip_address,
        "user_agent": log.user_agent,
        "created_at": now
    }
    audit_logs[str(log_id)] = new_log
    return new_log

@router.get("/", response_model=List[AuditLogResponse])
async def get_audit_logs():
    return list(audit_logs.values())

@router.get("/user/{user_id}", response_model=List[AuditLogResponse])
async def get_user_audit_logs(user_id: UUID):
    user_logs = [
        log for log in audit_logs.values() 
        if log["user_id"] == user_id
    ]
    return user_logs

@router.get("/resource/{resource}")
async def get_resource_audit_logs(resource: str):
    resource_logs = [
        log for log in audit_logs.values() 
        if log["resource"] == resource
    ]
    return resource_logs
