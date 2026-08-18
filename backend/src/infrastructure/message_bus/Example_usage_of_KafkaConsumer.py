# Example usage of KafkaConsumer

import asyncio
from src.infrastructure.message_bus.kafka_consumer import (
    KafkaConsumer,
    KafkaConsumerConfig,
    ConsumerMessage,
)


async def message_handler(message: ConsumerMessage) -> None:
    """
    Handle incoming messages.
    
    Args:
        message: Consumer message
    """
    print(f"Received message: {message.message.id}")
    print(f"Topic: {message.topic}")
    print(f"Partition: {message.partition}")
    print(f"Offset: {message.offset}")
    print(f"Data: {message.message.data}")
    print(f"Headers: {message.headers}")
    print("-" * 40)


async def main():
    # Create consumer
    config = KafkaConsumerConfig(
        bootstrap_servers=["localhost:9092"],
        group_id="parking-consumer",
        topics=["events.vehicle.parked", "events.vehicle.removed"],
        enable_auto_commit=True,
        auto_offset_reset="earliest",
    )
    
    consumer = KafkaConsumer(config, handler=message_handler)
    
    # Start consumer
    await consumer.start()
    
    # Start consuming
    await consumer.consume()


if __name__ == "__main__":
    asyncio.run(main())