import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/ws",
    tags=["websocket"],
)

@router.websocket("/charging")
async def charging_websocket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            message = await websocket.receive_text()
            logger.info("WebSocket message received: %s", message)
            await websocket.send_text(message)
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")