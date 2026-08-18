# 🚗 Parking Management System - Backend

<div align="center">

![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-teal.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)
![Docker](https://img.shields.io/badge/Docker-24.0+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)

**Production-ready FastAPI backend for the Parking Management System**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [API Documentation](#-api-documentation) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Database](#-database)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Monitoring](#-monitoring)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

The Parking Management System Backend is a high-performance, production-ready API built with FastAPI. It provides comprehensive parking management capabilities including lot management, vehicle tracking, EV charging, and real-time updates.

### Key Capabilities

- **🚗 Parking Management**: Full CRUD operations for parking lots and slots
- **🔌 EV Charging**: Complete charging station and session management
- **📊 Real-time Updates**: WebSocket support for live status updates
- **🔐 Security**: JWT authentication, rate limiting, CORS
- **📈 Analytics**: Comprehensive reporting and metrics
- **⚡ Performance**: Async/await, connection pooling, caching

---

## ✨ Features

### Core Features

#### Parking Management
- Create, read, update, delete parking lots
- Manage parking slots with different types (Regular, EV, Disabled)
- Real-time slot availability tracking
- Smart parking allocation algorithms
- Parking session management
- Automated ticket generation

#### EV Charging
- Manage charging stations
- Start/stop charging sessions
- Real-time charge status monitoring
- Energy consumption tracking
- Charging cost calculation
- Station availability management

#### Vehicle Management
- Vehicle registration and tracking
- Vehicle history
- License plate recognition
- Vehicle type classification

#### User Management
- JWT-based authentication
- Role-based access control (Admin, Manager, User)
- User profile management
- Password reset functionality

### Advanced Features

#### Real-time Updates
- WebSocket connections for live updates
- Real-time slot availability
- Instant notifications
- Live charging status

#### Analytics & Reporting
- Occupancy analytics
- Revenue reporting
- Charging statistics
- Custom report generation

#### Security
- JWT authentication with refresh tokens
- Rate limiting on all endpoints
- CORS configuration
- Input validation
- SQL injection protection
- XSS protection

---

## 🛠️ Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | Programming language |
| FastAPI | 0.104+ | Web framework |
| Uvicorn | 0.24+ | ASGI server |
| Pydantic | 2.4+ | Data validation |

### Database & Caching
| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | 15+ | Primary database |
| MongoDB | 6+ | EV charging data |
| Redis | 7+ | Caching & sessions |
| SQLAlchemy | 2.0+ | ORM |
| Alembic | 1.12+ | Migrations |

### Message Queue
| Technology | Version | Purpose |
|------------|---------|---------|
| Kafka | 3.4+ | Event streaming |
| Celery | 5.3+ | Task queue |
| Redis | 7+ | Broker/backend |

### Monitoring & Logging
| Technology | Version | Purpose |
|------------|---------|---------|
| Sentry | Latest | Error tracking |
| Prometheus | Latest | Metrics |
| Grafana | Latest | Visualization |
| ELK Stack | Latest | Logging |

---

## 🏗️ Architecture

### High-Level Architecture
┌─────────────────────────────────────────────────────────────┐
│ API Gateway (Nginx) │
│ Routing • Rate Limiting • CORS │
└─────────────────────────────────────────────────────────────┘
│
┌─────────────────────┼─────────────────────┐
│ │ │
▼ ▼ ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ Parking │ │ Charging │ │ Vehicle │
│ Service │ │ Service │ │ Service │
└───────────────┘ └───────────────┘ └───────────────┘
│ │ │
└─────────────────────┼─────────────────────┘
│
▼
┌─────────────────┐
│ Notification │
│ Service │
└─────────────────┘
│
▼
┌─────────────────┐
│ Message Bus │
│ (Kafka) │
└─────────────────┘

text

### Design Patterns Used

| Pattern | Purpose |
|---------|---------|
| **Repository Pattern** | Data access abstraction |
| **Strategy Pattern** | Parking allocation algorithms |
| **Factory Pattern** | Object creation |
| **Observer Pattern** | Event-driven architecture |
| **Singleton Pattern** | Service instances |
| **Dependency Injection** | Loose coupling |

---

## 📁 Project Structure
backend/
├── src/
│ ├── init.py
│ ├── main.py # Application entry point
│ ├── app.py # FastAPI app configuration
│ │
│ ├── domain/ # Domain Layer (DDD)
│ │ ├── init.py
│ │ ├── models.py # Domain entities
│ │ ├── value_objects.py # Value objects
│ │ ├── enums.py # Enumerations
│ │ └── interfaces.py # Domain interfaces
│ │
│ ├── application/ # Application Layer
│ │ ├── init.py
│ │ ├── services/ # Application services
│ │ │ ├── parking_service.py
│ │ │ ├── charging_service.py
│ │ │ └── vehicle_service.py
│ │ ├── dto/ # Data Transfer Objects
│ │ │ ├── parking_dto.py
│ │ │ └── vehicle_dto.py
│ │ └── use_cases/ # Use cases
│ │ ├── park_vehicle.py
│ │ └── remove_vehicle.py
│ │
│ ├── infrastructure/ # Infrastructure Layer
│ │ ├── init.py
│ │ ├── database/
│ │ │ ├── postgres_client.py
│ │ │ └── mongodb_client.py
│ │ ├── repositories/
│ │ │ ├── parking_repository.py
│ │ │ └── vehicle_repository.py
│ │ └── message_bus/
│ │ ├── kafka_producer.py
│ │ └── kafka_consumer.py
│ │
│ └── interfaces/ # Interfaces Layer
│ ├── api/
│ │ ├── v1/
│ │ │ ├── parking_routes.py
│ │ │ ├── charging_routes.py
│ │ │ └── vehicle_routes.py
│ │ └── dependencies.py
│ ├── middleware/
│ │ ├── auth.py
│ │ └── error_handler.py
│ └── schemas/
│ ├── parking_schemas.py
│ └── vehicle_schemas.py
│
├── tests/ # Tests
│ ├── unit/
│ ├── integration/
│ └── e2e/
│
├── scripts/ # Utility scripts
│ ├── init_db.py
│ └── seed_data.py
│
├── alembic/ # Database migrations
│ ├── versions/
│ └── env.py
│
├── alembic.ini # Alembic configuration
├── pyproject.toml # Project configuration
├── requirements.txt # Dependencies
├── Dockerfile # Docker build
└── .env.example # Environment variables example

text

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- PostgreSQL 15+
- Redis 7+
- MongoDB 6+ (optional)
- Docker & Docker Compose (optional)

### Local Development

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/parking-management-system.git
cd parking-management-system/backend
2. Create Virtual Environment
bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
3. Install Dependencies
bash
pip install -r requirements.txt
4. Configure Environment
bash
cp .env.example .env
# Edit .env with your configuration
5. Initialize Database
bash
# Run migrations
alembic upgrade head

# Seed test data
python scripts/seed_data.py
6. Start the Server
bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
Docker Development
bash
# Build and start containers
docker-compose up -d

# Run migrations
docker-compose exec backend alembic upgrade head

# Seed database
docker-compose exec backend python scripts/seed_data.py

# View logs
docker-compose logs -f backend
⚙️ Configuration
Environment Variables
env
# Application
APP_NAME=Parking Management System
APP_ENV=development
APP_DEBUG=true
APP_SECRET_KEY=your-secret-key

# Server
BACKEND_PORT=8000
API_PREFIX=/api/v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/parking_db
MONGODB_URI=mongodb://localhost:27017/charging_db
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-jwt-secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# Kafka
KAFKA_BROKERS=localhost:9092

# Sentry
SENTRY_DSN=your-sentry-dsn

# Logging
LOG_LEVEL=info
🗄️ Database
Migrations
bash
# Create a new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Show migration history
alembic history
Seeding
bash
# Seed development data
python scripts/seed_data.py

# Seed specific data
python scripts/seed_data.py --env development
python scripts/seed_data.py --env production
Schema
The database schema includes:

parking_lots: Parking facility information

parking_slots: Individual parking spaces

bookings: Parking session records

vehicles: Vehicle registry

charging_stations: EV charging stations

charging_sessions: Charging session records

users: User accounts

notifications: System notifications

📚 API Documentation
Interactive Documentation
Once the server is running, access:

Swagger UI: http://localhost:8000/docs

ReDoc: http://localhost:8000/redoc

API Endpoints
Parking Endpoints
Method	Endpoint	Description
POST	/api/v1/parking/lots	Create parking lot
GET	/api/v1/parking/lots	Get all lots
GET	/api/v1/parking/lots/{id}	Get lot details
PUT	/api/v1/parking/lots/{id}	Update lot
DELETE	/api/v1/parking/lots/{id}	Delete lot
POST	/api/v1/parking/park	Park vehicle
POST	/api/v1/parking/remove	Remove vehicle
GET	/api/v1/parking/lots/{id}/status	Get lot status
Charging Endpoints
Method	Endpoint	Description
POST	/api/v1/charging/stations	Create station
GET	/api/v1/charging/stations	Get all stations
POST	/api/v1/charging/sessions	Start charging
PUT	/api/v1/charging/sessions/{id}	Stop charging
GET	/api/v1/charging/stations/{id}/status	Get station status
Vehicle Endpoints
Method	Endpoint	Description
POST	/api/v1/vehicles	Register vehicle
GET	/api/v1/vehicles/{plate}	Get vehicle
GET	/api/v1/vehicles/{plate}/history	Get parking history
Authentication Endpoints
Method	Endpoint	Description
POST	/api/v1/auth/register	Register user
POST	/api/v1/auth/login	Login
POST	/api/v1/auth/refresh	Refresh token
POST	/api/v1/auth/logout	Logout
🧪 Testing
Running Tests
bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/unit/test_parking_service.py

# Run specific test
pytest tests/unit/test_parking_service.py::test_park_vehicle
Test Structure
text
tests/
├── unit/                    # Unit tests
│   ├── test_models.py
│   ├── test_services.py
│   └── test_utils.py
├── integration/             # Integration tests
│   ├── test_api.py
│   └── test_database.py
└── e2e/                     # End-to-end tests
    └── test_flows.py
Test Coverage
bash
# Generate coverage report
pytest --cov=src --cov-report=html

# Open coverage report
open htmlcov/index.html
🚀 Deployment
Docker Deployment
bash
# Build Docker image
docker build -t parking-backend .

# Run container
docker run -d -p 8000:8000 --env-file .env parking-backend
Docker Compose
bash
# Start with Docker Compose
docker-compose up -d

# Scale services
docker-compose up -d --scale backend=3
Kubernetes
bash
# Apply configurations
kubectl apply -f infra/kubernetes/

# Check deployment
kubectl get pods -n parking-system
Production Checklist
□ Environment variables configured
□ Database migrations applied
□ SSL certificates installed
□ Load balancer configured
□ Monitoring setup
□ Backup strategy implemented
□ Rate limiting configured
□ Security headers enabled
□ Health checks configured
📊 Monitoring
Health Checks
bash
# Application health
curl http://localhost:8000/health

# Database health
curl http://localhost:8000/health/db

# Redis health
curl http://localhost:8000/health/redis

# Full system health
curl http://localhost:8000/health/system
Metrics (Prometheus)
bash
# Access metrics
curl http://localhost:8000/metrics
Logging
bash
# View application logs
tail -f logs/app.log

# View error logs
tail -f logs/error.log

# Filter logs by level
grep "ERROR" logs/app.log
Sentry
python
# Initialize Sentry
import sentry_sdk

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    environment=os.getenv("APP_ENV"),
    traces_sample_rate=0.1,
)
🔐 Security
Authentication
JWT-based authentication

Refresh token rotation

Password hashing with bcrypt

Role-based access control

Security Headers
HSTS (HTTP Strict Transport Security)

CSP (Content Security Policy)

X-Frame-Options

X-XSS-Protection

X-Content-Type-Options

Rate Limiting
python
# Configuration
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
🤝 Contributing
Development Workflow
Fork the repository

Create a feature branch

bash
git checkout -b feature/amazing-feature
Commit changes

bash
git commit -m 'Add amazing feature'
Push to branch

bash
git push origin feature/amazing-feature
Open a Pull Request

Code Style
bash
# Format code
black src tests

# Sort imports
isort src tests

# Run linters
flake8 src tests
pylint src

# Type checking
mypy src
Pre-commit Hooks
bash
# Install pre-commit hooks
pre-commit install

# Run all hooks
pre-commit run --all-files
📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
FastAPI community for the excellent framework

PostgreSQL team for the robust database

All contributors and open-source projects used

📞 Support
Documentation: https://docs.parking-system.com

Issue Tracker: https://github.com/yourusername/parking-management-system/issues

Email: support@parking-system.com

<div align="center">
Built with ❤️ by the Parking Management Team

⬆ Back to Top

</div> ```