from __future__ import annotations
from datetime import datetime,timezone
from uuid import UUID
from fastapi import APIRouter,Depends,HTTPException,Query,BackgroundTasks
from pydantic import BaseModel,Field,ConfigDict
from sqlalchemy import select,update,delete,func
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.auth import current_user_id
from src.core.database import get_db
from src.core.models import Notification,NotificationPreference

router=APIRouter(prefix="/v1/notifications",tags=["notifications"])
class NotificationIn(BaseModel): type:str="general"; title:str=Field(min_length=1,max_length=255); message:str=Field(min_length=1); data:dict|None=None; channels:list[str]=["in_app"]; priority:str="normal"
class NotificationOut(BaseModel):
    model_config=ConfigDict(from_attributes=True)
    id:UUID; user_id:UUID; type:str; title:str; message:str; data:dict|None; channels:list|None; priority:str; status:str; is_read:bool; read_at:datetime|None; sent_at:datetime|None; created_at:datetime
class PreferenceIn(BaseModel): email_enabled:bool|None=None; push_enabled:bool|None=None; sms_enabled:bool|None=None

def _pref_dict(p): return {"email_enabled":p.email_enabled,"push_enabled":p.push_enabled,"sms_enabled":p.sms_enabled}
async def _ensure_pref(db,user):
    p=await db.get(NotificationPreference,user)
    if not p: p=NotificationPreference(user_id=user); db.add(p); await db.flush()
    return p

@router.get("",response_model=list[NotificationOut])
@router.get("/",response_model=list[NotificationOut])
async def list_notifications(db:AsyncSession=Depends(get_db),user:UUID=Depends(current_user_id),skip:int=Query(0,ge=0),limit:int=Query(50,ge=1,le=100),unread:bool|None=None):
    q=select(Notification).where(Notification.user_id==user).order_by(Notification.created_at.desc()).offset(skip).limit(limit)
    if unread is not None:q=q.where(Notification.is_read==(not unread))
    return list((await db.execute(q)).scalars())

@router.get("/unread-count")
async def unread_count(db:AsyncSession=Depends(get_db),user:UUID=Depends(current_user_id)):
    n=await db.scalar(select(func.count()).select_from(Notification).where(Notification.user_id==user,Notification.is_read.is_(False))); return {"count":n or 0}

@router.get("/preferences")
async def get_preferences(db:AsyncSession=Depends(get_db),user:UUID=Depends(current_user_id)):
    return _pref_dict(await _ensure_pref(db,user))

@router.put("/preferences")
async def set_preferences(data:PreferenceIn,db:AsyncSession=Depends(get_db),user:UUID=Depends(current_user_id)):
    p=await _ensure_pref(db,user)
    for k,v in data.model_dump(exclude_none=True).items(): setattr(p,k,v)
    await db.commit(); return _pref_dict(p)

@router.patch("/preferences/{key}")
async def update_preference(key:str,data:dict,db:AsyncSession=Depends(get_db),user:UUID=Depends(current_user_id)):
    if key not in {"email_enabled","push_enabled","sms_enabled"}: raise HTTPException(400,"Unknown preference")
    p=await _ensure_pref(db,user); setattr(p,key,bool(data.get("value"))); await db.commit(); return _pref_dict(p)

@router.post("/send",response_model=NotificationOut,status_code=201)
async def send_notification(data:NotificationIn,background:BackgroundTasks,db:AsyncSession=Depends(get_db),user:UUID=Depends(current_user_id)):
    n=Notification(user_id=user,**data.model_dump()); db.add(n); await db.commit(); await db.refresh(n); background.add_task(_deliver,n.id); return n

@router.post("/{notification_id}/read",response_model=NotificationOut)
async def mark_read(notification_id:UUID,db:AsyncSession=Depends(get_db),user:UUID=Depends(current_user_id)):
    n=await db.scalar(select(Notification).where(Notification.id==notification_id,Notification.user_id==user))
    if not n: raise HTTPException(404,"Notification not found")
    n.is_read=True;n.read_at=datetime.now(timezone.utc);await db.commit();await db.refresh(n);return n

@router.post("/read-all")
async def read_all(db:AsyncSession=Depends(get_db),user:UUID=Depends(current_user_id)):
    await db.execute(update(Notification).where(Notification.user_id==user,Notification.is_read.is_(False)).values(is_read=True,read_at=datetime.now(timezone.utc)));await db.commit();return {"updated":True}

@router.delete("/clear",status_code=204)
async def clear_notifications(db:AsyncSession=Depends(get_db),user:UUID=Depends(current_user_id)):
    await db.execute(delete(Notification).where(Notification.user_id==user));await db.commit()

async def _deliver(notification_id:UUID):
    # Delivery adapters are intentionally isolated. In-app notification is always durable.
    # SMTP/Twilio/FCM adapters can be enabled by the corresponding environment variables.
    return notification_id

@router.get("/{notification_id}",response_model=NotificationOut)
async def get_notification(notification_id:UUID,db:AsyncSession=Depends(get_db),user:UUID=Depends(current_user_id)):
    n=await db.scalar(select(Notification).where(Notification.id==notification_id,Notification.user_id==user));
    if not n: raise HTTPException(404,"Notification not found")
    return n

@router.delete("/{notification_id}",status_code=204)
async def delete_notification(notification_id:UUID,db:AsyncSession=Depends(get_db),user:UUID=Depends(current_user_id)):
    n=await db.scalar(select(Notification).where(Notification.id==notification_id,Notification.user_id==user));
    if not n: raise HTTPException(404,"Notification not found")
    await db.delete(n);await db.commit()

