# ============================================================================
# Mappers - Domain to DTO Mapping
# ============================================================================

# parking-management-system/services/parking-service/src/application/mappers.py

from typing import Dict, Any
from src.domain.models import ParkingLot, ParkingSpot
from src.domain.value_objects import Address, Location, OperatingHours
from src.application.dtos import (
    ParkingLotResponseDTO,
    ParkingSpotResponseDTO,
)

class ParkingLotMapper:
    """Mapper for ParkingLot domain entity to DTO"""
    
    @staticmethod
    def to_response_dto(lot: ParkingLot) -> ParkingLotResponseDTO:
        """Convert ParkingLot to ParkingLotResponseDTO"""
        return ParkingLotResponseDTO(
            id=lot.id,
            name=lot.name,
            description=lot.description,
            type=lot.type,
            status=lot.status,
            address=lot.address,
            location=lot.location,
            total_spots=lot.total_spots,
            available_spots=lot.available_spots,
            reserved_spots=lot.reserved_spots,
            base_price_per_hour=float(lot.base_price_per_hour) if lot.base_price_per_hour else 0,
            base_price_per_day=float(lot.base_price_per_day) if lot.base_price_per_day else None,
            base_price_per_month=float(lot.base_price_per_month) if lot.base_price_per_month else None,
            amenities=lot.amenities or [],
            features=lot.features or [],
            operating_hours=lot.operating_hours,
            phone=lot.phone,
            email=lot.email,
            website=lot.website,
            rating=lot.rating or 0.0,
            review_count=lot.review_count or 0,
            images=lot.images or [],
            created_at=lot.created_at,
            updated_at=lot.updated_at,
        )
    
    @staticmethod
    def from_create_dto(dto: Dict[str, Any]) -> ParkingLot:
        """Create ParkingLot from create DTO dict"""
        return ParkingLot(
            name=dto['name'],
            description=dto.get('description'),
            type=dto.get('type', 'standard'),
            address=dto['address'],
            location=dto['location'],
            total_spots=dto['total_spots'],
            available_spots=dto['total_spots'],
            base_price_per_hour=dto['base_price_per_hour'],
            base_price_per_day=dto.get('base_price_per_day'),
            base_price_per_month=dto.get('base_price_per_month'),
            amenities=dto.get('amenities', []),
            features=dto.get('features', []),
            operating_hours=dto.get('operating_hours'),
            phone=dto.get('phone'),
            email=dto.get('email'),
            website=dto.get('website'),
            created_by=dto.get('created_by'),
        )

class ParkingSpotMapper:
    """Mapper for ParkingSpot domain entity to DTO"""
    
    @staticmethod
    def to_response_dto(spot: ParkingSpot) -> ParkingSpotResponseDTO:
        """Convert ParkingSpot to ParkingSpotResponseDTO"""
        return ParkingSpotResponseDTO(
            id=spot.id,
            parking_lot_id=spot.parking_lot_id,
            number=spot.number,
            level=spot.level,
            type=spot.type,
            status=spot.status,
            width=spot.width,
            length=spot.length,
            height=spot.height,
            is_covered=spot.is_covered,
            is_handicap=spot.is_handicap,
            is_ev_charging=spot.is_ev_charging,
            connector_type=spot.connector_type,
            charging_power=spot.charging_power,
            charging_price=spot.charging_price,
            vehicle_id=spot.vehicle_id,
            vehicle_plate=spot.vehicle_plate,
            reserved_until=spot.reserved_until,
            occupied_since=spot.occupied_since,
            created_at=spot.created_at,
            updated_at=spot.updated_at,
        )