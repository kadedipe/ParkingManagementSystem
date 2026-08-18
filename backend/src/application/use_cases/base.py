# ============================================================================
# Parking Management System - Base Use Case
# ============================================================================

"""
Base Use Case class providing common functionality for all use cases.
"""

from typing import Any, Dict, Optional
from abc import ABC, abstractmethod
import logging

logger = logging.getLogger(__name__)


class BaseUseCase(ABC):
    """
    Base class for all use cases.
    
    Provides common functionality and lifecycle management for use cases.
    """
    
    def __init__(self):
        """Initialize the use case."""
        self._execution_id: Optional[str] = None
        self._context: Dict[str, Any] = {}
    
    @abstractmethod
    async def execute(self, request: Any) -> Any:
        """
        Execute the use case.
        
        Args:
            request: Use case request
            
        Returns:
            Any: Use case response
        """
        pass
    
    def set_execution_id(self, execution_id: str) -> None:
        """
        Set the execution ID for tracking.
        
        Args:
            execution_id: Execution ID
        """
        self._execution_id = execution_id
    
    def set_context(self, context: Dict[str, Any]) -> None:
        """
        Set the execution context.
        
        Args:
            context: Execution context
        """
        self._context = context
    
    def get_context(self, key: str, default: Any = None) -> Any:
        """
        Get a context value.
        
        Args:
            key: Context key
            default: Default value
            
        Returns:
            Any: Context value
        """
        return self._context.get(key, default)
    
    def log_info(self, message: str) -> None:
        """
        Log an info message.
        
        Args:
            message: Message to log
        """
        logger.info(f"[{self.__class__.__name__}] {message}")
    
    def log_error(self, message: str, error: Exception = None) -> None:
        """
        Log an error message.
        
        Args:
            message: Message to log
            error: Optional exception
        """
        if error:
            logger.error(f"[{self.__class__.__name__}] {message}: {error}", exc_info=error)
        else:
            logger.error(f"[{self.__class__.__name__}] {message}")