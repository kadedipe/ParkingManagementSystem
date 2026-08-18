from enum import Enum

class ChargingStatus(str, Enum):
    STARTED = "started"
    CHARGING = "charging"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    PAUSED = "paused"
    ERROR = "error"

class ConnectorType(str, Enum):
    TYPE_1 = "type_1"
    TYPE_2 = "type_2"
    CCS = "ccs"
    CHADEMO = "chademo"
    TESLA = "tesla"
    GB_T = "gb_t"

class ChargingProfile(str, Enum):
    STANDARD = "standard"
    FAST = "fast"
    RAPID = "rapid"
    ULTRA_RAPID = "ultra_rapid"

class OCPPStatus(str, Enum):
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    ERROR = "error"
    RECONNECTING = "reconnecting"

__all__ = [
    'ChargingStatus',
    'ConnectorType',
    'ChargingProfile',
    'OCPPStatus',
]