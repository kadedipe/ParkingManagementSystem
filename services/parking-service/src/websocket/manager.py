from typing import Dict, List, Set
from fastapi import WebSocket
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, parking_lot_id: str = None):
        await websocket.accept()
        if parking_lot_id:
            if parking_lot_id not in self.active_connections:
                self.active_connections[parking_lot_id] = []
            self.active_connections[parking_lot_id].append(websocket)
        logger.info(f"WebSocket connected for parking lot: {parking_lot_id}")
    
    def disconnect(self, websocket: WebSocket, parking_lot_id: str = None):
        if parking_lot_id and parking_lot_id in self.active_connections:
            if websocket in self.active_connections[parking_lot_id]:
                self.active_connections[parking_lot_id].remove(websocket)
            if not self.active_connections[parking_lot_id]:
                del self.active_connections[parking_lot_id]
    
    async def broadcast_availability(self, parking_lot_id: str, data: dict):
        if parking_lot_id in self.active_connections:
            message = json.dumps({
                "type": "availability_update",
                "parking_lot_id": parking_lot_id,
                "data": data
            })
            for connection in self.active_connections[parking_lot_id]:
                try:
                    await connection.send_text(message)
                except Exception as e:
                    logger.error(f"Error sending WebSocket message: {e}")

manager = ConnectionManager()