from typing import Any, Optional

class ChargingException(Exception):
    def __init__(
        self,
        message: str,
        error_code: str = "CHARGING_ERROR",
        status_code: int = 500,
        details: Optional[Any] = None,
    ):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details

    def __str__(self) -> str:
        return self.message

class ChargingStationNotFoundError(ChargingException):
    def __init__(self, station_id: str, message: Optional[str] = None):
        super().__init__(
            message or f"Charging station {station_id} not found",
            error_code="STATION_NOT_FOUND",
            status_code=404,
            details={"station_id": station_id}
        )
        self.station_id = station_id

class ChargingSessionError(ChargingException):
    def __init__(self, message: str, session_id: Optional[str] = None):
        super().__init__(
            message,
            error_code="SESSION_ERROR",
            status_code=400,
            details={"session_id": session_id} if session_id else None
        )