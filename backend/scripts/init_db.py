#!/usr/bin/env python
# ============================================================================
# Database Initialization Script
# ============================================================================

"""
Database initialization script for the parking management system.

This script creates and initializes the database with all required tables,
seed data, and default configurations for different environments.
"""

import os
import sys
import asyncio
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from decimal import Decimal
import argparse

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.shared.config import settings
from src.shared.logging import setup_logging, get_logger
from src.infrastructure.database import engine, get_db_session, Base
from src.infrastructure.models import (
    User,
    Vehicle,
    ParkingSpot,
    ParkingSession,
    ChargingStation,
    ChargingSession,
    Payment,
    Notification,
    Rate,
    Reservation,
    AuditLog,
    Setting,
)
from src.domain.enums import (
    UserRole,
    UserStatus,
    VehicleType,
    VehicleStatus,
    ParkingSpotType,
    ParkingSpotStatus,
    ParkingSessionStatus,
    ChargingConnectorType,
    ChargingStationStatus,
    PaymentStatus,
    PaymentMethod,
    NotificationType,
    ReservationStatus,
)
from src.domain.value_objects import LicensePlate, Money, Email, PhoneNumber

# Setup logging
setup_logging()
logger = get_logger(__name__)


# ============================================================================
# Argument Parser
# ============================================================================

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Initialize database for parking management system"
    )
    parser.add_argument(
        "--environment",
        type=str,
        choices=["development", "staging", "production", "testing"],
        default="development",
        help="Environment to initialize"
    )
    parser.add_argument(
        "--seed-data",
        action="store_true",
        default=True,
        help="Seed initial data"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force reinitialization (drop existing tables)"
    )
    parser.add_argument(
        "--sample-data",
        action="store_true",
        default=False,
        help="Add sample data for testing"
    )
    parser.add_argument(
        "--admin-email",
        type=str,
        default="admin@parking.com",
        help="Admin user email"
    )
    parser.add_argument(
        "--admin-password",
        type=str,
        default="AdminPassword123!",
        help="Admin user password"
    )
    return parser.parse_args()


# ============================================================================
# Database Initialization
# ============================================================================

class DatabaseInitializer:
    """
    Database initializer for creating and seeding the database.
    """
    
    def __init__(self, environment: str = "development", force: bool = False):
        """
        Initialize the database initializer.
        
        Args:
            environment: Environment name
            force: Force reinitialization
        """
        self.environment = environment
        self.force = force
        self.session = None
    
    async def initialize(self) -> bool:
        """
        Initialize the database.
        
        Returns:
            bool: True if successful
        """
        try:
            logger.info(f"Starting database initialization for {self.environment}")
            
            # Create tables
            await self._create_tables()
            
            # Create default admin user
            await self._create_admin_user()
            
            # Seed initial data
            await self._seed_initial_data()
            
            # Add sample data if requested
            if args.sample_data:
                await self._add_sample_data()
            
            logger.info("Database initialization completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Database initialization failed: {e}", exc_info=True)
            return False
    
    async def _create_tables(self):
        """Create all database tables."""
        logger.info("Creating database tables...")
        
        if self.force:
            logger.warning("Dropping existing tables...")
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.drop_all)
        
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("Database tables created successfully")
    
    async def _create_admin_user(self):
        """Create default admin user."""
        logger.info("Creating admin user...")
        
        async with get_db_session() as session:
            # Check if admin exists
            from sqlalchemy import select
            stmt = select(User).where(User.email == args.admin_email)
            result = await session.execute(stmt)
            existing_admin = result.scalar_one_or_none()
            
            if existing_admin:
                logger.info(f"Admin user already exists: {args.admin_email}")
                return
            
            # Create admin user
            admin = User(
                username="admin",
                email=Email(args.admin_email),
                password_hash=self._hash_password(args.admin_password),
                first_name="System",
                last_name="Administrator",
                role=UserRole.SUPER_ADMIN,
                status=UserStatus.ACTIVE,
                is_email_verified=True,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            session.add(admin)
            await session.commit()
            
            logger.info(f"Admin user created: {args.admin_email}")
    
    def _hash_password(self, password: str) -> str:
        """Hash a password."""
        import hashlib
        import base64
        # Simple hash for demo - use proper hashing in production
        return base64.b64encode(
            hashlib.sha256(password.encode()).digest()
        ).decode()
    
    async def _seed_initial_data(self):
        """Seed initial data."""
        logger.info("Seeding initial data...")
        
        async with get_db_session() as session:
            # Create default settings
            await self._create_default_settings(session)
            
            # Create default rates
            await self._create_default_rates(session)
            
            # Create default parking spots
            await self._create_default_parking_spots(session)
            
            # Create default charging stations
            await self._create_default_charging_stations(session)
            
            await session.commit()
        
        logger.info("Initial data seeded successfully")
    
    async def _create_default_settings(self, session):
        """Create default system settings."""
        logger.info("Creating default settings...")
        
        default_settings = [
            Setting(
                key="system_name",
                value="Parking Management System",
                category="general",
                description="System name",
                is_public=True
            ),
            Setting(
                key="system_timezone",
                value="UTC",
                category="general",
                description="System timezone",
                is_public=True
            ),
            Setting(
                key="max_parking_duration_hours",
                value="24",
                category="parking",
                description="Maximum parking duration in hours",
                is_public=False
            ),
            Setting(
                key="reservation_lead_time_minutes",
                value="30",
                category="parking",
                description="Minimum lead time for reservations in minutes",
                is_public=True
            ),
            Setting(
                key="reservation_max_days_ahead",
                value="7",
                category="parking",
                description="Maximum days ahead for reservations",
                is_public=True
            ),
            Setting(
                key="default_currency",
                value="USD",
                category="payment",
                description="Default currency",
                is_public=True
            ),
            Setting(
                key="enable_dynamic_pricing",
                value="false",
                category="parking",
                description="Enable dynamic pricing",
                is_public=False
            ),
            Setting(
                key="notification_enabled",
                value="true",
                category="notification",
                description="Enable notifications",
                is_public=True
            ),
            Setting(
                key="maintenance_mode",
                value="false",
                category="system",
                description="Maintenance mode",
                is_public=True
            ),
            Setting(
                key="max_occupancy_threshold",
                value="90",
                category="parking",
                description="Maximum occupancy threshold percentage",
                is_public=False
            ),
        ]
        
        # Check if settings already exist
        from sqlalchemy import select
        for setting in default_settings:
            stmt = select(Setting).where(Setting.key == setting.key)
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            if not existing:
                session.add(setting)
        
        logger.info(f"Added {len(default_settings)} default settings")
    
    async def _create_default_rates(self, session):
        """Create default parking and charging rates."""
        logger.info("Creating default rates...")
        
        default_rates = [
            # Parking rates
            Rate(
                name="Standard Hourly",
                rate_type="hourly",
                amount=Decimal("5.00"),
                currency="USD",
                description="Standard hourly parking rate",
                is_active=True,
                grace_period=15,
                applies_to_spot_types=["standard", "compact"]
            ),
            Rate(
                name="Premium Hourly",
                rate_type="hourly",
                amount=Decimal("10.00"),
                currency="USD",
                description="Premium hourly parking rate",
                is_active=True,
                grace_period=15,
                applies_to_spot_types=["premium", "reserved"]
            ),
            Rate(
                name="Daily Flat",
                rate_type="daily",
                amount=Decimal("30.00"),
                currency="USD",
                description="Daily flat parking rate",
                is_active=True,
                grace_period=30
            ),
            Rate(
                name="Monthly Flat",
                rate_type="monthly",
                amount=Decimal("500.00"),
                currency="USD",
                description="Monthly flat parking rate",
                is_active=True,
                grace_period=60
            ),
            # Charging rates
            Rate(
                name="Standard Charging",
                rate_type="hourly",
                amount=Decimal("0.30"),
                currency="USD",
                description="Standard charging rate per kWh",
                is_active=True,
                applies_to_vehicle_types=["ev", "hybrid"]
            ),
            Rate(
                name="Premium Charging",
                rate_type="hourly",
                amount=Decimal("0.50"),
                currency="USD",
                description="Premium charging rate per kWh",
                is_active=True,
                applies_to_vehicle_types=["ev"]
            ),
        ]
        
        # Check if rates already exist
        from sqlalchemy import select
        for rate in default_rates:
            stmt = select(Rate).where(Rate.name == rate.name)
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            if not existing:
                session.add(rate)
        
        logger.info(f"Added {len(default_rates)} default rates")
    
    async def _create_default_parking_spots(self, session):
        """Create default parking spots."""
        logger.info("Creating default parking spots...")
        
        default_spots = []
        
        # Create spots for different floors and sections
        floors = [1, 2, 3]
        sections = ["A", "B", "C"]
        spot_types = [
            ParkingSpotType.STANDARD,
            ParkingSpotType.STANDARD,
            ParkingSpotType.STANDARD,
            ParkingSpotType.COMPACT,
            ParkingSpotType.HANDICAPPED,
            ParkingSpotType.EV_CHARGING,
            ParkingSpotType.PREMIUM,
        ]
        
        for floor in floors:
            for section in sections:
                for i in range(1, 11):  # 10 spots per section
                    spot_number = f"{section}{floor:02d}{i:02d}"
                    spot_type = spot_types[i % len(spot_types)]
                    
                    spot = ParkingSpot(
                        spot_number=spot_number,
                        floor=floor,
                        section=section,
                        spot_type=spot_type,
                        status=ParkingSpotStatus.AVAILABLE,
                        access_level="public",
                        is_covered=floor >= 2,
                        is_handicap_accessible=(spot_type == ParkingSpotType.HANDICAPPED),
                        is_ev_charging=(spot_type == ParkingSpotType.EV_CHARGING),
                        has_cctv=True,
                        location_id=1,
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    default_spots.append(spot)
        
        # Check if spots already exist
        from sqlalchemy import select
        for spot in default_spots:
            stmt = select(ParkingSpot).where(ParkingSpot.spot_number == spot.spot_number)
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            if not existing:
                session.add(spot)
        
        logger.info(f"Added {len(default_spots)} default parking spots")
    
    async def _create_default_charging_stations(self, session):
        """Create default charging stations."""
        logger.info("Creating default charging stations...")
        
        default_stations = [
            ChargingStation(
                station_name="EV Charger 1",
                location_id=1,
                connector_type=ChargingConnectorType.CCS,
                power_rating_kw=50,
                status=ChargingStationStatus.AVAILABLE,
                charging_rate=Decimal("0.30"),
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            ),
            ChargingStation(
                station_name="EV Charger 2",
                location_id=1,
                connector_type=ChargingConnectorType.CHAdeMO,
                power_rating_kw=50,
                status=ChargingStationStatus.AVAILABLE,
                charging_rate=Decimal("0.30"),
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            ),
            ChargingStation(
                station_name="EV Charger 3",
                location_id=1,
                connector_type=ChargingConnectorType.Tesla,
                power_rating_kw=75,
                status=ChargingStationStatus.AVAILABLE,
                charging_rate=Decimal("0.35"),
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            ),
            ChargingStation(
                station_name="EV Charger 4",
                location_id=1,
                connector_type=ChargingConnectorType.Type2,
                power_rating_kw=22,
                status=ChargingStationStatus.AVAILABLE,
                charging_rate=Decimal("0.25"),
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            ),
        ]
        
        # Check if stations already exist
        from sqlalchemy import select
        for station in default_stations:
            stmt = select(ChargingStation).where(ChargingStation.station_name == station.station_name)
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            if not existing:
                session.add(station)
        
        logger.info(f"Added {len(default_stations)} default charging stations")
    
    async def _add_sample_data(self):
        """Add sample data for testing."""
        logger.info("Adding sample data...")
        
        async with get_db_session() as session:
            # Create sample users
            sample_users = [
                User(
                    username="john_doe",
                    email=Email("john@example.com"),
                    password_hash=self._hash_password("JohnDoe123!"),
                    first_name="John",
                    last_name="Doe",
                    role=UserRole.USER,
                    status=UserStatus.ACTIVE,
                    is_email_verified=True,
                    is_active=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                ),
                User(
                    username="jane_smith",
                    email=Email("jane@example.com"),
                    password_hash=self._hash_password("JaneSmith123!"),
                    first_name="Jane",
                    last_name="Smith",
                    role=UserRole.USER,
                    status=UserStatus.ACTIVE,
                    is_email_verified=True,
                    is_active=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                ),
                User(
                    username="manager",
                    email=Email("manager@example.com"),
                    password_hash=self._hash_password("Manager123!"),
                    first_name="Parking",
                    last_name="Manager",
                    role=UserRole.MANAGER,
                    status=UserStatus.ACTIVE,
                    is_email_verified=True,
                    is_active=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                ),
            ]
            
            # Add sample vehicles
            sample_vehicles = [
                Vehicle(
                    license_plate=LicensePlate("TES123", "CA", "US"),
                    make="Tesla",
                    model="Model 3",
                    year=2023,
                    color="White",
                    vehicle_type=VehicleType.ELECTRIC,
                    fuel_type="electric",
                    status=VehicleStatus.ACTIVE,
                    owner_id=1,
                    is_ev_charging_compatible=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                ),
                Vehicle(
                    license_plate=LicensePlate("HYB456", "CA", "US"),
                    make="Toyota",
                    model="Prius",
                    year=2022,
                    color="Blue",
                    vehicle_type=VehicleType.HYBRID,
                    fuel_type="hybrid",
                    status=VehicleStatus.ACTIVE,
                    owner_id=2,
                    is_ev_charging_compatible=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                ),
                Vehicle(
                    license_plate=LicensePlate("SUV789", "CA", "US"),
                    make="Ford",
                    model="Explorer",
                    year=2021,
                    color="Black",
                    vehicle_type=VehicleType.SUV,
                    fuel_type="gasoline",
                    status=VehicleStatus.ACTIVE,
                    owner_id=1,
                    is_ev_charging_compatible=False,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                ),
            ]
            
            # Add sample parking sessions
            sample_sessions = []
            for i in range(10):
                session = ParkingSession(
                    vehicle_id=(i % 2) + 1,
                    spot_id=(i % 20) + 1,
                    start_time=datetime.utcnow() - timedelta(hours=i*2),
                    end_time=datetime.utcnow() - timedelta(hours=i*2-1) if i % 2 == 0 else None,
                    status=ParkingSessionStatus.COMPLETED if i % 2 == 0 else ParkingSessionStatus.ACTIVE,
                    rate_id=1,
                    total_amount=Decimal("10.00") if i % 2 == 0 else None,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                sample_sessions.append(session)
            
            # Add sample payments
            sample_payments = [
                Payment(
                    amount=Money(Decimal("10.00"), "USD"),
                    session_id=1,
                    session_type="parking",
                    payment_method=PaymentMethod.CREDIT_CARD,
                    status=PaymentStatus.COMPLETED,
                    transaction_id=f"txn_{i}",
                    created_at=datetime.utcnow() - timedelta(days=i),
                    updated_at=datetime.utcnow() - timedelta(days=i)
                )
                for i in range(5)
            ]
            
            # Add sample notifications
            sample_notifications = [
                Notification(
                    user_id=1,
                    title="Welcome to Parking System",
                    message="Welcome! Your account has been created successfully.",
                    notification_type=NotificationType.INFO,
                    is_read=False,
                    created_at=datetime.utcnow() - timedelta(days=1)
                ),
                Notification(
                    user_id=1,
                    title="Parking Session Started",
                    message="Your parking session has started at spot A-101.",
                    notification_type=NotificationType.PARKING,
                    is_read=True,
                    created_at=datetime.utcnow() - timedelta(hours=2)
                ),
                Notification(
                    user_id=2,
                    title="Payment Confirmed",
                    message="Your payment of $10.00 has been confirmed.",
                    notification_type=NotificationType.PAYMENT,
                    is_read=False,
                    created_at=datetime.utcnow() - timedelta(hours=1)
                ),
            ]
            
            # Add all sample data
            for user in sample_users:
                from sqlalchemy import select
                stmt = select(User).where(User.email == user.email)
                result = await session.execute(stmt)
                existing = result.scalar_one_or_none()
                if not existing:
                    session.add(user)
            
            for vehicle in sample_vehicles:
                from sqlalchemy import select
                stmt = select(Vehicle).where(Vehicle.license_plate == vehicle.license_plate)
                result = await session.execute(stmt)
                existing = result.scalar_one_or_none()
                if not existing:
                    session.add(vehicle)
            
            for session_obj in sample_sessions:
                session.add(session_obj)
            
            for payment in sample_payments:
                session.add(payment)
            
            for notification in sample_notifications:
                session.add(notification)
            
            await session.commit()
            
            logger.info(f"Added sample data: {len(sample_users)} users, {len(sample_vehicles)} vehicles, "
                       f"{len(sample_sessions)} sessions, {len(sample_payments)} payments, "
                       f"{len(sample_notifications)} notifications")


# ============================================================================
# Main Execution
# ============================================================================

async def main():
    """Main entry point."""
    # Parse arguments
    global args
    args = parse_args()
    
    # Log startup
    logger.info("=" * 60)
    logger.info("Database Initialization Script")
    logger.info("=" * 60)
    logger.info(f"Environment: {args.environment}")
    logger.info(f"Seed Data: {args.seed_data}")
    logger.info(f"Force: {args.force}")
    logger.info(f"Sample Data: {args.sample_data}")
    logger.info(f"Admin Email: {args.admin_email}")
    logger.info("=" * 60)
    
    # Check environment
    if args.environment == "production" and not args.force:
        response = input("WARNING: You are about to initialize the production database. "
                        "This will overwrite existing data. Continue? (y/N): ")
        if response.lower() != 'y':
            logger.info("Operation cancelled")
            return
    
    # Initialize database
    initializer = DatabaseInitializer(
        environment=args.environment,
        force=args.force
    )
    
    success = await initializer.initialize()
    
    if success:
        logger.info("Database initialization completed successfully!")
        logger.info("=" * 60)
        logger.info(f"Admin credentials:")
        logger.info(f"  Email: {args.admin_email}")
        logger.info(f"  Password: {args.admin_password}")
        logger.info("=" * 60)
        logger.info("You can now start the application:")
        logger.info("  uvicorn src.main:app --reload")
    else:
        logger.error("Database initialization failed!")
        sys.exit(1)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Database initialization interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        sys.exit(1)