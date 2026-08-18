from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from src.websocket.manager import manager
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["websocket"])

@router.websocket("/notifications/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"Received message from user {user_id}: {data}")
            await manager.send_to_user(user_id, {
                "type": "echo",
                "data": data
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        logger.info(f"WebSocket disconnected for user: {user_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, user_id)