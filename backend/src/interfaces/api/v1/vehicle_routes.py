# ============================================================================
# Vehicle API Routes
# ============================================================================

"""
Vehicle API routes for version 1.
"""

from typing import List, Optional
from fastapi import APIRouter, Request, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse

from src.interfaces.schemas import (
    VehicleCreateRequest,
    VehicleUpdateRequest,
    VehicleResponse,
    VehicleListResponse,
    VehicleSearchRequest
)
from src.interfaces.dependencies import get_vehicle_service
from src.application.services.vehicle_service import VehicleService
from src.infrastructure.message_bus import MessageBus

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


@router.get("/", response_model=VehicleListResponse)
async def get_vehicles(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    vehicle_service: VehicleService = Depends(get_vehicle_service),
):
    """
    Get all vehicles with pagination.
    
    Args:
        skip: Number of records to skip
        limit: Number of records to return
        vehicle_service: Vehicle service
        
    Returns:
        VehicleListResponse: List of vehicles with pagination metadata
    """
    try:
        vehicles, total = await vehicle_service.get_all_vehicles(
            skip=skip,
            limit=limit
        )
        
        return VehicleListResponse(
            items=vehicles,
            total=total,
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve vehicles"
        )


@router.get("/search", response_model=VehicleListResponse)
async def search_vehicles(
    query: str = Query(..., min_length=1, description="Search query"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    vehicle_service: VehicleService = Depends(get_vehicle_service),
):
    """
    Search vehicles by license plate, make, model, or owner name.
    
    Args:
        query: Search query string
        skip: Number of records to skip
        limit: Number of records to return
        vehicle_service: Vehicle service
        
    Returns:
        VehicleListResponse: Search results with pagination metadata
    """
    try:
        vehicles, total = await vehicle_service.search_vehicles(
            query=query,
            skip=skip,
            limit=limit
        )
        
        return VehicleListResponse(
            items=vehicles,
            total=total,
            skip=skip,
            limit=limit
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search vehicles"
        )


@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(
    vehicle_id: int,
    vehicle_service: VehicleService = Depends(get_vehicle_service),
):
    """
    Get a specific vehicle by ID.
    
    Args:
        vehicle_id: Vehicle ID
        vehicle_service: Vehicle service
        
    Returns:
        VehicleResponse: Vehicle details
    """
    try:
        vehicle = await vehicle_service.get_vehicle_by_id(vehicle_id)
        
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vehicle with ID {vehicle_id} not found"
            )
        
        return vehicle
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve vehicle"
        )


@router.get("/license/{license_plate}", response_model=VehicleResponse)
async def get_vehicle_by_license(
    license_plate: str,
    vehicle_service: VehicleService = Depends(get_vehicle_service),
):
    """
    Get a specific vehicle by license plate.
    
    Args:
        license_plate: License plate number
        vehicle_service: Vehicle service
        
    Returns:
        VehicleResponse: Vehicle details
    """
    try:
        vehicle = await vehicle_service.get_vehicle_by_license(license_plate)
        
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vehicle with license plate {license_plate} not found"
            )
        
        return vehicle
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve vehicle"
        )


@router.post("/", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def create_vehicle(
    request: Request,
    vehicle_data: VehicleCreateRequest,
    vehicle_service: VehicleService = Depends(get_vehicle_service),
):
    """
    Create a new vehicle.
    
    Args:
        request: HTTP request
        vehicle_data: Vehicle creation data
        vehicle_service: Vehicle service
        
    Returns:
        VehicleResponse: Created vehicle details
    """
    try:
        # You can get additional context from the request if needed
        # e.g., user_id = request.state.user_id
        
        vehicle = await vehicle_service.create_vehicle(vehicle_data)
        
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create vehicle"
            )
        
        return vehicle
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create vehicle"
        )


@router.put("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: int,
    vehicle_data: VehicleUpdateRequest,
    vehicle_service: VehicleService = Depends(get_vehicle_service),
):
    """
    Update an existing vehicle.
    
    Args:
        vehicle_id: Vehicle ID
        vehicle_data: Vehicle update data
        vehicle_service: Vehicle service
        
    Returns:
        VehicleResponse: Updated vehicle details
    """
    try:
        vehicle = await vehicle_service.update_vehicle(
            vehicle_id=vehicle_id,
            vehicle_data=vehicle_data
        )
        
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vehicle with ID {vehicle_id} not found"
            )
        
        return vehicle
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update vehicle"
        )


@router.patch("/{vehicle_id}", response_model=VehicleResponse)
async def partial_update_vehicle(
    vehicle_id: int,
    vehicle_data: VehicleUpdateRequest,
    vehicle_service: VehicleService = Depends(get_vehicle_service),
):
    """
    Partially update an existing vehicle.
    
    Args:
        vehicle_id: Vehicle ID
        vehicle_data: Vehicle update data (partial)
        vehicle_service: Vehicle service
        
    Returns:
        VehicleResponse: Updated vehicle details
    """
    try:
        vehicle = await vehicle_service.partial_update_vehicle(
            vehicle_id=vehicle_id,
            vehicle_data=vehicle_data
        )
        
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vehicle with ID {vehicle_id} not found"
            )
        
        return vehicle
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update vehicle"
        )


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vehicle(
    vehicle_id: int,
    vehicle_service: VehicleService = Depends(get_vehicle_service),
):
    """
    Delete a vehicle.
    
    Args:
        vehicle_id: Vehicle ID
        vehicle_service: Vehicle service
        
    Returns:
        None: 204 No Content on success
    """
    try:
        deleted = await vehicle_service.delete_vehicle(vehicle_id)
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vehicle with ID {vehicle_id} not found"
            )
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete vehicle"
        )


@router.post("/{vehicle_id}/assign-parking")
async def assign_parking_spot(
    vehicle_id: int,
    parking_spot_id: int,
    vehicle_service: VehicleService = Depends(get_vehicle_service),
):
    """
    Assign a parking spot to a vehicle.
    
    Args:
        vehicle_id: Vehicle ID
        parking_spot_id: Parking spot ID
        vehicle_service: Vehicle service
        
    Returns:
        JSONResponse: Assignment confirmation
    """
    try:
        result = await vehicle_service.assign_parking_spot(
            vehicle_id=vehicle_id,
            parking_spot_id=parking_spot_id
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to assign parking spot"
            )
        
        return JSONResponse(
            content={
                "status": "success",
                "message": "Parking spot assigned successfully",
                "vehicle_id": vehicle_id,
                "parking_spot_id": parking_spot_id
            }
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to assign parking spot"
        )


@router.post("/{vehicle_id}/unassign-parking")
async def unassign_parking_spot(
    vehicle_id: int,
    vehicle_service: VehicleService = Depends(get_vehicle_service),
):
    """
    Unassign the current parking spot from a vehicle.
    
    Args:
        vehicle_id: Vehicle ID
        vehicle_service: Vehicle service
        
    Returns:
        JSONResponse: Unassignment confirmation
    """
    try:
        result = await vehicle_service.unassign_parking_spot(vehicle_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to unassign parking spot"
            )
        
        return JSONResponse(
            content={
                "status": "success",
                "message": "Parking spot unassigned successfully",
                "vehicle_id": vehicle_id
            }
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unassign parking spot"
        )


@router.get("/{vehicle_id}/parking-history")
async def get_vehicle_parking_history(
    vehicle_id: int,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    vehicle_service: VehicleService = Depends(get_vehicle_service),
):
    """
    Get parking history for a specific vehicle.
    
    Args:
        vehicle_id: Vehicle ID
        skip: Number of records to skip
        limit: Number of records to return
        vehicle_service: Vehicle service
        
    Returns:
        JSONResponse: Parking history with pagination
    """
    try:
        history, total = await vehicle_service.get_parking_history(
            vehicle_id=vehicle_id,
            skip=skip,
            limit=limit
        )
        
        return JSONResponse(
            content={
                "items": history,
                "total": total,
                "skip": skip,
                "limit": limit
            }
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve parking history"
        )