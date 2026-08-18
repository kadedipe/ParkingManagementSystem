#!/usr/bin/env python
# ============================================================================
# Seed Data Script
# ============================================================================

"""
Seed data script for the parking management system.

This script seeds the database with initial data including users, vehicles,
parking spots, charging stations, rates, and other required data for
different environments.
"""

import os
import sys
import asyncio
import logging
import random
from pathlib import Path
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, Dict, Any, List, Tuple
import argparse
import json
import uuid

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.shared.config import settings
from src.shared.logging import setup_logging, get_logger
from src.infrastructure.database import get_db_session, engine
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
    Location,
    PricingRule,
    Report,
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
        description="Seed data for parking management system"
    )
    parser.add_argument(
        "--environment",
        type=str,
        choices=["development", "staging", "production", "testing"],
        default="development",
        help="Environment to seed"
    )
    parser.add_argument(
        "--users",
        type=int,
        default=10,
        help="Number of users to create"
    )
    parser.add_argument(
        "--vehicles",
        type=int,
        default=20,
        help="Number of vehicles to create"
    )
    parser.add_argument(
        "--sessions",
        type=int,
        default=50,
        help="Number of parking sessions to create"
    )
    parser.add_argument(
        "--charging-sessions",
        type=int,
        default=20,
        help="Number of charging sessions to create"
    )
    parser.add_argument(
        "--payments",
        type=int,
        default=30,
        help="Number of payments to create"
    )
    parser.add_argument(
        "--clear-existing",
        action="store_true",
        default=False,
        help="Clear existing data before seeding"
    )
    parser.add_argument(
        "--config-file",
        type=str,
        default=None,
        help="JSON configuration file for custom data"
    )
    return parser.parse_args()


# ============================================================================
# Seed Data Generator
# ============================================================================

class SeedDataGenerator:
    """
    Seed data generator for creating realistic test data.
    """
    
    def __init__(self, environment: str = "development", config_file: Optional[str] = None):
        """
        Initialize the seed data generator.
        
        Args:
            environment: Environment name
            config_file: Optional JSON configuration file
        """
        self.environment = environment
        self.config_file = config_file
        self.config = self._load_config()
        self.session = None
        
        # Data generators
        self.user_counter = 0
        self.vehicle_counter = 0
        self.spot_counter = 0
        self.session_counter = 0
        
        # Realistic data pools
        self.first_names = [
            "James", "Mary", "John", "Patricia", "Robert", "Jennifer",
            "Michael", "Linda", "William", "Elizabeth", "David", "Barbara",
            "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah",
            "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
            "Matthew", "Betty", "Anthony", "Helen", "Mark", "Sandra",
            "Donald", "Donna", "Steven", "Carol", "Paul", "Ruth",
            "Andrew", "Sharon", "Joshua", "Michelle", "Kenneth", "Laura",
            "Kevin", "Sarah", "Brian", "Kimberly", "George", "Deborah",
            "Timothy", "Martha", "Ronald", "Cynthia", "Edward", "Angela",
            "Jason", "Amy", "Jeffrey", "Shirley", "Ryan", "Anna",
            "Jacob", "Rebecca", "Gary", "Virginia", "Nicholas", "Kathleen",
            "Eric", "Pamela", "Jonathan", "Martha", "Stephen", "Debra",
            "Larry", "Amanda", "Justin", "Stephanie", "Scott", "Carolyn",
            "Brandon", "Christine", "Benjamin", "Marie", "Samuel", "Janet",
            "Raymond", "Catherine", "Gregory", "Frances", "Frank", "Ann",
            "Patrick", "Joyce", "Alexander", "Diane", "Jack", "Alice",
            "Dennis", "Julie", "Jerry", "Heather", "Tyler", "Teresa",
            "Aaron", "Doris", "Jose", "Gloria", "Nathan", "Evelyn",
        ]
        
        self.last_names = [
            "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia",
            "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez",
            "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore",
            "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
            "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
            "Walker", "Young", "Allen", "King", "Wright", "Scott",
            "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams",
            "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
            "Carter", "Roberts", "Turner", "Phillips", "Evans", "Collins",
            "Edwards", "Stewart", "Morris", "Murphy", "Cook", "Rogers",
            "Morgan", "Peterson", "Cooper", "Reed", "Bailey", "Bell",
            "Howard", "Ward", "Cox", "Diaz", "Richardson", "Wood",
            "Watson", "Brooks", "Bennett", "Gray", "James", "Reyes",
            "Cruz", "Hughes", "Price", "Myers", "Long", "Foster",
            "Sanders", "Ross", "Powell", "Sullivan", "Russell", "Ortiz",
            "Jenkins", "Perry", "Butler", "Barnes", "Fisher", "Henderson",
            "Coleman", "Simmons", "Patterson", "Jordan", "Reynolds", "Hamilton",
        ]
        
        self.vehicle_makes = [
            "Toyota", "Honda", "Ford", "Chevrolet", "Tesla", "BMW",
            "Mercedes-Benz", "Audi", "Lexus", "Hyundai", "Kia", "Nissan",
            "Volkswagen", "Subaru", "Mazda", "Porsche", "Volvo", "Jaguar",
            "Land Rover", "Acura", "Infiniti", "Buick", "Chrysler", "Dodge",
            "Jeep", "Ram", "GMC", "Cadillac", "Lincoln", "Genesis",
        ]
        
        self.vehicle_models = {
            "Toyota": ["Camry", "Corolla", "RAV4", "Highlander", "Sienna", "Tacoma"],
            "Honda": ["Accord", "Civic", "CR-V", "Pilot", "Odyssey", "Passport"],
            "Ford": ["F-150", "Mustang", "Explorer", "Escape", "Bronco", "Ranger"],
            "Chevrolet": ["Silverado", "Malibu", "Equinox", "Tahoe", "Suburban", "Traverse"],
            "Tesla": ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
            "BMW": ["3 Series", "5 Series", "X3", "X5", "i4", "iX"],
            "Mercedes-Benz": ["C-Class", "E-Class", "GLC", "GLE", "EQS"],
            "Audi": ["A4", "A6", "Q5", "Q7", "e-tron", "Q4 e-tron"],
            "Hyundai": ["Sonata", "Elantra", "Tucson", "Santa Fe", "Palisade", "Ioniq"],
            "Kia": ["K5", "Soul", "Sportage", "Telluride", "EV6", "Niro"],
            "Nissan": ["Altima", "Maxima", "Rogue", "Pathfinder", "Leaf", "Ariya"],
            "Volkswagen": ["Jetta", "Passat", "Tiguan", "Atlas", "ID.4", "Golf"],
        }
        
        self.vehicle_colors = [
            "White", "Black", "Silver", "Gray", "Red", "Blue",
            "Green", "Yellow", "Orange", "Brown", "Beige", "Gold",
            "Purple", "Pink", "Teal", "Maroon", "Navy", "Charcoal",
        ]
        
        self.street_names = [
            "Main St", "Oak St", "Pine St", "Maple St", "Cedar St",
            "Elm St", "Washington St", "Lake St", "Hill St", "Park St",
            "Church St", "Market St", "Broadway", "Highland Ave", "Sunset Blvd",
            "University Ave", "College Ave", "River Rd", "Creek Rd", "Valley Rd",
            "Mountain View Dr", "Ocean Ave", "Forest Ln", "Meadow Ln", "Ridge Rd",
        ]
        
        self.cities = [
            "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
            "Philadelphia", "San Antonio", "San Diego", "Dallas", "Austin",
            "San Jose", "Fort Worth", "Jacksonville", "Columbus", "San Francisco",
            "Charlotte", "Indianapolis", "Seattle", "Denver", "Washington",
            "Boston", "El Paso", "Nashville", "Detroit", "Oklahoma City",
            "Portland", "Las Vegas", "Memphis", "Louisville", "Baltimore",
            "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Sacramento",
            "Kansas City", "Mesa", "Atlanta", "Omaha", "Colorado Springs",
            "Raleigh", "Miami", "Oakland", "Minneapolis", "Tulsa",
            "Wichita", "New Orleans", "Arlington", "Cleveland", "Bakersfield",
        ]
        
        self.states = ["CA", "TX", "FL", "NY", "IL", "PA", "OH", "GA", "NC", "MI"]
        
        self.spot_sections = ["A", "B", "C", "D", "E", "F", "G", "H"]
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from JSON file."""
        if self.config_file and os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Failed to load config file: {e}")
                return {}
        return {}
    
    def _get_random_item(self, items: List) -> Any:
        """Get a random item from a list."""
        return random.choice(items) if items else None
    
    def _get_random_items(self, items: List, count: int) -> List:
        """Get multiple random items from a list."""
        if not items:
            return []
        count = min(count, len(items))
        return random.sample(items, count)
    
    def _generate_unique_email(self, first_name: str, last_name: str) -> str:
        """Generate a unique email address."""
        domains = ["example.com", "test.com", "demo.com", "sample.com", "parking.com"]
        domain = random.choice(domains)
        unique_id = str(uuid.uuid4())[:6]
        email = f"{first_name.lower()}.{last_name.lower()}.{unique_id}@{domain}"
        return email
    
    def _generate_password(self) -> str:
        """Generate a random password."""
        # Generate a password with at least 8 characters, including uppercase, lowercase, digit, and special
        chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
        password = ''.join(random.choice(chars) for _ in range(12))
        return password
    
    async def _hash_password(self, password: str) -> str:
        """Hash a password."""
        import hashlib
        import base64
        return base64.b64encode(
            hashlib.sha256(password.encode()).digest()
        ).decode()
    
    # ========================================================================
    # User Generation
    # ========================================================================
    
    async def generate_users(self, count: int) -> List[User]:
        """Generate random users."""
        logger.info(f"Generating {count} users...")
        users = []
        
        for i in range(count):
            first_name = random.choice(self.first_names)
            last_name = random.choice(self.last_names)
            email = self._generate_unique_email(first_name, last_name)
            password = self._generate_password()
            
            # Randomly assign roles
            role_weights = [UserRole.USER] * 80 + [UserRole.MANAGER] * 15 + [UserRole.ADMIN] * 5
            role = random.choices(role_weights, k=1)[0]
            
            # Randomly assign status
            status_weights = [UserStatus.ACTIVE] * 85 + [UserStatus.INACTIVE] * 10 + [UserStatus.SUSPENDED] * 5
            status = random.choices(status_weights, k=1)[0]
            
            user = User(
                username=f"{first_name.lower()}_{last_name.lower()}_{self.user_counter}",
                email=Email(email),
                password_hash=await self._hash_password(password),
                first_name=first_name,
                last_name=last_name,
                role=role,
                status=status,
                is_email_verified=random.choice([True, False]),
                is_active=status == UserStatus.ACTIVE,
                phone=PhoneNumber(f"+1{random.randint(200, 999)}{random.randint(100, 999)}{random.randint(1000, 9999)}"),
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 180)),
                updated_at=datetime.utcnow(),
            )
            users.append(user)
            self.user_counter += 1
            
            # Log password for the first few users (for manual testing)
            if i < 5:
                logger.debug(f"User: {email}, Password: {password}")
        
        logger.info(f"Generated {len(users)} users")
        return users
    
    # ========================================================================
    # Vehicle Generation
    # ========================================================================
    
    async def generate_vehicles(self, count: int, user_ids: List[int]) -> List[Vehicle]:
        """Generate random vehicles."""
        logger.info(f"Generating {count} vehicles...")
        vehicles = []
        
        for i in range(count):
            make = random.choice(self.vehicle_makes)
            model = random.choice(self.vehicle_models.get(make, ["Model X"]))
            year = random.randint(2015, 2024)
            color = random.choice(self.vehicle_colors)
            
            # Vehicle type based on make/model
            if make in ["Tesla", "Hyundai", "Kia", "Nissan"] and model in ["Model 3", "Model Y", "Ioniq", "EV6", "Leaf", "Ariya"]:
                vehicle_type = VehicleType.ELECTRIC
                fuel_type = "electric"
                is_ev_charging_compatible = True
            elif make in ["Toyota", "Honda", "Ford"] and model in ["Prius", "Insight", "Fusion"]:
                vehicle_type = VehicleType.HYBRID
                fuel_type = "hybrid"
                is_ev_charging_compatible = True
            else:
                vehicle_type = random.choice([VehicleType.SEDAN, VehicleType.SUV, VehicleType.TRUCK])
                fuel_type = random.choice(["gasoline", "diesel"])
                is_ev_charging_compatible = False
            
            # Assign to random user (or None if no users)
            owner_id = random.choice(user_ids) if user_ids else None
            
            # License plate
            letters = ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ', k=3))
            numbers = ''.join(random.choices('0123456789', k=4))
            license_plate = f"{letters}{numbers}"
            
            vehicle = Vehicle(
                license_plate=LicensePlate(license_plate, random.choice(self.states), "US"),
                make=make,
                model=model,
                year=year,
                color=color,
                vehicle_type=vehicle_type,
                fuel_type=fuel_type,
                vehicle_size=random.choice(["compact", "standard", "large", "extra_large"]),
                status=VehicleStatus.ACTIVE,
                owner_id=owner_id,
                is_ev_charging_compatible=is_ev_charging_compatible,
                vin=f"{''.join(random.choices('ABCDEFGHJKLMNPRSTUVWXYZ1234567890', k=17))}",
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 180)),
                updated_at=datetime.utcnow(),
            )
            vehicles.append(vehicle)
            self.vehicle_counter += 1
        
        logger.info(f"Generated {len(vehicles)} vehicles")
        return vehicles
    
    # ========================================================================
    # Parking Spot Generation
    # ========================================================================
    
    async def generate_parking_spots(self, count: int) -> List[ParkingSpot]:
        """Generate parking spots."""
        logger.info(f"Generating {count} parking spots...")
        spots = []
        
        for i in range(count):
            section = random.choice(self.spot_sections)
            floor = random.randint(1, 5)
            number = f"{section}{floor:02d}{i:03d}"
            
            spot_types = [
                ParkingSpotType.STANDARD,
                ParkingSpotType.STANDARD,
                ParkingSpotType.STANDARD,
                ParkingSpotType.COMPACT,
                ParkingSpotType.HANDICAPPED,
                ParkingSpotType.EV_CHARGING,
                ParkingSpotType.PREMIUM,
            ]
            spot_type = random.choice(spot_types)
            
            # Status with realistic distribution
            status_weights = [
                ParkingSpotStatus.AVAILABLE,
                ParkingSpotStatus.AVAILABLE,
                ParkingSpotStatus.AVAILABLE,
                ParkingSpotStatus.OCCUPIED,
                ParkingSpotStatus.RESERVED,
                ParkingSpotStatus.MAINTENANCE,
            ]
            status = random.choices(status_weights, k=1)[0]
            
            spot = ParkingSpot(
                spot_number=number,
                floor=floor,
                section=section,
                spot_type=spot_type,
                status=status,
                access_level="public",
                is_covered=random.choice([True, False]),
                is_handicap_accessible=(spot_type == ParkingSpotType.HANDICAPPED),
                is_ev_charging=(spot_type == ParkingSpotType.EV_CHARGING),
                has_cctv=random.choice([True, False, True]),
                location_id=1,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
                updated_at=datetime.utcnow(),
            )
            spots.append(spot)
            self.spot_counter += 1
        
        logger.info(f"Generated {len(spots)} parking spots")
        return spots
    
    # ========================================================================
    # Charging Station Generation
    # ========================================================================
    
    async def generate_charging_stations(self, count: int) -> List[ChargingStation]:
        """Generate charging stations."""
        logger.info(f"Generating {count} charging stations...")
        stations = []
        
        connector_types = [
            ChargingConnectorType.CCS,
            ChargingConnectorType.CHAdeMO,
            ChargingConnectorType.Type2,
            ChargingConnectorType.Tesla,
            ChargingConnectorType.GB_T,
        ]
        
        station_names = [
            "EV Station Alpha", "EV Station Beta", "EV Station Gamma",
            "EcoCharge", "PowerUp", "VoltCharge", "ElectroHub",
            "GreenCharge", "SparkStation", "EnergyPoint",
        ]
        
        for i in range(count):
            connector = random.choice(connector_types)
            power = random.choice([22, 50, 75, 100, 150, 200, 250])
            
            status_weights = [
                ChargingStationStatus.AVAILABLE,
                ChargingStationStatus.AVAILABLE,
                ChargingStationStatus.AVAILABLE,
                ChargingStationStatus.OCCUPIED,
                ChargingStationStatus.MAINTENANCE,
            ]
            status = random.choices(status_weights, k=1)[0]
            
            station = ChargingStation(
                station_name=random.choice(station_names),
                location_id=1,
                connector_type=connector,
                power_rating_kw=power,
                status=status,
                charging_rate=Decimal(str(round(random.uniform(0.15, 0.50), 2))),
                is_active=status != ChargingStationStatus.MAINTENANCE,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
                updated_at=datetime.utcnow(),
            )
            stations.append(station)
        
        logger.info(f"Generated {len(stations)} charging stations")
        return stations
    
    # ========================================================================
    # Rates Generation
    # ========================================================================
    
    async def generate_rates(self) -> List[Rate]:
        """Generate parking and charging rates."""
        logger.info("Generating rates...")
        rates = []
        
        # Parking rates
        parking_rates = [
            ("Standard Hourly", "hourly", Decimal("5.00"), 15, ["standard", "compact"]),
            ("Premium Hourly", "hourly", Decimal("10.00"), 15, ["premium", "reserved"]),
            ("Daily Flat", "daily", Decimal("30.00"), 30, []),
            ("Weekly Flat", "weekly", Decimal("150.00"), 30, []),
            ("Monthly Flat", "monthly", Decimal("500.00"), 60, []),
            ("Valet Parking", "hourly", Decimal("15.00"), 10, ["valet"]),
            ("EV Charging Spot", "hourly", Decimal("8.00"), 15, ["ev_charging"]),
            ("Overnight", "daily", Decimal("20.00"), 60, []),
        ]
        
        for name, rate_type, amount, grace, spot_types in parking_rates:
            rate = Rate(
                name=name,
                rate_type=rate_type,
                amount=amount,
                currency="USD",
                description=f"{name} parking rate",
                is_active=True,
                grace_period=grace,
                applies_to_spot_types=spot_types,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 60)),
                updated_at=datetime.utcnow(),
            )
            rates.append(rate)
        
        # Charging rates
        charging_rates = [
            ("Standard Charging", "hourly", Decimal("0.30"), 0, [], ["ev", "hybrid"]),
            ("Premium Charging", "hourly", Decimal("0.50"), 0, [], ["ev"]),
            ("Fast Charging", "hourly", Decimal("0.60"), 0, [], ["ev"]),
            ("Slow Charging", "hourly", Decimal("0.20"), 0, [], ["ev", "hybrid"]),
            ("Overnight Charging", "daily", Decimal("15.00"), 0, [], ["ev"]),
        ]
        
        for name, rate_type, amount, grace, spot_types, vehicle_types in charging_rates:
            rate = Rate(
                name=name,
                rate_type=rate_type,
                amount=amount,
                currency="USD",
                description=f"{name} charging rate",
                is_active=True,
                grace_period=grace,
                applies_to_spot_types=spot_types,
                applies_to_vehicle_types=vehicle_types,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 60)),
                updated_at=datetime.utcnow(),
            )
            rates.append(rate)
        
        logger.info(f"Generated {len(rates)} rates")
        return rates
    
    # ========================================================================
    # Parking Session Generation
    # ========================================================================
    
    async def generate_parking_sessions(
        self,
        count: int,
        vehicle_ids: List[int],
        spot_ids: List[int],
        rate_ids: List[int],
        user_ids: List[int]
    ) -> List[ParkingSession]:
        """Generate parking sessions."""
        logger.info(f"Generating {count} parking sessions...")
        sessions = []
        
        for i in range(count):
            vehicle_id = random.choice(vehicle_ids) if vehicle_ids else None
            spot_id = random.choice(spot_ids) if spot_ids else None
            rate_id = random.choice(rate_ids) if rate_ids else None
            
            # Random date within the last 30 days
            start_time = datetime.utcnow() - timedelta(
                days=random.randint(1, 30),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            # Random duration
            duration_hours = random.randint(1, 8)
            end_time = start_time + timedelta(hours=duration_hours)
            
            # Status distribution
            status_weights = [
                ParkingSessionStatus.COMPLETED,
                ParkingSessionStatus.COMPLETED,
                ParkingSessionStatus.COMPLETED,
                ParkingSessionStatus.COMPLETED,
                ParkingSessionStatus.ACTIVE,
                ParkingSessionStatus.CANCELLED,
                ParkingSessionStatus.EXPIRED,
            ]
            status = random.choices(status_weights, k=1)[0]
            
            # Calculate amount
            amount = Decimal(str(round(random.uniform(5.00, 50.00), 2)))
            
            session = ParkingSession(
                vehicle_id=vehicle_id,
                spot_id=spot_id,
                rate_id=rate_id,
                start_time=start_time,
                end_time=end_time if status != ParkingSessionStatus.ACTIVE else None,
                status=status,
                total_amount=amount if status == ParkingSessionStatus.COMPLETED else None,
                created_at=start_time,
                updated_at=end_time if status == ParkingSessionStatus.COMPLETED else datetime.utcnow(),
            )
            sessions.append(session)
            self.session_counter += 1
        
        logger.info(f"Generated {len(sessions)} parking sessions")
        return sessions
    
    # ========================================================================
    # Charging Session Generation
    # ========================================================================
    
    async def generate_charging_sessions(
        self,
        count: int,
        vehicle_ids: List[int],
        station_ids: List[int],
        rate_ids: List[int]
    ) -> List[ChargingSession]:
        """Generate charging sessions."""
        logger.info(f"Generating {count} charging sessions...")
        sessions = []
        
        for i in range(count):
            vehicle_id = random.choice(vehicle_ids) if vehicle_ids else None
            station_id = random.choice(station_ids) if station_ids else None
            rate_id = random.choice(rate_ids) if rate_ids else None
            
            # Random date within the last 30 days
            start_time = datetime.utcnow() - timedelta(
                days=random.randint(1, 30),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            # Random duration (30 min to 3 hours)
            duration_minutes = random.randint(30, 180)
            end_time = start_time + timedelta(minutes=duration_minutes)
            
            # Energy consumed
            energy_kwh = Decimal(str(round(random.uniform(5.0, 50.0), 1)))
            
            # Status distribution
            status_weights = [
                ParkingSessionStatus.COMPLETED,
                ParkingSessionStatus.COMPLETED,
                ParkingSessionStatus.COMPLETED,
                ParkingSessionStatus.ACTIVE,
                ParkingSessionStatus.CANCELLED,
            ]
            status = random.choices(status_weights, k=1)[0]
            
            # Connector type
            connector = random.choice([
                ChargingConnectorType.CCS,
                ChargingConnectorType.CHAdeMO,
                ChargingConnectorType.Type2,
                ChargingConnectorType.Tesla,
            ])
            
            session = ChargingSession(
                vehicle_id=vehicle_id,
                station_id=station_id,
                rate_id=rate_id,
                start_time=start_time,
                end_time=end_time if status != ParkingSessionStatus.ACTIVE else None,
                status=status,
                connector_type=connector,
                energy_consumed_kwh=energy_kwh if status == ParkingSessionStatus.COMPLETED else None,
                max_power_kw=random.choice([22, 50, 75, 100, 150]),
                created_at=start_time,
                updated_at=end_time if status == ParkingSessionStatus.COMPLETED else datetime.utcnow(),
            )
            sessions.append(session)
        
        logger.info(f"Generated {len(sessions)} charging sessions")
        return sessions
    
    # ========================================================================
    # Payment Generation
    # ========================================================================
    
    async def generate_payments(
        self,
        count: int,
        session_ids: List[int],
        user_ids: List[int]
    ) -> List[Payment]:
        """Generate payments."""
        logger.info(f"Generating {count} payments...")
        payments = []
        
        for i in range(count):
            amount = Decimal(str(round(random.uniform(5.00, 100.00), 2)))
            session_id = random.choice(session_ids) if session_ids else None
            
            # Payment methods
            methods = [
                PaymentMethod.CREDIT_CARD,
                PaymentMethod.CREDIT_CARD,
                PaymentMethod.CREDIT_CARD,
                PaymentMethod.DEBIT_CARD,
                PaymentMethod.PAYPAL,
                PaymentMethod.APPLE_PAY,
                PaymentMethod.GOOGLE_PAY,
                PaymentMethod.CRYPTO,
            ]
            method = random.choice(methods)
            
            # Status distribution
            status_weights = [
                PaymentStatus.COMPLETED,
                PaymentStatus.COMPLETED,
                PaymentStatus.COMPLETED,
                PaymentStatus.COMPLETED,
                PaymentStatus.COMPLETED,
                PaymentStatus.PENDING,
                PaymentStatus.FAILED,
                PaymentStatus.REFUNDED,
            ]
            status = random.choices(status_weights, k=1)[0]
            
            payment = Payment(
                amount=Money(amount, "USD"),
                session_id=session_id,
                session_type=random.choice(["parking", "charging"]),
                payment_method=method,
                status=status,
                transaction_id=f"txn_{uuid.uuid4().hex[:12]}",
                failure_reason="Declined" if status == PaymentStatus.FAILED else None,
                refund_amount=amount if status == PaymentStatus.REFUNDED else None,
                refund_reason="Customer request" if status == PaymentStatus.REFUNDED else None,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
                updated_at=datetime.utcnow(),
            )
            payments.append(payment)
        
        logger.info(f"Generated {len(payments)} payments")
        return payments
    
    # ========================================================================
    # Notification Generation
    # ========================================================================
    
    async def generate_notifications(self, count: int, user_ids: List[int]) -> List[Notification]:
        """Generate notifications."""
        logger.info(f"Generating {count} notifications...")
        notifications = []
        
        notification_types = [
            NotificationType.INFO,
            NotificationType.PARKING,
            NotificationType.CHARGING,
            NotificationType.PAYMENT,
            NotificationType.SYSTEM,
            NotificationType.ALERT,
            NotificationType.REMINDER,
        ]
        
        messages = [
            "Your parking session has started.",
            "Your parking session has ended.",
            "Payment confirmed: ${amount}",
            "Payment failed: ${amount}",
            "New charging session started.",
            "Charging session completed.",
            "Reservation confirmed.",
            "Reservation cancelled.",
            "Parking spot {spot} is now available.",
            "System maintenance scheduled.",
            "New feature available!",
            "Your account has been updated.",
            "Security alert: New login detected.",
            "Welcome to the parking system!",
            "Your session is about to expire.",
        ]
        
        for i in range(count):
            user_id = random.choice(user_ids) if user_ids else None
            notification_type = random.choice(notification_types)
            
            # Generate message with placeholders
            message_template = random.choice(messages)
            message = message_template.format(
                amount=round(random.uniform(5.00, 100.00), 2),
                spot=f"{random.choice(['A', 'B', 'C'])}{random.randint(1, 50)}"
            )
            
            notification = Notification(
                user_id=user_id,
                title=f"{notification_type.value.title()} Notification",
                message=message,
                notification_type=notification_type,
                is_read=random.choice([True, False]),
                read_at=datetime.utcnow() if random.choice([True, False]) else None,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 7)),
                updated_at=datetime.utcnow(),
            )
            notifications.append(notification)
        
        logger.info(f"Generated {len(notifications)} notifications")
        return notifications
    
    # ========================================================================
    # Settings Generation
    # ========================================================================
    
    async def generate_settings(self) -> List[Setting]:
        """Generate system settings."""
        logger.info("Generating settings...")
        settings_data = []
        
        default_settings = [
            ("system_name", "Parking Management System", "general", "System name", True),
            ("system_timezone", "UTC", "general", "System timezone", True),
            ("maintenance_mode", "false", "system", "Maintenance mode", True),
            ("max_parking_duration_hours", "24", "parking", "Maximum parking duration in hours", False),
            ("reservation_lead_time_minutes", "30", "parking", "Minimum lead time for reservations", True),
            ("reservation_max_days_ahead", "7", "parking", "Maximum days ahead for reservations", True),
            ("default_currency", "USD", "payment", "Default currency", True),
            ("enable_dynamic_pricing", "false", "parking", "Enable dynamic pricing", False),
            ("notification_enabled", "true", "notification", "Enable notifications", True),
            ("max_occupancy_threshold", "90", "parking", "Maximum occupancy threshold percentage", False),
            ("email_enabled", "true", "notification", "Enable email notifications", True),
            ("sms_enabled", "false", "notification", "Enable SMS notifications", True),
            ("push_enabled", "true", "notification", "Enable push notifications", True),
            ("session_timeout_minutes", "60", "system", "Session timeout in minutes", False),
            ("max_login_attempts", "5", "security", "Maximum login attempts", False),
            ("lockout_duration_minutes", "30", "security", "Account lockout duration in minutes", False),
            ("password_policy_min_length", "8", "security", "Minimum password length", False),
            ("password_policy_require_special", "true", "security", "Require special characters", False),
            ("enable_audit_logs", "true", "system", "Enable audit logging", True),
            ("data_retention_days", "365", "system", "Data retention period in days", False),
        ]
        
        for key, value, category, description, is_public in default_settings:
            setting = Setting(
                key=key,
                value=value,
                category=category,
                description=description,
                is_public=is_public,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            settings_data.append(setting)
        
        logger.info(f"Generated {len(settings_data)} settings")
        return settings_data


# ============================================================================
# Main Execution
# ============================================================================

class SeedDataManager:
    """
    Manages the seeding of data into the database.
    """
    
    def __init__(self, args):
        """
        Initialize the seed data manager.
        
        Args:
            args: Command line arguments
        """
        self.args = args
        self.generator = SeedDataGenerator(
            environment=args.environment,
            config_file=args.config_file
        )
        self.session = None
    
    async def clear_existing_data(self, session):
        """Clear existing data from tables."""
        logger.info("Clearing existing data...")
        
        # Delete in reverse order to avoid foreign key violations
        tables = [
            "payments",
            "parking_sessions",
            "charging_sessions",
            "reservations",
            "notifications",
            "audit_logs",
            "reports",
            "vehicles",
            "users",
            "parking_spots",
            "charging_stations",
            "rates",
            "settings",
            "pricing_rules",
            "locations",
        ]
        
        for table in tables:
            try:
                await session.execute(f"TRUNCATE TABLE {table} CASCADE")
                logger.debug(f"Cleared table: {table}")
            except Exception as e:
                logger.warning(f"Could not clear table {table}: {e}")
        
        await session.commit()
        logger.info("Existing data cleared")
    
    async def seed_data(self):
        """Seed data into the database."""
        logger.info("Starting data seeding...")
        
        async with get_db_session() as session:
            self.session = session
            
            try:
                # Clear existing data if requested
                if self.args.clear_existing:
                    await self.clear_existing_data(session)
                
                # Check if data already exists
                from sqlalchemy import select
                user_count_stmt = select(User)
                user_count_result = await session.execute(user_count_stmt)
                existing_users = user_count_result.scalars().all()
                
                if existing_users and not self.args.clear_existing:
                    logger.info(f"Found {len(existing_users)} existing users. Use --clear-existing to overwrite.")
                    return
                
                # 1. Create users
                users = await self.generator.generate_users(self.args.users)
                for user in users:
                    session.add(user)
                await session.flush()
                user_ids = [user.id for user in users]
                logger.info(f"Added {len(users)} users to database")
                
                # 2. Create settings
                settings_data = await self.generator.generate_settings()
                for setting in settings_data:
                    # Check if setting exists
                    stmt = select(Setting).where(Setting.key == setting.key)
                    result = await session.execute(stmt)
                    existing = result.scalar_one_or_none()
                    if not existing:
                        session.add(setting)
                await session.flush()
                logger.info(f"Added settings to database")
                
                # 3. Create rates
                rates = await self.generator.generate_rates()
                for rate in rates:
                    # Check if rate exists
                    stmt = select(Rate).where(Rate.name == rate.name)
                    result = await session.execute(stmt)
                    existing = result.scalar_one_or_none()
                    if not existing:
                        session.add(rate)
                await session.flush()
                rate_ids = [rate.id for rate in rates]
                logger.info(f"Added {len(rates)} rates to database")
                
                # 4. Create parking spots
                spots = await self.generator.generate_parking_spots(50)
                for spot in spots:
                    # Check if spot exists
                    stmt = select(ParkingSpot).where(ParkingSpot.spot_number == spot.spot_number)
                    result = await session.execute(stmt)
                    existing = result.scalar_one_or_none()
                    if not existing:
                        session.add(spot)
                await session.flush()
                spot_ids = [spot.id for spot in spots]
                logger.info(f"Added {len(spots)} parking spots to database")
                
                # 5. Create charging stations
                stations = await self.generator.generate_charging_stations(10)
                for station in stations:
                    session.add(station)
                await session.flush()
                station_ids = [station.id for station in stations]
                logger.info(f"Added {len(stations)} charging stations to database")
                
                # 6. Create vehicles
                vehicles = await self.generator.generate_vehicles(self.args.vehicles, user_ids)
                for vehicle in vehicles:
                    session.add(vehicle)
                await session.flush()
                vehicle_ids = [vehicle.id for vehicle in vehicles]
                logger.info(f"Added {len(vehicles)} vehicles to database")
                
                # 7. Create parking sessions
                sessions = await self.generator.generate_parking_sessions(
                    self.args.sessions,
                    vehicle_ids,
                    spot_ids,
                    rate_ids,
                    user_ids
                )
                for session_obj in sessions:
                    session.add(session_obj)
                await session.flush()
                session_ids = [session_obj.id for session_obj in sessions]
                logger.info(f"Added {len(sessions)} parking sessions to database")
                
                # 8. Create charging sessions
                charging_sessions = await self.generator.generate_charging_sessions(
                    self.args.charging_sessions,
                    vehicle_ids,
                    station_ids,
                    rate_ids
                )
                for csession in charging_sessions:
                    session.add(csession)
                await session.flush()
                charging_session_ids = [csession.id for csession in charging_sessions]
                logger.info(f"Added {len(charging_sessions)} charging sessions to database")
                
                # 9. Create payments
                all_session_ids = session_ids + charging_session_ids
                payments = await self.generator.generate_payments(
                    self.args.payments,
                    all_session_ids,
                    user_ids
                )
                for payment in payments:
                    session.add(payment)
                await session.flush()
                logger.info(f"Added {len(payments)} payments to database")
                
                # 10. Create notifications
                notifications = await self.generator.generate_notifications(
                    min(self.args.users * 2, 50),
                    user_ids
                )
                for notification in notifications:
                    session.add(notification)
                await session.flush()
                logger.info(f"Added {len(notifications)} notifications to database")
                
                # Commit all changes
                await session.commit()
                
                logger.info("=" * 60)
                logger.info("DATA SEEDING COMPLETED SUCCESSFULLY")
                logger.info("=" * 60)
                logger.info(f"Users: {len(users)}")
                logger.info(f"Vehicles: {len(vehicles)}")
                logger.info(f"Parking Spots: {len(spots)}")
                logger.info(f"Charging Stations: {len(stations)}")
                logger.info(f"Rates: {len(rates)}")
                logger.info(f"Parking Sessions: {len(sessions)}")
                logger.info(f"Charging Sessions: {len(charging_sessions)}")
                logger.info(f"Payments: {len(payments)}")
                logger.info(f"Notifications: {len(notifications)}")
                logger.info("=" * 60)
                
            except Exception as e:
                logger.error(f"Error during seeding: {e}", exc_info=True)
                await session.rollback()
                raise


async def main():
    """Main entry point."""
    # Parse arguments
    args = parse_args()
    
    # Log startup
    logger.info("=" * 60)
    logger.info("Data Seeding Script")
    logger.info("=" * 60)
    logger.info(f"Environment: {args.environment}")
    logger.info(f"Users: {args.users}")
    logger.info(f"Vehicles: {args.vehicles}")
    logger.info(f"Parking Sessions: {args.sessions}")
    logger.info(f"Charging Sessions: {args.charging_sessions}")
    logger.info(f"Payments: {args.payments}")
    logger.info(f"Clear Existing: {args.clear_existing}")
    logger.info("=" * 60)
    
    # Check environment
    if args.environment == "production":
        response = input("WARNING: You are about to seed the production database. Continue? (y/N): ")
        if response.lower() != 'y':
            logger.info("Operation cancelled")
            return
    
    # Run seeding
    manager = SeedDataManager(args)
    await manager.seed_data()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Seeding interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        sys.exit(1)