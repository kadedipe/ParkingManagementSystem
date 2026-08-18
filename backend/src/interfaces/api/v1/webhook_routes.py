# ============================================================================
# Webhook API Routes
# ============================================================================

"""
Webhook API routes for version 1.
"""

from fastapi import APIRouter, Request, Depends, HTTPException, status
from fastapi.responses import JSONResponse

from src.interfaces.schemas import WebhookRequest, WebhookResponse
from src.interfaces.dependencies import get_webhook_service
from src.application.services.webhook_service import WebhookService
from src.infrastructure.message_bus import MessageBus

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    webhook_service: WebhookService = Depends(get_webhook_service),
):
    """
    Stripe webhook handler.
    
    Args:
        request: Stripe webhook request
        webhook_service: Webhook service
        
    Returns:
        JSONResponse: Webhook response
    """
    try:
        # Get raw body
        body = await request.body()
        
        # Get signature from headers
        signature = request.headers.get("stripe-signature")
        if not signature:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing stripe-signature header",
            )
        
        # Process webhook
        result = await webhook_service.process_stripe_webhook(
            body=body,
            signature=signature,
        )
        
        return JSONResponse(content={"received": True, "status": "success"})
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Webhook processing failed")


@router.post("/paypal")
async def paypal_webhook(
    request: Request,
    webhook_service: WebhookService = Depends(get_webhook_service),
):
    """
    PayPal webhook handler.
    
    Args:
        request: PayPal webhook request
        webhook_service: Webhook service
        
    Returns:
        JSONResponse: Webhook response
    """
    try:
        # Get raw body
        body = await request.body()
        
        # Process webhook
        result = await webhook_service.process_paypal_webhook(body)
        
        return JSONResponse(content={"received": True, "status": "success"})
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Webhook processing failed")