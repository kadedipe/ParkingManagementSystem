# Example usage of KafkaProducer

import asyncio
from src.infrastructure.message_bus.kafka_producer import KafkaProducer, KafkaProducerConfig
from src.infrastructure.message_bus.message import Event


async def main():
    # Create producer
    config = KafkaProducerConfig(
        bootstrap_servers=["localhost:9092"],
        client_id="parking-producer",
        compression_type="gzip",
    )
    producer = KafkaProducer(config)
    
    # Start producer
    await producer.start()
    
    # Create event
    event = Event(
        event_type="vehicle.parked",
        source="parking-service",
        aggregate_id="123",
        data={
            "lot_id": "lot-123",
            "slot_number": 42,
            "license_plate": "ABC123",
            "timestamp": "2024-01-01T12:00:00Z",
        },
    )
    
    # Publish event
    result = await producer.publish_event(event)
    print(f"Message published: {result}")
    
    # Stop producer
    await producer.stop()


if __name__ == "__main__":
    asyncio.run(main())