import stripe
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from .models import PaymentIntent, Refund, PaymentStatus

class StripeService:
    def __init__(self, secret_key: str, webhook_secret: Optional[str] = None):
        stripe.api_key = secret_key
        self.webhook_secret = webhook_secret
    
    async def create_payment_intent(
        self,
        amount: float,
        currency: str = "usd",
        metadata: Optional[Dict[str, Any]] = None,
        customer_id: Optional[str] = None,
        payment_method_types: list = ["card"]
    ) -> PaymentIntent:
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),
                currency=currency,
                metadata=metadata or {},
                customer=customer_id,
                payment_method_types=payment_method_types,
            )
            return PaymentIntent(
                id=intent.id,
                amount=intent.amount / 100,
                currency=intent.currency,
                status=PaymentStatus(intent.status),
                client_secret=intent.client_secret,
                payment_method_types=intent.payment_method_types,
                metadata=intent.metadata
            )
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    async def confirm_payment(self, payment_intent_id: str) -> PaymentIntent:
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return PaymentIntent(
                id=intent.id,
                amount=intent.amount / 100,
                currency=intent.currency,
                status=PaymentStatus(intent.status),
                client_secret=intent.client_secret,
                payment_method_types=intent.payment_method_types,
                metadata=intent.metadata
            )
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    async def refund_payment(
        self,
        payment_intent_id: str,
        amount: Optional[float] = None
    ) -> Refund:
        try:
            refund = stripe.Refund.create(
                payment_intent=payment_intent_id,
                amount=int(amount * 100) if amount else None
            )
            return Refund(
                id=refund.id,
                payment_intent=refund.payment_intent,
                amount=refund.amount / 100,
                currency=refund.currency,
                status=refund.status
            )
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    async def create_customer(self, email: str, name: str, phone: Optional[str] = None) -> Dict[str, Any]:
        try:
            customer = stripe.Customer.create(
                email=email,
                name=name,
                phone=phone
            )
            return {
                "id": customer.id,
                "email": customer.email,
                "name": customer.name
            }
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=str(e))