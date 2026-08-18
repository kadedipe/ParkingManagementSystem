# ============================================================================
# Common DTOs - Base DTO Classes
# ============================================================================

"""
Common Data Transfer Objects used across the application.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any, Generic, TypeVar
from uuid import UUID
import json

T = TypeVar('T')


@dataclass
class BaseDTO:
    """
    Base DTO class.
    
    Provides common functionality for all DTOs including
    serialization and deserialization.
    """
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert DTO to dictionary."""
        result = {}
        for key, value in self.__dict__.items():
            if isinstance(value, UUID):
                result[key] = str(value)
            elif isinstance(value, datetime):
                result[key] = value.isoformat()
            elif hasattr(value, 'to_dict'):
                result[key] = value.to_dict()
            elif isinstance(value, list):
                result[key] = [
                    item.to_dict() if hasattr(item, 'to_dict') else item
                    for item in value
                ]
            else:
                result[key] = value
        return result
    
    def to_json(self) -> str:
        """Convert DTO to JSON string."""
        return json.dumps(self.to_dict(), default=str)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'BaseDTO':
        """Create DTO from dictionary."""
        return cls(**data)
    
    @classmethod
    def from_json(cls, json_str: str) -> 'BaseDTO':
        """Create DTO from JSON string."""
        data = json.loads(json_str)
        return cls.from_dict(data)


@dataclass
class BaseResponse(BaseDTO):
    """
    Base response DTO.
    
    Provides common fields for all API responses.
    """
    success: bool = True
    message: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.now)
    request_id: Optional[str] = None


@dataclass
class BaseRequest(BaseDTO):
    """
    Base request DTO.
    
    Provides common fields for all API requests.
    """
    pass


@dataclass
class PaginatedRequest(BaseRequest):
    """
    Paginated request DTO.
    """
    page: int = 1
    limit: int = 20
    sort_by: Optional[str] = None
    sort_order: str = "asc"


@dataclass
class PaginatedResponse(BaseResponse):
    """
    Paginated response DTO.
    """
    data: List[Any] = field(default_factory=list)
    total: int = 0
    page: int = 1
    limit: int = 20
    pages: int = 0
    
    @classmethod
    def from_data(cls, data: List[Any], total: int, page: int, limit: int) -> 'PaginatedResponse':
        """Create paginated response from data."""
        pages = (total + limit - 1) // limit if limit > 0 else 0
        return cls(
            data=data,
            total=total,
            page=page,
            limit=limit,
            pages=pages,
        )


@dataclass
class FilterRequest(BaseRequest):
    """
    Filter request DTO.
    """
    filters: Dict[str, Any] = field(default_factory=dict)
    operator: str = "and"  # and, or


@dataclass
class SortRequest(BaseRequest):
    """
    Sort request DTO.
    """
    field: str
    order: str = "asc"


@dataclass
class AddressDTO(BaseDTO):
    """
    Address DTO.
    """
    street: str
    city: str
    state: str
    zip_code: str
    country: str = "USA"
    latitude: Optional[float] = None
    longitude: Optional[float] = None


@dataclass
class LocationDTO(BaseDTO):
    """
    Location DTO.
    """
    address: AddressDTO
    latitude: Optional[float] = None
    longitude: Optional[float] = None


@dataclass
class MoneyDTO(BaseDTO):
    """
    Money DTO.
    """
    amount: float
    currency: str = "USD"


@dataclass
class TimeRangeDTO(BaseDTO):
    """
    Time range DTO.
    """
    start_time: datetime
    end_time: datetime
    
    def is_valid(self) -> bool:
        """Check if time range is valid."""
        return self.start_time <= self.end_time


@dataclass
class DateRangeDTO(BaseDTO):
    """
    Date range DTO.
    """
    start_date: datetime
    end_date: datetime
    
    def is_valid(self) -> bool:
        """Check if date range is valid."""
        return self.start_date <= self.end_date


@dataclass
class ErrorResponse(BaseResponse):
    """
    Error response DTO.
    """
    success: bool = False
    error_code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


@dataclass
class SuccessResponse(BaseResponse):
    """
    Success response DTO.
    """
    success: bool = True
    data: Optional[Any] = None


@dataclass
class HealthResponse(BaseResponse):
    """
    Health check response DTO.
    """
    status: str = "healthy"
    version: Optional[str] = None
    uptime: Optional[float] = None
    services: Dict[str, str] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class StatusResponse(BaseResponse):
    """
    Status response DTO.
    """
    status: str = "ok"
    data: Optional[Dict[str, Any]] = None