from __future__ import annotations

import os
from datetime import datetime
from typing import Any, Optional
from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.dependencies import get_current_user
from src.auth.models import TokenData
from src.core.database import get_db
from src.domain.models.billing_adjustment import (
    BillingAdjustment,
    BillingAdjustmentStatus,
    BillingAdjustmentType,
)
from src.domain.models.payment import Payment, PaymentMethod, PaymentStatus
from src.domain.models.reservation import Reservation, ReservationStatus

router = APIRouter(prefix="/payments", tags=["payments"])


class PaymentCreate(BaseModel):
    reservation_id: UUID
    payment_method: PaymentMethod = PaymentMethod.CREDIT_CARD
    currency: str = Field(default="USD", min_length=3, max_length=3)


class PaymentProcess(BaseModel):
    provider_payment_method_id: Optional[str] = Field(default=None, max_length=255)


class PaymentResponse(BaseModel):
    id: UUID
    user_id: UUID
    reservation_id: UUID
    amount: float
    currency: str
    status: str
    payment_method: str
    provider: str
    provider_reference: Optional[str] = None
    receipt_number: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    processed_at: Optional[datetime] = None
    refunded_at: Optional[datetime] = None


def _provider() -> str:
    return os.getenv("PAYMENT_PROVIDER", "local").strip().lower() or "local"


def _metadata(payment: Payment) -> dict[str, Any]:
    return dict(payment.additional_data or {})


def _payment_payload(payment: Payment) -> dict[str, Any]:
    metadata = _metadata(payment)
    return {
        "id": payment.id,
        "user_id": payment.user_id,
        "reservation_id": payment.reservation_id,
        "amount": float(payment.amount or 0),
        "currency": payment.currency or "USD",
        "status": payment.status.value if payment.status else PaymentStatus.PENDING.value,
        "payment_method": payment.payment_method.value if payment.payment_method else "unknown",
        "provider": metadata.get("provider", _provider()),
        "provider_reference": payment.stripe_payment_intent_id or metadata.get("provider_reference"),
        "receipt_number": metadata.get("receipt_number"),
        "created_at": payment.created_at,
        "updated_at": payment.updated_at,
        "processed_at": metadata.get("processed_at"),
        "refunded_at": metadata.get("refunded_at"),
    }


def _adjustment_payload(adjustment: BillingAdjustment) -> dict[str, Any]:
    return {
        "id": str(adjustment.id),
        "reservation_id": str(adjustment.reservation_id),
        "parking_session_id": str(adjustment.parking_session_id),
        "payment_id": str(adjustment.payment_id) if adjustment.payment_id else None,
        "type": adjustment.adjustment_type.value,
        "status": adjustment.status.value,
        "reserved_amount": round(float(adjustment.reserved_amount or 0), 2),
        "actual_amount": round(float(adjustment.actual_amount or 0), 2),
        "adjustment_amount": round(float(adjustment.adjustment_amount or 0), 2),
        "currency": adjustment.currency,
        "provider_reference": adjustment.provider_reference,
        "created_at": adjustment.created_at.isoformat() if adjustment.created_at else None,
        "settled_at": adjustment.settled_at.isoformat() if adjustment.settled_at else None,
    }


async def _owned_payment(db: AsyncSession, payment_id: UUID, user_id: UUID) -> Payment:
    result = await db.execute(
        select(Payment).where(Payment.id == payment_id, Payment.user_id == user_id)
    )
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


async def _stripe_partial_refund(payment: Payment, amount: float) -> str:
    secret = os.getenv("STRIPE_SECRET_KEY", "").strip()
    if not secret or not payment.stripe_payment_intent_id:
        raise HTTPException(status_code=503, detail="Stripe refund configuration is incomplete")
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            "https://api.stripe.com/v1/refunds",
            data={
                "payment_intent": payment.stripe_payment_intent_id,
                "amount": str(max(0, int(round(amount * 100)))),
            },
            auth=(secret, ""),
            headers={"Idempotency-Key": f"parking-reconcile-credit-{payment.id}-{int(round(amount * 100))}"},
        )
    try:
        payload = response.json()
    except ValueError:
        payload = {}
    if response.status_code >= 400:
        message = payload.get("error", {}).get("message") or "Stripe partial refund failed"
        raise HTTPException(status_code=402, detail=message)
    return str(payload.get("id") or "")


async def reconcile_session_payment(
    db: AsyncSession,
    *,
    user_id: UUID,
    reservation_id: UUID,
    parking_session_id: UUID,
    actual_amount: float,
) -> dict[str, Any]:
    existing = (
        await db.execute(
            select(BillingAdjustment).where(
                BillingAdjustment.parking_session_id == parking_session_id
            )
        )
    ).scalar_one_or_none()
    if existing:
        return _adjustment_payload(existing)

    payment = (
        await db.execute(
            select(Payment)
            .where(Payment.reservation_id == reservation_id, Payment.user_id == user_id)
            .with_for_update()
        )
    ).scalar_one_or_none()
    reservation = await db.get(Reservation, reservation_id)

    reserved_amount = round(
        float(payment.amount if payment is not None else (reservation.total_price if reservation else 0) or 0),
        2,
    )
    actual_amount = round(max(0.0, float(actual_amount or 0)), 2)
    delta = round(actual_amount - reserved_amount, 2)
    if abs(delta) < 0.005:
        adjustment_type = BillingAdjustmentType.NONE
    elif delta > 0:
        adjustment_type = BillingAdjustmentType.OVERAGE
    else:
        adjustment_type = BillingAdjustmentType.CREDIT

    status = BillingAdjustmentStatus.PENDING
    provider_reference = None
    now = datetime.utcnow()

    if adjustment_type == BillingAdjustmentType.NONE:
        status = BillingAdjustmentStatus.SETTLED
    elif payment is None or payment.status != PaymentStatus.COMPLETED:
        status = BillingAdjustmentStatus.PENDING
    else:
        provider = _metadata(payment).get("provider", _provider())
        if provider == "local":
            metadata = {
                **_metadata(payment),
                "reservation_amount": reserved_amount,
                "actual_session_amount": actual_amount,
                "reconciliation_amount": delta,
                "reconciliation_type": adjustment_type.value,
                "reconciled_at": now.isoformat(),
            }
            payment.amount = actual_amount
            payment.additional_data = metadata
            payment.updated_at = now
            status = BillingAdjustmentStatus.SETTLED
        elif provider == "stripe" and adjustment_type == BillingAdjustmentType.CREDIT:
            provider_reference = await _stripe_partial_refund(payment, abs(delta))
            metadata = {
                **_metadata(payment),
                "reservation_amount": reserved_amount,
                "actual_session_amount": actual_amount,
                "reconciliation_amount": delta,
                "reconciliation_type": adjustment_type.value,
                "reconciliation_refund_id": provider_reference,
                "reconciled_at": now.isoformat(),
            }
            payment.amount = actual_amount
            payment.additional_data = metadata
            payment.updated_at = now
            status = BillingAdjustmentStatus.SETTLED
        else:
            metadata = {
                **_metadata(payment),
                "reservation_amount": reserved_amount,
                "actual_session_amount": actual_amount,
                "reconciliation_amount": delta,
                "reconciliation_type": adjustment_type.value,
                "reconciliation_pending": True,
            }
            payment.additional_data = metadata
            payment.updated_at = now

    adjustment = BillingAdjustment(
        user_id=user_id,
        reservation_id=reservation_id,
        parking_session_id=parking_session_id,
        payment_id=payment.id if payment else None,
        adjustment_type=adjustment_type,
        status=status,
        reserved_amount=reserved_amount,
        actual_amount=actual_amount,
        adjustment_amount=delta,
        currency=payment.currency if payment else "USD",
        provider_reference=provider_reference,
        settled_at=now if status == BillingAdjustmentStatus.SETTLED else None,
    )
    db.add(adjustment)
    await db.flush()
    return _adjustment_payload(adjustment)


@router.post("/", response_model=PaymentResponse, status_code=201)
async def create_payment(
    body: PaymentCreate,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = UUID(current_user.user_id)
    reservation_result = await db.execute(
        select(Reservation).where(
            Reservation.id == body.reservation_id,
            Reservation.user_id == user_id,
        )
    )
    reservation = reservation_result.scalar_one_or_none()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if reservation.status == ReservationStatus.CANCELLED:
        raise HTTPException(status_code=400, detail="Cancelled reservations cannot be paid")

    existing_result = await db.execute(
        select(Payment).where(Payment.reservation_id == reservation.id)
    )
    existing = existing_result.scalar_one_or_none()
    if existing:
        if existing.user_id != user_id:
            raise HTTPException(status_code=409, detail="Reservation already has a payment")
        return _payment_payload(existing)

    payment = Payment(
        user_id=user_id,
        reservation_id=reservation.id,
        amount=float(reservation.total_price or 0),
        currency=body.currency.upper(),
        status=PaymentStatus.PENDING,
        payment_method=body.payment_method,
        additional_data={"provider": _provider()},
    )
    db.add(payment)
    try:
        await db.commit()
        await db.refresh(payment)
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=409, detail="A payment already exists for this reservation") from exc
    except SQLAlchemyError as exc:
        await db.rollback()
        raise HTTPException(status_code=503, detail="Payment database operation failed") from exc
    return _payment_payload(payment)


@router.get("/", response_model=list[PaymentResponse])
@router.get("/history", response_model=list[PaymentResponse])
async def list_payments(
    skip: int = 0,
    limit: int = 100,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = UUID(current_user.user_id)
    result = await db.execute(
        select(Payment)
        .where(Payment.user_id == user_id)
        .order_by(Payment.created_at.desc())
        .offset(max(skip, 0))
        .limit(max(1, min(limit, 100)))
    )
    return [_payment_payload(payment) for payment in result.scalars().all()]


@router.get("/methods")
async def payment_methods(current_user: TokenData = Depends(get_current_user)):
    provider = _provider()
    return [
        {
            "id": method.value,
            "type": method.value,
            "label": method.value.replace("_", " ").title(),
            "provider": provider,
            "available": True,
            "requires_provider_token": provider == "stripe" and method != PaymentMethod.CASH,
        }
        for method in PaymentMethod
    ]


@router.get("/stats")
async def payment_stats(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = UUID(current_user.user_id)
    result = await db.execute(select(Payment).where(Payment.user_id == user_id))
    payments = result.scalars().all()
    completed = [p for p in payments if p.status == PaymentStatus.COMPLETED]
    return {
        "count": len(payments),
        "completed": len(completed),
        "pending": sum(1 for p in payments if p.status in (PaymentStatus.PENDING, PaymentStatus.PROCESSING)),
        "failed": sum(1 for p in payments if p.status == PaymentStatus.FAILED),
        "refunded": sum(1 for p in payments if p.status == PaymentStatus.REFUNDED),
        "total": round(sum(float(p.amount or 0) for p in completed), 2),
        "currency": completed[0].currency if completed else "USD",
    }


@router.get("/adjustments")
async def list_billing_adjustments(
    limit: int = 100,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BillingAdjustment)
        .where(BillingAdjustment.user_id == UUID(current_user.user_id))
        .order_by(BillingAdjustment.created_at.desc())
        .limit(max(1, min(limit, 500)))
    )
    return [_adjustment_payload(item) for item in result.scalars().all()]


async def _stripe_process(payment: Payment, token: Optional[str]) -> tuple[str, dict[str, Any]]:
    secret = os.getenv("STRIPE_SECRET_KEY", "").strip()
    if not secret:
        raise HTTPException(status_code=503, detail="Stripe is selected but STRIPE_SECRET_KEY is not configured")
    if payment.payment_method != PaymentMethod.CASH and not token:
        raise HTTPException(status_code=400, detail="A Stripe payment method ID is required")

    form: list[tuple[str, str]] = [
        ("amount", str(max(0, int(round(float(payment.amount) * 100))))),
        ("currency", payment.currency.lower()),
        ("confirm", "true"),
        ("description", f"Parking reservation {payment.reservation_id}"),
        ("metadata[payment_id]", str(payment.id)),
        ("metadata[reservation_id]", str(payment.reservation_id)),
    ]
    if token:
        form.append(("payment_method", token))
        form.append(("automatic_payment_methods[enabled]", "true"))
        form.append(("automatic_payment_methods[allow_redirects]", "never"))

    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            "https://api.stripe.com/v1/payment_intents",
            data=form,
            auth=(secret, ""),
            headers={"Idempotency-Key": f"parking-payment-{payment.id}"},
        )
    try:
        payload = response.json()
    except ValueError:
        payload = {}
    if response.status_code >= 400:
        message = payload.get("error", {}).get("message") or "Stripe payment failed"
        raise HTTPException(status_code=402, detail=message)
    if payload.get("status") != "succeeded":
        raise HTTPException(
            status_code=402,
            detail=f"Stripe payment requires additional action ({payload.get('status', 'unknown')})",
        )
    return str(payload.get("id") or ""), payload


@router.post("/{payment_id}/process", response_model=PaymentResponse)
async def process_payment(
    payment_id: UUID,
    body: PaymentProcess = PaymentProcess(),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = UUID(current_user.user_id)
    payment = await _owned_payment(db, payment_id, user_id)
    if payment.status == PaymentStatus.COMPLETED:
        return _payment_payload(payment)
    if payment.status == PaymentStatus.REFUNDED:
        raise HTTPException(status_code=400, detail="Refunded payments cannot be processed again")

    provider = _provider()
    payment.status = PaymentStatus.PROCESSING
    processing_metadata = {**_metadata(payment), "provider": provider}
    payment.additional_data = processing_metadata
    await db.commit()

    try:
        provider_reference = None
        provider_payload: dict[str, Any] = {}
        if provider == "stripe":
            provider_reference, provider_payload = await _stripe_process(
                payment, body.provider_payment_method_id
            )
        elif provider != "local":
            raise HTTPException(status_code=503, detail=f"Unsupported payment provider: {provider}")

        now = datetime.utcnow()
        receipt_number = processing_metadata.get("receipt_number") or (
            f"PKG-{now:%Y%m%d}-{str(payment.id)[:8].upper()}"
        )
        completed_metadata = {
            **processing_metadata,
            "provider": provider,
            "provider_reference": provider_reference,
            "receipt_number": receipt_number,
            "processed_at": now.isoformat(),
        }
        if provider_payload:
            completed_metadata["provider_status"] = provider_payload.get("status")

        payment.stripe_payment_intent_id = (
            provider_reference or payment.stripe_payment_intent_id
        )
        payment.additional_data = completed_metadata
        payment.status = PaymentStatus.COMPLETED
        await db.commit()
        await db.refresh(payment)
        return _payment_payload(payment)
    except HTTPException:
        payment.status = PaymentStatus.FAILED
        await db.commit()
        raise
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=502, detail="Payment provider request failed") from exc


@router.get("/{payment_id}/receipt")
async def payment_receipt(
    payment_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    payment = await _owned_payment(db, payment_id, UUID(current_user.user_id))
    metadata = _metadata(payment)
    if payment.status not in (PaymentStatus.COMPLETED, PaymentStatus.REFUNDED):
        raise HTTPException(status_code=400, detail="Receipt is available after payment completion")
    return {
        "receipt_number": metadata.get("receipt_number"),
        "payment_id": str(payment.id),
        "reservation_id": str(payment.reservation_id),
        "amount": float(payment.amount),
        "currency": payment.currency,
        "payment_method": payment.payment_method.value,
        "status": payment.status.value,
        "provider": metadata.get("provider", _provider()),
        "provider_reference": payment.stripe_payment_intent_id or metadata.get("provider_reference"),
        "processed_at": metadata.get("processed_at"),
        "refunded_at": metadata.get("refunded_at"),
        "reservation_amount": metadata.get("reservation_amount"),
        "actual_session_amount": metadata.get("actual_session_amount"),
        "reconciliation_amount": metadata.get("reconciliation_amount"),
        "reconciliation_type": metadata.get("reconciliation_type"),
        "reconciled_at": metadata.get("reconciled_at"),
    }


@router.post("/{payment_id}/refund", response_model=PaymentResponse)
async def refund_payment(
    payment_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    payment = await _owned_payment(db, payment_id, UUID(current_user.user_id))
    if payment.status == PaymentStatus.REFUNDED:
        return _payment_payload(payment)
    if payment.status != PaymentStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Only completed payments can be refunded")

    provider = _provider()
    if provider == "stripe":
        secret = os.getenv("STRIPE_SECRET_KEY", "").strip()
        if not secret or not payment.stripe_payment_intent_id:
            raise HTTPException(status_code=503, detail="Stripe refund configuration is incomplete")
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                "https://api.stripe.com/v1/refunds",
                data={"payment_intent": payment.stripe_payment_intent_id},
                auth=(secret, ""),
                headers={"Idempotency-Key": f"parking-refund-{payment.id}"},
            )
        if response.status_code >= 400:
            try:
                message = response.json().get("error", {}).get("message")
            except ValueError:
                message = None
            raise HTTPException(status_code=402, detail=message or "Stripe refund failed")

    refunded_metadata = {
        **_metadata(payment),
        "refunded_at": datetime.utcnow().isoformat(),
    }
    payment.additional_data = refunded_metadata
    payment.status = PaymentStatus.REFUNDED
    await db.commit()
    await db.refresh(payment)
    return _payment_payload(payment)
