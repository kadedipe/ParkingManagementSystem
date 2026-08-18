from typing import Dict, Any
from uuid import UUID
from fastapi import HTTPException, status
import stripe
from src.core.config import settings

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

class PaymentService:
    @staticmethod
    async def create_payment_intent(amount: float, currency: str = "usd", metadata: Dict[str, Any] = None):
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Convert to cents
                currency=currency,
                metadata=metadata or {},
                payment_method_types=["card"],
            )
            return {
                "client_secret": intent.client_secret,
                "payment_intent_id": intent.id,
                "amount": intent.amount / 100,
                "currency": intent.currency,
                "status": intent.status
            }
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    @staticmethod
    async def confirm_payment(payment_intent_id: str):
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return {
                "payment_intent_id": intent.id,
                "status": intent.status,
                "amount": intent.amount / 100,
                "currency": intent.currency
            }
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    @staticmethod
    async def refund_payment(payment_intent_id: str, amount: float = None):
        try:
            refund = stripe.Refund.create(
                payment_intent=payment_intent_id,
                amount=int(amount * 100) if amount else None
            )
            return {
                "refund_id": refund.id,
                "payment_intent_id": refund.payment_intent,
                "amount": refund.amount / 100,
                "status": refund.status
            }
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=str(e))