# ============================================================================
# Parking API Routes
# ============================================================================

"""
Parking API routes for version 1.
"""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse

from src.interfaces.schemas import (
    ParkingLotCreate,
    ParkingLotUpdate,
    ParkingLotResponse,
    ParkVehicleRequest,
    ParkVehicleResponse,
    RemoveVehicleRequest,
    RemoveVehicleResponse,
    LotStatusResponse,
    ParkingTicketResponse,
    ParkingSearchRequest,
    ParkingSearchResponse,
    BaseResponse,
    PaginatedResponse,
)
from src.interfaces.dependencies import get_parking_service, get_current_user
from src.application.services.parking_service import ParkingService
from src.domain.models import User

router = APIRouter(prefix="/parking", tags=["parking"])


@router.post("/lots", response_model=ParkingLotResponse)
async def create_parking_lot(
    data: ParkingLotCreate,
    parking_service: ParkingService = Depends(get_parking_service),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new parking lot.
    
    Args:
        data: Parking lot creation data
        parking_service: Parking service instance
        current_user: Current authenticated user
        
    Returns:
        ParkingLotResponse: Created parking lot
    """
    try:
        lot = await parking_service.create_parking_lot(data)
        return ParkingLotResponse.from_entity(lot)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create parking lot")


@router.get("/lots", response_model=PaginatedResponse[ParkingLotResponse])
async def get_parking_lots(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    active_only: bool = Query(True),
    parking_service: ParkingService = Depends(get_parking_service),
    current_user: User = Depends(get_current_user),
):
    """
    Get all parking lots.
    
    Args:
        page: Page number
        limit: Items per page
        active_only: Only return active lots
        parking_service: Parking service instance
        current_user: Current authenticated user
        
    Returns:
        PaginatedResponse[ParkingLotResponse]: List of parking lots
    """
    lots, total = await parking_service.get_all_lots(
        active_only=active_only,
        page=page,
        limit=limit,
    )
    
    return PaginatedResponse(
        data=[ParkingLotResponse.from_entity(lot) for lot in lots],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/lots/{lot_id}", response_model=ParkingLotResponse)
async def get_parking_lot(
    lot_id: UUID,
    parking_service: ParkingService = Depends(get_parking_service),
    current_user: User = Depends(get_current_user),
):
    """
    Get a parking lot by ID.
    
    Args:
        lot_id: Parking lot ID
        parking_service: Parking service instance
        current_user: Current authenticated user
        
    Returns:
        ParkingLotResponse: Parking lot details
    """
    lot = await parking_service.get_parking_lot(lot_id)
    if not lot:
        raise HTTPException(status_code=404, detail="Parking lot not found")
    return ParkingLotResponse.from_entity(lot)


@router.put("/lots/{lot_id}", response_model=ParkingLotResponse)
async def update_parking_lot(
    lot_id: UUID,
    data: ParkingLotUpdate,
    parking_service: ParkingService = Depends(get_parking_service),
    current_user: User = Depends(get_current_user),
):
    """
    Update a parking lot.
    
    Args:
        lot_id: Parking lot ID
        data: Update data
        parking_service: Parking service instance
        current_user: Current authenticated user
        
    Returns:
        ParkingLotResponse: Updated parking lot
    """
    lot = await parking_service.update_parking_lot(lot_id, data)
    if not lot:
        raise HTTPException(status_code=404, detail="Parking lot not found")
    return ParkingLotResponse.from_entity(lot)


@router.delete("/lots/{lot_id}", response_model=BaseResponse)
async def delete_parking_lot(
    lot_id: UUID,
    parking_service: ParkingService = Depends(get_parking_service),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a parking lot.
    
    Args:
        lot_id: Parking lot ID
        parking_service: Parking service instance
        current_user: Current authenticated user
        
    Returns:
        BaseResponse: Success response
    """
    success = await parking_service.delete_parking_lot(lot_id)
    if not success:
        raise HTTPException(status_code=404, detail="Parking lot not found")
    return BaseResponse(success=True, message="Parking lot deleted successfully")


@router.post("/park", response_model=ParkVehicleResponse)
async def park_vehicle(
    data: ParkVehicleRequest,
    parking_service: ParkingService = Depends(get_parking_service),
    current_user: User = Depends(get_current_user),
):
    """
    Park a vehicle in the lot.
    
    Args:
        data: Park vehicle request
        parking_service: Parking service instance
        current_user: Current authenticated user
        
    Returns:
        ParkVehicleResponse: Parking confirmation
    """
    try:
        ticket, slot = await parking_service.park_vehicle(data, current_user.id)
        return ParkVehicleResponse(
            ticket_id=ticket.id,
            ticket_number=ticket.ticket_number,
            slot_number=slot.slot_number,
            entry_time=ticket.entry_time,
            message=f"Vehicle parked in slot {slot.slot_number}",
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to park vehicle")


@router.post("/remove", response_model=RemoveVehicleResponse)
async def remove_vehicle(
    data: RemoveVehicleRequest,
    parking_service: ParkingService = Depends(get_parking_service),
    current_user: User = Depends(get_current_user),
):
    """
    Remove a vehicle from the lot.
    
    Args:
        data: Remove vehicle request
        parking_service: Parking service instance
        current_user: Current authenticated user
        
    Returns:
        RemoveVehicleResponse: Removal confirmation
    """
    try:
        ticket = await parking_service.remove_vehicle(data.ticket_id, current_user.id)
        return RemoveVehicleResponse(
            ticket_id=ticket.id,
            ticket_number=ticket.ticket_number,
            slot_number=ticket.slot_number,
            duration_hours=ticket.get_duration_hours(),
            total_amount=ticket.total_amount,
            entry_time=ticket.entry_time,
            exit_time=ticket.exit_time,
            message="Vehicle removed successfully",
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to remove vehicle")


@router.get("/lots/{lot_id}/status", response_model=LotStatusResponse)
async def get_lot_status(
    lot_id: UUID,
    parking_service: ParkingService = Depends(get_parking_service),
    current_user: User = Depends(get_current_user),
):
    """
    Get parking lot status.
    
    Args:
        lot_id: Parking lot ID
        parking_service: Parking service instance
        current_user: Current authenticated user
        
    Returns:
        LotStatusResponse: Lot status
    """
    try:
        status = await parking_service.get_lot_status(lot_id)
        return LotStatusResponse.from_entity(status)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/tickets/active", response_model=List[ParkingTicketResponse])
async def get_active_tickets(
    lot_id: Optional[UUID] = Query(None),
    parking_service: ParkingService = Depends(get_parking_service),
    current_user: User = Depends(get_current_user),
):
    """
    Get active tickets.
    
    Args:
        lot_id: Optional lot ID filter
        parking_service: Parking service instance
        current_user: Current authenticated user
        
    Returns:
        List[ParkingTicketResponse]: List of active tickets
    """
    tickets = await parking_service.get_active_tickets(current_user.id, lot_id)
    return [ParkingTicketResponse.from_entity(ticket) for ticket in tickets]


@router.get("/tickets/history", response_model=PaginatedResponse[ParkingTicketResponse])
async def get_ticket_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    parking_service: ParkingService = Depends(get_parking_service),
    current_user: User = Depends(get_current_user),
):
    """
    Get ticket history.
    
    Args:
        page: Page number
        limit: Items per page
        start_date: Start date filter
        end_date: End date filter
        parking_service: Parking service instance
        current_user: Current authenticated user
        
    Returns:
        PaginatedResponse[ParkingTicketResponse]: List of tickets
    """
    tickets, total = await parking_service.get_ticket_history(
        user_id=current_user.id,
        page=page,
        limit=limit,
        start_date=start_date,
        end_date=end_date,
    )
    
    return PaginatedResponse(
        data=[ParkingTicketResponse.from_entity(ticket) for ticket in tickets],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/revenue", response_model=BaseResponse)
async def get_revenue_report(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    parking_service: ParkingService = Depends(get_parking_service),
    current_user: User = Depends(get_current_user),
):
    """
    Get revenue report.
    
    Args:
        start_date: Start date
        end_date: End date
        parking_service: Parking service instance
        current_user: Current authenticated user
        
    Returns:
        BaseResponse: Revenue report
    """
    try:
        report = await parking_service.get_revenue_report(
            start_date=start_date,
            end_date=end_date,
            user_id=current_user.id,
        )
        return BaseResponse(success=True, data=report)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to generate revenue report")