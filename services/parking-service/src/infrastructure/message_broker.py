# ============================================================================
# Infrastructure - Message Broker for Event Publishing
# ============================================================================

# parking-management-system/services/parking-service/src/infrastructure/message_broker.py

import json
from typing import Dict, Any, Optional
from redis.asyncio import Redis

from src.core.config import settings
from src.core.logging import get_logger

logger = get_logger(__name__)

class MessageBroker:
    """Message broker for publishing and consuming events"""
    
    def __init__(self, redis_client: Redis):
        self.redis = redis_client
        self.channel_prefix = "events"
    
    async def publish(
        self,
        event_type: str,
        payload: Dict[str, Any],
        correlation_id: Optional[str] = None,
    ) -> bool:
        """Publish an event to the message broker"""
        try:
            message = {
                "event_type": event_type,
                "payload": payload,
                "timestamp": datetime.utcnow().isoformat(),
                "correlation_id": correlation_id,
                "service": settings.SERVICE_NAME,
            }
            
            channel = f"{self.channel_prefix}:{event_type}"
            await self.redis.publish(
                channel,
                json.dumps(message, default=str),
            )
            logger.info(f"Published event: {event_type}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to publish event: {str(e)}")
            return False
    
    async def subscribe(
        self,
        event_type: str,
        callback,
    ) -> None:
        """Subscribe to an event type"""
        channel = f"{self.channel_prefix}:{event_type}"
        pubsub = self.redis.pubsub()
        await pubsub.subscribe(channel)
        
        async for message in pubsub.listen():
            if message["type"] == "message":
                try:
                    data = json.loads(message["data"])
                    await callback(data)
                except Exception as e:
                    logger.error(f"Error processing message: {str(e)}")
    
    async def publish_parking_lot_created(
        self,
        lot_id: str,
        name: str,
        total_spots: int,
        user_id: str,
    ) -> bool:
        """Publish parking lot created event"""
        return await self.publish(
            "parking_lot_created",
            {
                "lot_id": lot_id,
                "name": name,
                "total_spots": total_spots,
                "created_by": user_id,
            },
            correlation_id=lot_id,
        )
    
    async def publish_parking_spot_allocated(
        self,
        spot_id: str,
        parking_lot_id: str,
        vehicle_id: str,
        vehicle_plate: str,
    ) -> bool:
        """Publish parking spot allocated event"""
        return await self.publish(
            "parking_spot_allocated",
            {
                "spot_id": spot_id,
                "parking_lot_id": parking_lot_id,
                "vehicle_id": vehicle_id,
                "vehicle_plate": vehicle_plate,
            },
            correlation_id=spot_id,
        )
    
    async def publish_parking_spot_released(
        self,
        spot_id: str,
        parking_lot_id: str,
        vehicle_id: str,
        vehicle_plate: str,
    ) -> bool:
        """Publish parking spot released event"""
        return await self.publish(
            "parking_spot_released",
            {
                "spot_id": spot_id,
                "parking_lot_id": parking_lot_id,
                "vehicle_id": vehicle_id,
                "vehicle_plate": vehicle_plate,
            },
            correlation_id=spot_id,
        )

class EventHandler:
    """Event handler for processing events"""
    
    def __init__(self, message_broker: MessageBroker):
        self.message_broker = message_broker
    
    async def handle_parking_lot_created(self, event_data: Dict[str, Any]) -> None:
        """Handle parking lot created event"""
        logger.info(f"Handling parking lot created: {event_data['lot_id']}")
        # Process event (e.g., send notifications, update analytics, etc.)
    
    async def handle_parking_spot_allocated(self, event_data: Dict[str, Any]) -> None:
        """Handle parking spot allocated event"""
        logger.info(f"Handling parking spot allocated: {event_data['spot_id']}")
        # Process event (e.g., update occupancy, notify user, etc.)
    
    async def handle_parking_spot_released(self, event_data: Dict[str, Any]) -> None:
        """Handle parking spot released event"""
        logger.info(f"Handling parking spot released: {event_data['spot_id']}")
        # Process event (e.g., update availability, calculate charges, etc.)
    
    async def start_listening(self) -> None:
        """Start listening for events"""
        await self.message_broker.subscribe(
            "parking_lot_created",
            self.handle_parking_lot_created,
        )
        await self.message_broker.subscribe(
            "parking_spot_allocated",
            self.handle_parking_spot_allocated,
        )
        await self.message_broker.subscribe(
            "parking_spot_released",
            self.handle_parking_spot_released,
        )