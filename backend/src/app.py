# ============================================================================
# Parking Management System - Application Factory
# ============================================================================

"""
Application factory pattern for creating FastAPI instances.

This module provides functions for creating and configuring FastAPI
application instances for different environments (development, testing, production).
"""

from typing import Optional
from fastapi import FastAPI
from src.core.config import settings


def create_app(
    environment: Optional[str] = None,
    testing: bool = False,
) -> FastAPI:
    """
    Create a configured FastAPI application instance.
    
    Args:
        environment: Optional environment override
        testing: Whether running in test mode
        
    Returns:
        FastAPI: Configured application instance
    """
    # Use provided environment or fallback to settings
    env = environment or settings.ENVIRONMENT
    
    # Create application with appropriate configuration
    if testing:
        # Testing configuration
        return FastAPI(
            title=f"{settings.APP_NAME} (Test)",
            version=settings.APP_VERSION,
            docs_url=None,  # Disable docs in test mode
            redoc_url=None,
            openapi_url=None,
        )
    
    # Production/Development configuration
    from src.main import create_application
    return create_application()


def get_app() -> FastAPI:
    """
    Get the application instance.
    
    Returns:
        FastAPI: Application instance
    """
    from src.main import app
    return app