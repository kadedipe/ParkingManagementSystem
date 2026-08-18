# ============================================================================
# Parking Management System - Application Layer Package
# ============================================================================

"""
Application Layer for the Parking Management System.

This package contains the application services, use cases, and DTOs
that orchestrate the domain logic and handle external interactions.

The application layer:
- Coordinates domain objects to perform specific tasks
- Implements use cases that represent business requirements
- Handles transactions and unit of work
- Validates input data
- Maps between domain objects and DTOs
- Manages cross-cutting concerns like logging and security
"""

# ============================================================================
# Service Exports
# ============================================================================

from src.application.services.parking_service import ParkingService
from src.application.services.charging_service import ChargingService
from src.application.services.vehicle_service import VehicleService
from src.application.services.user_service import UserService
from src.application.services.notification_service import NotificationService
from src.application.services.payment_service import PaymentService
from src.application.services.report_service import ReportService

# ============================================================================
# DTO Exports
# ============================================================================

from src.application.dtos.parking_dto import (
    ParkingLotCreateDTO,
    ParkingLotResponseDTO,
    ParkingLotUpdateDTO,
    ParkingSlotDTO,
    ParkVehicleDTO,
    RemoveVehicleDTO,
    ParkingTicketDTO,
    LotStatusDTO,
)

from src.application.dtos.charging_dto import (
    ChargingStationCreateDTO,
    ChargingStationResponseDTO,
    ChargingSessionDTO,
    StartChargingDTO,
    StopChargingDTO,
    ChargingStatusDTO,
)

from src.application.dtos.vehicle_dto import (
    VehicleCreateDTO,
    VehicleResponseDTO,
    VehicleUpdateDTO,
    VehicleSearchDTO,
)

from src.application.dtos.user_dto import (
    UserCreateDTO,
    UserResponseDTO,
    UserUpdateDTO,
    UserLoginDTO,
    UserRegisterDTO,
)

from src.application.dtos.payment_dto import (
    PaymentCreateDTO,
    PaymentResponseDTO,
    PaymentIntentDTO,
    PaymentMethodDTO,
)

# ============================================================================
# Use Case Exports
# ============================================================================

from src.application.use_cases.park_vehicle import ParkVehicleUseCase
from src.application.use_cases.remove_vehicle import RemoveVehicleUseCase
from src.application.use_cases.create_parking_lot import CreateParkingLotUseCase
from src.application.use_cases.get_lot_status import GetLotStatusUseCase
from src.application.use_cases.start_charging import StartChargingUseCase
from src.application.use_cases.stop_charging import StopChargingUseCase
from src.application.use_cases.register_vehicle import RegisterVehicleUseCase
from src.application.use_cases.process_payment import ProcessPaymentUseCase

# ============================================================================
# Interface Exports
# ============================================================================

from src.application.interfaces import (
    IParkingService,
    IChargingService,
    IVehicleService,
    IUserService,
    INotificationService,
    IPaymentService,
    IReportService,
    IUnitOfWork,
)

# ============================================================================
# Package Metadata
# ============================================================================

__all__ = [
    # Services
    "ParkingService",
    "ChargingService", 
    "VehicleService",
    "UserService",
    "NotificationService",
    "PaymentService",
    "ReportService",
    
    # DTOs - Parking
    "ParkingLotCreateDTO",
    "ParkingLotResponseDTO",
    "ParkingLotUpdateDTO",
    "ParkingSlotDTO",
    "ParkVehicleDTO",
    "RemoveVehicleDTO",
    "ParkingTicketDTO",
    "LotStatusDTO",
    
    # DTOs - Charging
    "ChargingStationCreateDTO",
    "ChargingStationResponseDTO",
    "ChargingSessionDTO",
    "StartChargingDTO",
    "StopChargingDTO",
    "ChargingStatusDTO",
    
    # DTOs - Vehicle
    "VehicleCreateDTO",
    "VehicleResponseDTO",
    "VehicleUpdateDTO",
    "VehicleSearchDTO",
    
    # DTOs - User
    "UserCreateDTO",
    "UserResponseDTO",
    "UserUpdateDTO",
    "UserLoginDTO",
    "UserRegisterDTO",
    
    # DTOs - Payment
    "PaymentCreateDTO",
    "PaymentResponseDTO",
    "PaymentIntentDTO",
    "PaymentMethodDTO",
    
    # Use Cases
    "ParkVehicleUseCase",
    "RemoveVehicleUseCase",
    "CreateParkingLotUseCase",
    "GetLotStatusUseCase",
    "StartChargingUseCase",
    "StopChargingUseCase",
    "RegisterVehicleUseCase",
    "ProcessPaymentUseCase",
    
    # Interfaces
    "IParkingService",
    "IChargingService",
    "IVehicleService",
    "IUserService",
    "INotificationService",
    "IPaymentService",
    "IReportService",
    "IUnitOfWork",
]

# ============================================================================
# Version Information
# ============================================================================

__version__ = "1.0.0"
__author__ = "Parking Management Team"