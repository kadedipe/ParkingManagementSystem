# ============================================================================
# Messages
# ============================================================================

"""
Message definitions for the message bus.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum
from uuid import UUID, uuid4


class MessageType(str, Enum):
    """Types of messages."""
    EVENT = "event"
    COMMAND = "command"
    QUERY = "query"
    RESPONSE = "response"


@dataclass
class MessageHeaders:
    """Message headers."""
    correlation_id: Optional[str] = None
    reply_to: Optional[str] = None
    source_service: Optional[str] = None
    target_service: Optional[str] = None
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    trace_id: Optional[str] = None
    span_id: Optional[str] = None
    retry_count: int = 0
    custom: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Message:
    """
    Base message class.
    """
    id: str = field(default_factory=lambda: str(uuid4()))
    message_type: MessageType = MessageType.EVENT
    timestamp: datetime = field(default_factory=datetime.now)
    data: Dict[str, Any] = field(default_factory=dict)
    headers: MessageHeaders = field(default_factory=MessageHeaders)
    topic: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert message to dictionary."""
        return {
            "id": self.id,
            "type": self.message_type.value,
            "timestamp": self.timestamp.isoformat(),
            "data": self.data,
            "headers": {
                "correlation_id": self.headers.correlation_id,
                "reply_to": self.headers.reply_to,
                "source_service": self.headers.source_service,
                "target_service": self.headers.target_service,
                "user_id": self.headers.user_id,
                "session_id": self.headers.session_id,
                "trace_id": self.headers.trace_id,
                "span_id": self.headers.span_id,
                "retry_count": self.headers.retry_count,
                "custom": self.headers.custom,
            },
            "topic": self.topic,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Message":
        """Create message from dictionary."""
        headers_data = data.get("headers", {})
        headers = MessageHeaders(
            correlation_id=headers_data.get("correlation_id"),
            reply_to=headers_data.get("reply_to"),
            source_service=headers_data.get("source_service"),
            target_service=headers_data.get("target_service"),
            user_id=headers_data.get("user_id"),
            session_id=headers_data.get("session_id"),
            trace_id=headers_data.get("trace_id"),
            span_id=headers_data.get("span_id"),
            retry_count=headers_data.get("retry_count", 0),
            custom=headers_data.get("custom", {}),
        )
        
        return cls(
            id=data.get("id", str(uuid4())),
            message_type=MessageType(data.get("type", "event")),
            timestamp=datetime.fromisoformat(data["timestamp"]) if data.get("timestamp") else datetime.now(),
            data=data.get("data", {}),
            headers=headers,
            topic=data.get("topic"),
        )


@dataclass
class Event(Message):
    """
    Event message.
    """
    event_type: str = ""
    version: str = "1.0"
    source: str = ""
    aggregate_id: Optional[str] = None
    
    def __post_init__(self):
        self.message_type = MessageType.EVENT
    
    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "event_type": self.event_type,
            "version": self.version,
            "source": self.source,
            "aggregate_id": self.aggregate_id,
        })
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Event":
        message = super().from_dict(data)
        return cls(
            id=message.id,
            message_type=MessageType.EVENT,
            timestamp=message.timestamp,
            data=message.data,
            headers=message.headers,
            topic=message.topic,
            event_type=data.get("event_type", ""),
            version=data.get("version", "1.0"),
            source=data.get("source", ""),
            aggregate_id=data.get("aggregate_id"),
        )


@dataclass
class Command(Message):
    """
    Command message.
    """
    command_type: str = ""
    correlation_id: Optional[str] = None
    
    def __post_init__(self):
        self.message_type = MessageType.COMMAND
    
    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "command_type": self.command_type,
            "correlation_id": self.correlation_id,
        })
        return data


@dataclass
class Query(Message):
    """
    Query message.
    """
    query_type: str = ""
    correlation_id: Optional[str] = None
    
    def __post_init__(self):
        self.message_type = MessageType.QUERY
    
    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "query_type": self.query_type,
            "correlation_id": self.correlation_id,
        })
        return data


@dataclass
class MessageEnvelope:
    """
    Message envelope with metadata.
    """
    message: Message
    topic: str
    partition: Optional[int] = None
    offset: Optional[int] = None
    timestamp: datetime = field(default_factory=datetime.now)