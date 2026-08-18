Microservices Architecture - Parking Management System
1. Overview
1.1 Purpose
This document describes the microservices architecture of the Parking Management System, including service boundaries, communication patterns, data management, and operational considerations.

1.2 Principles
Single Responsibility: Each service has a single, well-defined purpose

Loose Coupling: Services interact through well-defined APIs

High Cohesion: Related functionality grouped within services

Domain-Driven Design: Services aligned with business domains

Independent Deployability: Services can be deployed independently

Failure Isolation: Service failures don't cascade to other services

2. Service Inventory
2.1 Service Map
text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Service Map                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      API Gateway                                     │   │
│  │  - Request routing                                                   │   │
│  │  - Rate limiting                                                     │   │
│  │  - Authentication                                                    │   │
│  │  - Request/response transformation                                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    Service Discovery                                │   │
│  │  - Service registration                                             │   │
│  │  - Health checking                                                  │   │
│  │  - Load balancing                                                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌───────┬───────┬───────┬───────┼───────┬───────┬───────┬──────────────┐   │
│  │       │       │       │       │       │       │       │              │   │
│  ▼       ▼       ▼       ▼       ▼       ▼       ▼       ▼              │   │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌──────────┐ │   │
│  │Park │ │Book │ │Paym │ │User │ │Vehi │ │Char │ │Noti │ │  Report   │ │   │
│  │ing  │ │ing  │ │ent  │ │     │ │cle  │ │ging │ │fica │ │          │ │   │
│  │Serv │ │Serv │ │Serv │ │Serv │ │Serv │ │Serv │ │tion │ │  Serv    │ │   │
│  │ice  │ │ice  │ │ice  │ │ice  │ │ice  │ │ice  │ │Serv │ │          │ │   │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └──────────┘ │   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    Shared Services                                   │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐               │   │
│  │  │  Auth   │  │  Cache  │  │ Message │  │  File   │               │   │
│  │  │ Service │  │ Service │  │  Queue  │  │ Service │               │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘               │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
2.2 Service Details
2.2.1 API Gateway
Property	Value
Name	API Gateway
Port	80/443
Language	Node.js/Nginx
Database	None
Cache	None
Dependencies	None
Responsibilities:

Route requests to appropriate services

Authentication and authorization

Rate limiting and throttling

Request/response transformation

SSL termination

Load balancing

Endpoints:

text
/api/v1/auth/** → Auth Service
/api/v1/users/** → User Service
/api/v1/vehicles/** → Vehicle Service
/api/v1/parking/** → Parking Service
/api/v1/bookings/** → Booking Service
/api/v1/payments/** → Payment Service
/api/v1/charging/** → Charging Service
/api/v1/notifications/** → Notification Service
/api/v1/reports/** → Report Service
2.2.2 Auth Service
Property	Value
Name	Auth Service
Port	3001
Language	Node.js/NestJS
Database	PostgreSQL
Cache	Redis
Dependencies	User Service
Responsibilities:

User authentication (login/register)

JWT token generation and validation

Refresh token management

Password reset and change

Email verification

Two-factor authentication

Social login integration

API Endpoints:

text
POST   /auth/login
POST   /auth/register
POST   /auth/refresh
POST   /auth/logout
POST   /auth/forgot-password
POST   /auth/reset-password
POST   /auth/verify-email
POST   /auth/change-password
POST   /auth/two-factor/enable
POST   /auth/two-factor/verify
POST   /auth/two-factor/disable
POST   /auth/social-login
Database Schema:

sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    refresh_tokens JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    token VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
2.2.3 Parking Service
Property	Value
Name	Parking Service
Port	3002
Language	Python/FastAPI
Database	PostgreSQL + PostGIS
Cache	Redis
Dependencies	None
Responsibilities:

Parking lot CRUD operations

Parking spot management

Real-time availability tracking

Geospatial search

Dynamic pricing

Parking lot statistics

Review management

API Endpoints:

text
GET    /parking/lots
POST   /parking/lots
GET    /parking/lots/{id}
PUT    /parking/lots/{id}
DELETE /parking/lots/{id}
GET    /parking/lots/{id}/spots
POST   /parking/lots/{id}/spots
GET    /parking/lots/{id}/availability
GET    /parking/lots/{id}/reviews
POST   /parking/lots/{id}/reviews
GET    /parking/lots/{id}/statistics
GET    /parking/lots/nearby
GET    /parking/lots/search
Database Schema:

sql
CREATE TABLE parking_lots (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    address JSONB NOT NULL,
    location GEOGRAPHY(POINT) NOT NULL,
    total_spots INTEGER NOT NULL,
    available_spots INTEGER NOT NULL,
    reserved_spots INTEGER DEFAULT 0,
    base_price_per_hour DECIMAL(10,2) NOT NULL,
    base_price_per_day DECIMAL(10,2),
    base_price_per_month DECIMAL(10,2),
    amenities JSONB,
    features JSONB,
    operating_hours JSONB,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    images JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parking_spots (
    id UUID PRIMARY KEY,
    parking_lot_id UUID REFERENCES parking_lots(id),
    number VARCHAR(20) NOT NULL,
    level INTEGER DEFAULT 1,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    width DECIMAL(5,2),
    length DECIMAL(5,2),
    height DECIMAL(5,2),
    is_covered BOOLEAN DEFAULT FALSE,
    is_handicap BOOLEAN DEFAULT FALSE,
    is_ev_charging BOOLEAN DEFAULT FALSE,
    connector_type VARCHAR(50),
    charging_power INTEGER,
    charging_price DECIMAL(10,2),
    vehicle_id UUID,
    vehicle_plate VARCHAR(20),
    reserved_until TIMESTAMP,
    occupied_since TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parking_reviews (
    id UUID PRIMARY KEY,
    parking_lot_id UUID REFERENCES parking_lots(id),
    user_id UUID,
    booking_id UUID,
    rating INTEGER NOT NULL,
    title VARCHAR(255),
    comment TEXT,
    images JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
2.2.4 Booking Service
Property	Value
Name	Booking Service
Port	3003
Language	Node.js/NestJS
Database	PostgreSQL
Cache	Redis
Dependencies	Parking Service, Payment Service, Vehicle Service
Responsibilities:

Booking creation and management

Conflict detection

QR code generation

Check-in/check-out processing

Booking extensions

Cancellation handling

Real-time availability

API Endpoints:

text
GET    /bookings
POST   /bookings
GET    /bookings/{id}
PUT    /bookings/{id}
DELETE /bookings/{id}
POST   /bookings/{id}/confirm
POST   /bookings/{id}/cancel
POST   /bookings/{id}/extend
POST   /bookings/{id}/check-in
POST   /bookings/{id}/check-out
GET    /bookings/{id}/qrcode
GET    /bookings/active
GET    /bookings/history
GET    /bookings/stats
Database Schema:

sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY,
    parking_lot_id UUID NOT NULL,
    spot_id UUID NOT NULL,
    user_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_status VARCHAR(50) NOT NULL,
    payment_id UUID,
    qr_code VARCHAR(255),
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    is_extended BOOLEAN DEFAULT FALSE,
    extension_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE booking_extensions (
    id UUID PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id),
    additional_hours INTEGER NOT NULL,
    additional_amount DECIMAL(10,2) NOT NULL,
    previous_end_time TIMESTAMP NOT NULL,
    new_end_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
2.2.5 Payment Service
Property	Value
Name	Payment Service
Port	3004
Language	Python/FastAPI
Database	PostgreSQL
Cache	Redis
Dependencies	Booking Service
Responsibilities:

Payment processing

Payment method management

Refund processing

Wallet management

Transaction history

Receipt generation

Integration with payment providers

API Endpoints:

text
GET    /payments/methods
POST   /payments/methods
DELETE /payments/methods/{id}
PUT    /payments/methods/{id}/default
POST   /payments/process
POST   /payments/{id}/refund
GET    /payments/history
GET    /payments/{id}
GET    /payments/{id}/receipt
GET    /payments/wallet/balance
POST   /payments/wallet/add-funds
POST   /payments/wallet/withdraw
GET    /payments/wallet/transactions
Database Schema:

sql
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    card_type VARCHAR(50),
    last4 VARCHAR(4),
    expiry_month INTEGER,
    expiry_year INTEGER,
    holder_name VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE,
    provider_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    booking_id UUID,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method_id UUID REFERENCES payment_methods(id),
    status VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    receipt_url VARCHAR(255),
    provider_transaction_id VARCHAR(255),
    provider_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    balance DECIMAL(10,2) NOT NULL,
    description VARCHAR(255),
    reference_type VARCHAR(50),
    reference_id UUID,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
2.2.6 User Service
Property	Value
Name	User Service
Port	3005
Language	Node.js/NestJS
Database	PostgreSQL
Cache	Redis
Dependencies	None
Responsibilities:

User profile management

User preferences

Activity logging

User statistics

User search

Role management

Account management

API Endpoints:

text
GET    /users/profile
PUT    /users/profile
PATCH  /users/profile
DELETE /users/profile
GET    /users/stats
GET    /users/activity
GET    /users/preferences
PUT    /users/preferences
GET    /users/vehicles
POST   /users/vehicles
PUT    /users/vehicles/{id}
DELETE /users/vehicles/{id}
POST   /users/vehicles/{id}/default
Database Schema:

sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(255),
    bio TEXT,
    preferences JSONB,
    loyalty_points INTEGER DEFAULT 0,
    referral_code VARCHAR(50),
    referred_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_activity (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
2.2.7 Vehicle Service
Property	Value
Name	Vehicle Service
Port	3006
Language	Python/FastAPI
Database	PostgreSQL
Cache	Redis
Dependencies	None
Responsibilities:

Vehicle CRUD operations

Vehicle make/model management

VIN validation

Vehicle search

Default vehicle management

Vehicle history

API Endpoints:

text
GET    /vehicles
POST   /vehicles
GET    /vehicles/{id}
PUT    /vehicles/{id}
DELETE /vehicles/{id}
POST   /vehicles/{id}/default
GET    /vehicles/makes
POST   /vehicles/makes
GET    /vehicles/makes/{id}/models
POST   /vehicles/models
GET    /vehicles/types
POST   /vehicles/types
GET    /vehicles/search
Database Schema:

sql
CREATE TABLE vehicle_makes (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    logo VARCHAR(255),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicle_models (
    id UUID PRIMARY KEY,
    make_id UUID REFERENCES vehicle_makes(id),
    name VARCHAR(100) NOT NULL,
    year_from INTEGER,
    year_to INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    make_id UUID REFERENCES vehicle_makes(id),
    model_id UUID REFERENCES vehicle_models(id),
    type_id UUID REFERENCES vehicle_types(id),
    name VARCHAR(255),
    plate_number VARCHAR(20) NOT NULL,
    vin VARCHAR(17),
    color VARCHAR(50),
    year INTEGER,
    is_ev BOOLEAN DEFAULT FALSE,
    battery_capacity DECIMAL(5,2),
    connector_type VARCHAR(50),
    max_charging_power INTEGER,
    mileage INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active',
    features JSONB,
    images JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
2.2.8 Charging Service
Property	Value
Name	Charging Service
Port	3007
Language	Python/FastAPI
Database	PostgreSQL
Cache	Redis
Dependencies	User Service, Vehicle Service
Responsibilities:

Charging station management

OCPP protocol handling

Session management

Energy consumption tracking

Pricing calculation

Real-time monitoring

API Endpoints:

text
GET    /charging/stations
POST   /charging/stations
GET    /charging/stations/{id}
PUT    /charging/stations/{id}
DELETE /charging/stations/{id}
POST   /charging/sessions
GET    /charging/sessions/{id}
POST   /charging/sessions/{id}/stop
GET    /charging/sessions/history
POST   /charging/sessions/{id}/pause
POST   /charging/sessions/{id}/resume
GET    /charging/stations/{id}/availability
GET    /charging/stations/nearby
Database Schema:

sql
CREATE TABLE charging_stations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    location GEOGRAPHY(POINT) NOT NULL,
    power_level VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    price_per_kwh DECIMAL(10,2) NOT NULL,
    rating DECIMAL(3,2),
    review_count INTEGER DEFAULT 0,
    amenities JSONB,
    images JSONB,
    ocpp_config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE charging_connectors (
    id UUID PRIMARY KEY,
    station_id UUID REFERENCES charging_stations(id),
    type VARCHAR(50) NOT NULL,
    power INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    vehicle_id UUID,
    occupied_since TIMESTAMP,
    reserved_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE charging_sessions (
    id UUID PRIMARY KEY,
    station_id UUID NOT NULL,
    connector_id UUID NOT NULL,
    user_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    energy_used DECIMAL(10,2),
    cost DECIMAL(10,2),
    meter_start DECIMAL(10,2),
    meter_stop DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
2.2.9 Notification Service
Property	Value
Name	Notification Service
Port	3008
Language	Node.js/NestJS
Database	PostgreSQL
Cache	Redis
Dependencies	None
Responsibilities:

Multi-channel notification delivery

Template management

User preferences

Device management

Delivery tracking

Push notification management

API Endpoints:

text
GET    /notifications
POST   /notifications
GET    /notifications/{id}
PATCH  /notifications/{id}/read
PATCH  /notifications/read-all
DELETE /notifications/{id}
DELETE /notifications/all
GET    /notifications/settings
PUT    /notifications/settings
POST   /notifications/devices
DELETE /notifications/devices/{id}
GET    /notifications/templates
POST   /notifications/templates
Database Schema:

sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    channels JSONB,
    priority VARCHAR(50) DEFAULT 'normal',
    status VARCHAR(50) DEFAULT 'pending',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_templates (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    html_content TEXT,
    variables JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_devices (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    device_token VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    device_id VARCHAR(255),
    app_version VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
3. Communication Patterns
3.1 Synchronous Communication
yaml
# REST API - Request/Response
Booking Service -> Parking Service:
  GET /parking/lots/{id}/availability
  Request: { parkingLotId, startTime, endTime }
  Response: { available: true, spots: [...] }

# Service-to-Service HTTP
Parking Service -> Booking Service:
  POST /bookings/validate
  Request: { parkingLotId, spotId, startTime, endTime }
  Response: { valid: true, conflicts: [] }
3.2 Asynchronous Communication
yaml
# Event-Driven Communication
Booking Created -> Payment Processed -> Notification Sent

Events:
  - booking.created
  - booking.confirmed
  - booking.cancelled
  - booking.extended
  - payment.processed
  - payment.refunded
  - charging.started
  - charging.completed
  - notification.sent

# Message Queue Example
Service A -> Queue -> Service B
3.3 Communication Flow Diagrams
3.3.1 Booking Flow
text
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  User   │    │   API   │    │ Booking │    │ Parking │    │Payment  │
│         │    │ Gateway │    │ Service │    │ Service │    │ Service │
└────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
     │              │              │              │              │
     │─Create Booking─────────────>│              │              │
     │              │              │              │              │
     │              │              │──Check Availability────────>│
     │              │              │              │              │
     │              │              │<─Available───│              │
     │              │              │              │              │
     │              │              │──Create Booking─────────────>│
     │              │              │              │              │
     │              │              │──Process Payment────────────>│
     │              │              │              │              │
     │              │              │<─Payment Success────────────│
     │              │              │              │              │
     │              │              │──Update Spot Status─────────>│
     │              │              │              │              │
     │              │              │<─Status Updated─────────────│
     │              │              │              │              │
     │              │              │──Send Notification──────────>│
     │              │              │              │              │
     │<─Booking Confirmed──────────│              │              │
     │              │              │              │              │
3.3.2 Payment Processing Flow
text
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  User   │    │   API   │    │Payment  │    │Booking  │    │ Stripe  │
│         │    │ Gateway │    │ Service │    │ Service │    │         │
└────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
     │              │              │              │              │
     │─Process Payment────────────>│              │              │
     │              │              │              │              │
     │              │              │──Validate Booking───────────>│
     │              │              │              │              │
     │              │              │<─Booking Valid──────────────│
     │              │              │              │              │
     │              │              │──Create Payment Intent──────>│
     │              │              │              │              │
     │              │              │<─Payment Intent Created─────│
     │              │              │              │              │
     │<─Payment Required──────────────────────────│              │
     │              │              │              │              │
     │──Submit Payment Method───────────────────────────────────>│
     │              │              │              │              │
     │<─Payment Success──────────────────────────────────────────│
     │              │              │              │              │
     │              │              │──Update Payment Status──────>│
     │              │              │              │              │
     │              │              │──Update Booking Status──────>│
     │              │              │              │              │
     │<─Payment Confirmed──────────│              │              │
     │              │              │              │              │
4. Service Communication Protocols
4.1 REST API (Synchronous)
yaml
Protocol: HTTP/HTTPS
Format: JSON
Authentication: JWT Bearer Token
Rate Limiting: 100 req/min per endpoint

Headers:
  Authorization: Bearer {token}
  Content-Type: application/json
  Accept: application/json
  X-Request-ID: {uuid}
  X-Correlation-ID: {uuid}
4.2 Event-Driven (Asynchronous)
yaml
Protocol: AMQP (RabbitMQ)
Format: JSON
Exchange: Topic
Pattern: Publish/Subscribe

Message Structure:
{
  "event_id": "uuid",
  "event_type": "booking.created",
  "source": "booking-service",
  "timestamp": "2024-01-15T10:30:00Z",
  "correlation_id": "uuid",
  "data": {
    "booking_id": "uuid",
    "user_id": "uuid",
    "parking_lot_id": "uuid",
    "amount": 25.00
  }
}
4.3 gRPC (Internal)
yaml
Protocol: gRPC
Format: Protocol Buffers
Authentication: mTLS
Use Case: High-performance internal communication

Service Definition:
service ParkingService {
  rpc GetAvailability (AvailabilityRequest) returns (AvailabilityResponse);
  rpc ReserveSpot (ReserveRequest) returns (ReserveResponse);
  rpc ReleaseSpot (ReleaseRequest) returns (ReleaseResponse);
}
5. Service Discovery & Load Balancing
5.1 Service Registry
yaml
Service Registration:
  - Consul
  - Health checks every 30s
  - TTL: 60s

Service Lookup:
  - DNS-based (CoreDNS)
  - Client-side load balancing
  - Retry with backoff
5.2 Load Balancing Strategy
yaml
Layer: Application (Client-side)
Strategy: Round Robin
Fallback: Random
Retry: 3 attempts with exponential backoff
Circuit Breaker: Hystrix
6. API Versioning
6.1 Versioning Strategy
yaml
Strategy: URL Path
Format: /api/v{major}/
Examples:
  - /api/v1/parking/lots
  - /api/v2/parking/lots

Version Policy:
  - Major version: Breaking changes
  - Minor version: New features
  - Patch version: Bug fixes

Backward Compatibility:
  - Last 2 major versions supported
  - Deprecation notice 6 months before removal
7. Error Handling
7.1 Error Response Format
json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "uuid"
}
7.2 Error Codes
yaml
# Client Errors (4xx)
400: BAD_REQUEST
401: UNAUTHORIZED
403: FORBIDDEN
404: NOT_FOUND
409: CONFLICT
422: UNPROCESSABLE_ENTITY
429: TOO_MANY_REQUESTS

# Server Errors (5xx)
500: INTERNAL_SERVER_ERROR
502: BAD_GATEWAY
503: SERVICE_UNAVAILABLE
504: GATEWAY_TIMEOUT

# Business Errors
1001: BOOKING_CONFLICT
1002: INSUFFICIENT_FUNDS
1003: PARKING_FULL
1004: INVALID_PAYMENT_METHOD
1005: CHARGING_SESSION_ACTIVE
8. Security
8.1 Authentication Flow
text
1. User provides credentials
2. Auth Service validates credentials
3. JWT tokens generated (access + refresh)
4. Access token used for API requests
5. Refresh token for obtaining new access tokens
6. Token validation on each request
7. Token expiration and rotation
8.2 Authorization
yaml
Role-Based Access Control (RBAC):

Roles:
  - ADMIN: Full system access
  - MANAGER: Parking lot management
  - USER: Standard user access

Permissions Matrix:
  | Action | ADMIN | MANAGER | USER |
  |--------|-------|---------|------|
  | CRUD Users | ✓ | ✗ | ✗ |
  | CRUD Parking | ✓ | ✓ | ✗ |
  | CRUD Bookings | ✓ | ✓ | ✓ |
  | View Reports | ✓ | ✓ | ✗ |
  | Generate Reports | ✓ | ✓ | ✗ |
8.3 Service-to-Service Security
yaml
Authentication: mTLS
Authorization: Service Account
Network: Private VPC
API Keys: For external services
9. Deployment & Operations
9.1 Deployment Strategy
yaml
Strategy: Blue-Green Deployment
Rollback: Immediate via Kubernetes
Health Checks: Liveness + Readiness
Resource Limits: CPU + Memory
Auto-scaling: HPA based on CPU/Memory
9.2 Monitoring
yaml
Metrics:
  - Request rate (RPS)
  - Response time (P95, P99)
  - Error rate
  - Resource usage (CPU, Memory)
  - Business metrics (bookings, payments)

Alerts:
  - High error rate
  - Service down
  - Resource exhaustion
  - Slow response time
  - Business metric anomalies

Logging:
  - Structured logging (JSON format)
  - Correlation IDs
  - Centralized log aggregation (ELK)
  - Log retention: 30 days
9.3 Service Dependencies
text
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Service Dependencies                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Parking Service ───────────────────────────────────────────────────────────│
│       │                                                                     │
│       ├── Booking Service ─────────────────────────────────────────────────│
│       │      │                                                              │
│       │      ├── Payment Service ──────────────────────────────────────────│
│       │      │      │                                                       │
│       │      │      ├── Stripe                                             │
│       │      │      └── PayPal                                            │
│       │      │                                                              │
│       │      └── Notification Service ─────────────────────────────────────│
│       │             │                                                       │
│       │             ├── Email (SendGrid)                                  │
│       │             ├── Push (Firebase)                                   │
│       │             └── SMS (Twilio)                                     │
│       │                                                                    │
│       └── User Service ───────────────────────────────────────────────────│
│              │                                                             │
│              └── Vehicle Service ─────────────────────────────────────────│
│                     │                                                      │
│                     └── Charging Service ────────────────────────────────│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
10. Performance Considerations
10.1 Performance Requirements
Metric	Target
API Response Time	<100ms (P95)
API Response Time	<200ms (P99)
Request Rate	10,000 RPS
Database Query Time	<50ms
Cache Hit Rate	>90%
Service Availability	99.99%
10.2 Optimization Strategies
yaml
Database:
  - Indexing strategy
  - Query optimization
  - Read replicas
  - Connection pooling

Caching:
  - Redis for frequent data
  - CDN for static assets
  - Cache invalidation strategy
  - TTL management

API:
  - Pagination for large datasets
  - Field selection
  - Batch operations
  - Compression

Infrastructure:
  - Auto-scaling
  - Load balancing
  - CDN
  - Edge caching
This document is maintained by the Architecture Team and updated regularly.