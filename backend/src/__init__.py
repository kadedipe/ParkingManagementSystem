# ============================================================================
# Parking Management System - Backend Package
# Root package initialization
# ============================================================================

"""
Parking Management System Backend

A production-ready FastAPI backend for parking management with EV charging support.
"""

__version__ = "1.0.0"
__author__ = "Parking Management Team"
__email__ = "team@parking-system.com"
__license__ = "MIT"

# ============================================================================
# Package Metadata
# ============================================================================

PACKAGE_NAME = "parking-management-backend"
PACKAGE_DESCRIPTION = "Production-ready FastAPI backend for Parking Management System"

# ============================================================================
# Version Information
# ============================================================================

VERSION = "1.0.0"
VERSION_INFO = {
    "major": 1,
    "minor": 0,
    "patch": 0,
    "release": "final",
    "build": 0,
}

# ============================================================================
# Package Constants
# ============================================================================

# Application name
APP_NAME = "Parking Management System"

# API prefix
API_PREFIX = "/api/v1"

# Default configuration
DEFAULT_CONFIG = {
    "debug": False,
    "log_level": "info",
    "database_url": "postgresql://user:password@localhost:5432/parking_db",
}

# ============================================================================
# Export Modules
# ============================================================================

# This makes the package importable with:
# from src import APP_NAME, VERSION
# from src.domain import models
# from src.application import services

__all__ = [
    "APP_NAME",
    "API_PREFIX",
    "VERSION",
    "PACKAGE_NAME",
    "PACKAGE_DESCRIPTION",
    "__version__",
    "__author__",
    "__email__",
    "__license__",
]