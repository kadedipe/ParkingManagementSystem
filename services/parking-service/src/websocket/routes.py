from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from src.websocket.manager import manager
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["websocket"])

@router.websocket("/parking/{parking_lot_id}")
async def websocket_endpoint(websocket: WebSocket, parking_lot_id: str):
    await manager.connect(websocket, parking_lot_id)
    try:
        while True:
            # Wait for messages from client
            data = await websocket.receive_text()
            logger.info(f"Received message: {data}")
            
            # Echo back for now - you can implement more logic here
            await websocket.send_text(f"Message received: {data}")
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, parking_lot_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, parking_lot_id)

@router.websocket("/global")
async def global_websocket(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"Global message: {data}")
            await websocket.send_text(f"Global message received: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)