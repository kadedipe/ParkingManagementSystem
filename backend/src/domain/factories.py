# ============================================================================
# Event Factory - Additional Event Creation Methods
# ============================================================================

from src.domain.events import SlotVacatedEvent, PaymentCompletedEvent


class EventFactory:
    """Factory for creating domain events."""
    
    # ... existing methods ...
    
    @staticmethod
    def create_slot_vacated_event(
        parking_lot_id: UUID,
        slot_number: int,
        vehicle_id: UUID,
        license_plate: str,
        vacated_at: datetime = None,
        **kwargs
    ) -> SlotVacatedEvent:
        """Create a slot vacated event."""
        return SlotVacatedEvent(
            aggregate_id=parking_lot_id,
            aggregate_type="parking_lot",
            parking_lot_id=parking_lot_id,
            slot_number=slot_number,
            vehicle_id=vehicle_id,
            license_plate=license_plate,
            vacated_at=vacated_at or datetime.now(),
            metadata=kwargs,
        )
    
    @staticmethod
    def create_payment_completed_event(
        payment_id: UUID,
        booking_id: UUID,
        user_id: UUID,
        amount: float,
        payment_method: str,
        transaction_id: str,
        completed_at: datetime = None,
        **kwargs
    ) -> PaymentCompletedEvent:
        """Create a payment completed event."""
        return PaymentCompletedEvent(
            aggregate_id=payment_id,
            aggregate_type="payment",
            payment_id=payment_id,
            booking_id=booking_id,
            user_id=user_id,
            amount=amount,
            payment_method=payment_method,
            transaction_id=transaction_id,
            completed_at=completed_at or datetime.now(),
            metadata=kwargs,
        )