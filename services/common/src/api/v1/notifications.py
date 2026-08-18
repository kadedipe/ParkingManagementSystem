from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

router = APIRouter(prefix="/notifications", tags=["notifications"])

class NotificationCreate(BaseModel):
    user_id: UUID
    type: str
    title: str
    content: str

class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    type: str
    title: str
    content: str
    status: str
    created_at: datetime

# In-memory storage
notifications = {}

@router.post("/", response_model=NotificationResponse, status_code=201)
async def create_notification(notification: NotificationCreate):
    from uuid import uuid4
    notification_id = uuid4()
    now = datetime.now()
    
    new_notification = {
        "id": notification_id,
        "user_id": notification.user_id,
        "type": notification.type,
        "title": notification.title,
        "content": notification.content,
        "status": "pending",
        "created_at": now
    }
    notifications[str(notification_id)] = new_notification
    return new_notification

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications():
    return list(notifications.values())

@router.get("/user/{user_id}", response_model=List[NotificationResponse])
async def get_user_notifications(user_id: UUID):
    user_notifications = [
        n for n in notifications.values() 
        if n["user_id"] == user_id
    ]
    return user_notifications

@router.post("/{notification_id}/read")
async def mark_as_read(notification_id: UUID):
    notification = notifications.get(str(notification_id))
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification["status"] = "read"
    return {"message": "Notification marked as read"}
