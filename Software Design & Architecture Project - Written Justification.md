# **Software Design & Architecture Project \- Written Justification**

## **Parking Management System \- EasyParkPlus**

---

## **1\. Introduction**

This document provides a comprehensive justification for the architectural improvements, design pattern implementations, and system extensions made to the EasyParkPlus Parking Management System. The project involved analyzing an existing prototype codebase, identifying anti-patterns, implementing appropriate design patterns, and extending the system to support a scalable microservices architecture with Electric Vehicle (EV) Charging Station Management capabilities.

The original codebase was a monolithic Python application for managing a single parking lot. The goal was to refactor this prototype into a maintainable, scalable system that can handle multiple parking facilities and EV charging stations while following software engineering best practices.

---

## **2\. Original Code Analysis**

### **2.1 UML Diagrams (Original)**

#### Structural Diagram \- Original Class Diagram

The original codebase exhibited a monolithic structure with tight coupling between components:

text

┌─────────────────────────────────────────────────────────────────────┐  
│                    ParkingLotManager (Original)                    │  
├─────────────────────────────────────────────────────────────────────┤  
│ \- parking\_spots: List                                              │  
│ \- vehicles: List                                                   │  
│ \- bookings: List                                                   │  
│ \- payment\_methods: List                                            │  
│ \- total\_spots: int                                                │  
│ \- available\_spots: int                                            │  
├─────────────────────────────────────────────────────────────────────┤  
│ \+ add\_vehicle(vehicle: Vehicle)                                   │  
│ \+ remove\_vehicle(vehicle\_id: str)                                 │  
│ \+ find\_available\_spot(): Spot                                     │  
│ \+ book\_spot(vehicle\_id: str, start\_time: datetime)                │  
│ \+ release\_spot(spot\_id: str)                                      │  
│ \+ process\_payment(amount: float)                                  │  
│ \+ calculate\_booking\_cost(start: datetime, end: datetime)          │  
│ \+ notify\_user(message: str)                                       │  
│ \+ generate\_report(start: datetime, end: datetime)                 │  
│ \+ check\_availability(): int                                       │  
│ \+ get\_spot\_status(): dict                                         │

└─────────────────────────────────────────────────────────────────────┘

Key Observations:

* A single "God Class" handling all responsibilities  
* Tight coupling between parking, booking, payment, and notification logic  
* No clear separation of concerns  
* Business logic mixed with data access and presentation logic

#### Behavioral Diagram \- Original Sequence Diagram (Booking Flow)

text

User                ParkingLotManager      PaymentSystem        NotificationService  
 |                        |                      |                      |  
 |──book\_spot()──────────\>|                      |                      |  
 |                        |──calculate\_cost()───\>|                      |  
 |                        |\<─────────────────────|                      |  
 |                        |──process\_payment()──\>|                      |  
 |                        |\<─────────────────────|                      |  
 |                        |──update\_availability\>|                      |  
 |                        |──send\_notification─────────────────────────\>|

 |\<───────────────────────|                      |                      |

### **2.2 Identified Anti-Patterns**

The original codebase contained several anti-patterns that needed to be addressed:

#### 2.2.1 **God Class (Blob Anti-Pattern)**

The ParkingLotManager class handled EVERYTHING \- parking management, bookings, payments, notifications, and reporting.

Problem: Violated Single Responsibility Principle, making the code difficult to maintain, test, and extend.

#### 2.2.2 **Spaghetti Code**

Logic was tangled with no clear separation of concerns.

Problem: Changes in one area would unintentionally affect other areas.

#### 2.2.3 **Hard-Coded Values**

Configuration values were scattered throughout the code with no central management.

Problem: Making changes required finding and updating multiple files.

#### 2.2.4 **Poor Error Handling**

Many functions had no error handling or used bare except clauses.

Problem: Silent failures and difficult debugging.

#### 2.2.5 **Tight Coupling**

Modules were tightly coupled, making testing and maintenance difficult.

Problem: Couldn't test components in isolation.

#### 2.2.6 **Code Duplication**

Similar logic appeared in multiple places.

Problem: Updates required making changes in multiple locations.

#### 2.2.7 **Global Variables**

Used throughout the code for state management.

Problem: Unpredictable behavior and difficult to reason about.

#### 2.2.8 **Primitive Obsession**

Used primitive types instead of domain objects.

Problem: Lost domain meaning and validation logic.

---

## **3\. Design Pattern Implementation**

### **3.1 Pattern 1: Strategy Pattern**

#### Justification

The Strategy Pattern was implemented to handle dynamic pricing calculations for parking and EV charging services.

Problem Solved: The original code had rigid pricing logic embedded directly in the booking flow. Adding new pricing strategies (peak hours, loyalty discounts, EV charging rates) required modifying existing code.

Implementation:

python

*\# Strategy Pattern \- Pricing Strategy*  
class PricingStrategy(ABC):  
    @abstractmethod  
    def calculate\_price(self, booking: Booking) \-\> Money:  
        pass

class StandardPricingStrategy(PricingStrategy):  
    def calculate\_price(self, booking: Booking) \-\> Money:  
        hours \= booking.get\_duration\_hours()  
        return booking.parking\_lot.base\_price \* hours

class PeakHourPricingStrategy(PricingStrategy):  
    def calculate\_price(self, booking: Booking) \-\> Money:  
        hours \= booking.get\_duration\_hours()  
        peak\_multiplier \= 1.5 if booking.is\_peak\_hours() else 1.0  
        return booking.parking\_lot.base\_price \* hours \* peak\_multiplier

class LoyaltyPricingStrategy(PricingStrategy):  
    def calculate\_price(self, booking: Booking) \-\> Money:  
        base\_price \= booking.parking\_lot.base\_price \* booking.get\_duration\_hours()  
        discount \= min(booking.user.loyalty\_points // 100, 50)  *\# 1% per 100 points*  
        return base\_price \* (1 \- discount / 100)

class PricingContext:  
    def \_\_init\_\_(self, strategy: PricingStrategy):  
        self.\_strategy \= strategy  
      
    def set\_strategy(self, strategy: PricingStrategy):  
        self.\_strategy \= strategy  
      
    def calculate(self, booking: Booking) \-\> Money:

        return self.\_strategy.calculate\_price(booking)

Benefits:

* Open/Closed Principle: New pricing strategies can be added without modifying existing code  
* Runtime strategy switching based on business rules  
* Improved testability: strategies can be tested in isolation  
* Clear separation of pricing logic

### **3.2 Pattern 2: Observer Pattern**

#### Justification

The Observer Pattern was implemented for the notification system to decouple event producers from event consumers.

Problem Solved: The original code had direct calls from parking operations to notification methods, creating tight coupling and making it difficult to add new notification channels.

Implementation:

python

*\# Observer Pattern \- Event System*  
class Event(Enum):  
    BOOKING\_CREATED \= "booking.created"  
    BOOKING\_CONFIRMED \= "booking.confirmed"  
    BOOKING\_CANCELLED \= "booking.cancelled"  
    PAYMENT\_PROCESSED \= "payment.processed"  
    CHARGING\_STARTED \= "charging.started"  
    CHARGING\_COMPLETED \= "charging.completed"

class EventPublisher:  
    def \_\_init\_\_(self):  
        self.\_subscribers: Dict\[Event, List\[Callable\]\] \= {}  
      
    def subscribe(self, event: Event, callback: Callable):  
        if event not in self.\_subscribers:  
            self.\_subscribers\[event\] \= \[\]  
        self.\_subscribers\[event\].append(callback)  
      
    def unsubscribe(self, event: Event, callback: Callable):  
        if event in self.\_subscribers:  
            self.\_subscribers\[event\].remove(callback)  
      
    def publish(self, event: Event, data: Any):  
        if event in self.\_subscribers:  
            for callback in self.\_subscribers\[event\]:  
                callback(data)

class BookingService:  
    def \_\_init\_\_(self, event\_publisher: EventPublisher):  
        self.event\_publisher \= event\_publisher  
      
    def create\_booking(self, booking\_data: BookingData):  
        booking \= self.\_create\_booking(booking\_data)  
        self.event\_publisher.publish(Event.BOOKING\_CREATED, booking)  
        return booking

class NotificationService:  
    def \_\_init\_\_(self, event\_publisher: EventPublisher):  
        event\_publisher.subscribe(Event.BOOKING\_CREATED, self.send\_booking\_confirmation)  
        event\_publisher.subscribe(Event.PAYMENT\_PROCESSED, self.send\_payment\_receipt)  
      
    def send\_booking\_confirmation(self, booking: Booking):  
        *\# Send confirmation email/push notification*  
        pass  
      
    def send\_payment\_receipt(self, payment: Payment):  
        *\# Send receipt*

        pass

Benefits:

* Loose coupling between services  
* Easy to add new notification channels (email, SMS, push)  
* Event-driven architecture for asynchronous processing  
* Improved scalability

### **3.3 Pattern 3: Repository Pattern**

#### Justification

The Repository Pattern was implemented to abstract data access logic from domain logic.

Problem Solved: The original code mixed database operations with business logic, making testing difficult and coupling domain logic to specific data sources.

Implementation:

python

*\# Repository Pattern*  
class Repository(ABC, Generic\[T\]):  
    @abstractmethod  
    async def get(self, id: UUID) \-\> Optional\[T\]:  
        pass  
      
    @abstractmethod  
    async def get\_all(self, filters: Optional\[Dict\] \= None) \-\> List\[T\]:  
        pass  
      
    @abstractmethod  
    async def add(self, entity: T) \-\> T:  
        pass  
      
    @abstractmethod  
    async def update(self, entity: T) \-\> T:  
        pass  
      
    @abstractmethod  
    async def delete(self, id: UUID) \-\> bool:  
        pass

class ParkingLotRepository(Repository\[ParkingLot\]):  
    def \_\_init\_\_(self, db\_session: AsyncSession):  
        self.session \= db\_session  
      
    async def get(self, id: UUID) \-\> Optional\[ParkingLot\]:  
        result \= await self.session.execute(  
            select(ParkingLot).where(ParkingLot.id \== id)  
        )  
        return result.scalar\_one\_or\_none()  
      
    async def get\_nearby(self, location: Location, radius: float) \-\> List\[ParkingLot\]:  
        *\# Geospatial query using PostGIS*  
        pass  
      
    async def get\_available(self) \-\> List\[ParkingLot\]:  
        *\# Get lots with available spots*

        pass

Benefits:

* Clean separation between domain and data access  
* Domain logic becomes testable with in-memory repositories  
* Easy to switch data sources  
* Consistent interface for data access

### **3.4 Pattern 4: Factory Pattern**

#### Justification

The Factory Pattern was implemented for creating domain objects with complex initialization logic.

Problem Solved: Creating domain objects with dependencies and validation logic was scattered across the codebase.

Implementation:

python

*\# Factory Pattern*  
class ParkingLotFactory:  
    @staticmethod  
    def create\_parking\_lot(  
        name: str,  
        address: Address,  
        location: Location,  
        total\_spots: int,  
        pricing\_strategy: PricingStrategy  
    ) \-\> ParkingLot:  
        if not name or len(name) \< 3:  
            raise ValidationError("Parking lot name must be at least 3 characters")  
        if total\_spots \<= 0:  
            raise ValidationError("Total spots must be positive")  
          
        parking\_lot \= ParkingLot(  
            id\=uuid4(),  
            name\=name,  
            address\=address,  
            location\=location,  
            total\_spots\=total\_spots,  
            pricing\_strategy\=pricing\_strategy  
        )  
          
        *\# Create parking spots*  
        for i in range(1, total\_spots \+ 1):  
            spot \= ParkingSpotFactory.create\_standard\_spot(f"A{i}", parking\_lot.id)  
            parking\_lot.add\_spot(spot)  
          
        return parking\_lot

class BookingFactory:  
    @staticmethod  
    def create\_booking(  
        user: User,  
        parking\_lot: ParkingLot,  
        spot: ParkingSpot,  
        start\_time: datetime,  
        end\_time: datetime,  
        vehicle: Vehicle  
    ) \-\> Booking:  
        *\# Validate booking constraints*  
        if start\_time \< datetime.now():  
            raise ValidationError("Start time must be in the future")  
        if end\_time \<= start\_time:  
            raise ValidationError("End time must be after start time")  
        if not spot.is\_available():  
            raise ValidationError("Spot is not available")  
          
        return Booking(  
            id\=uuid4(),  
            user\=user,  
            parking\_lot\=parking\_lot,  
            spot\=spot,  
            start\_time\=start\_time,  
            end\_time\=end\_time,  
            vehicle\=vehicle

        )

Benefits:

* Centralized object creation logic  
* Validation and business rules enforced at creation  
* Consistent object state  
* Easier to maintain and extend

### **3.5 Pattern 5: Singleton Pattern**

#### Justification

The Singleton Pattern was implemented for application-wide services like configuration management and logging.

Problem Solved: Configuration values were scattered throughout the code, and logging was inconsistent.

Implementation:

python

*\# Singleton Pattern \- Configuration*  
class AppConfig:  
    \_instance \= None  
      
    def \_\_new\_\_(cls):  
        if cls.\_instance is None:  
            cls.\_instance \= super().\_\_new\_\_(cls)  
            cls.\_instance.\_initialize()  
        return cls.\_instance  
      
    def \_initialize(self):  
        self.\_load\_env\_vars()  
        self.\_load\_config\_file()  
      
    def get(self, key: str, default: Any \= None) \-\> Any:  
        return self.\_config.get(key, default)

*\# Singleton Pattern \- Logger*  
class AppLogger:  
    \_instance \= None  
      
    def \_\_new\_\_(cls):  
        if cls.\_instance is None:  
            cls.\_instance \= super().\_\_new\_\_(cls)  
            cls.\_instance.\_initialize()  
        return cls.\_instance  
      
    def \_initialize(self):  
        logging.basicConfig(  
            level\=logging.INFO,  
            format\='%(asctime)s \- %(name)s \- %(levelname)s \- %(message)s',  
            handlers\=\[  
                FileHandler('logs/app.log'),  
                StreamHandler()  
            \]  
        )  
        self.logger \= logging.getLogger('ParkingApp')  
      
    def info(self, message: str, \*\*kwargs):  
        self.logger.info(message, extra\=kwargs)  
      
    def error(self, message: str, \*\*kwargs):

        self.logger.error(message, extra\=kwargs)

Benefits:

* Single source of truth for configuration  
* Consistent logging across the application  
* Global access point to services  
* Reduced resource usage (one instance shared)

### **3.6 Pattern 6: Command Pattern**

#### Justification

The Command Pattern was implemented for booking and payment operations to enable undo/redo and transaction management.

Problem Solved: The original code had no transaction management, making it difficult to handle rollbacks on failure.

Implementation:

python

*\# Command Pattern*  
class Command(ABC):  
    @abstractmethod  
    def execute(self) \-\> Any:  
        pass  
      
    @abstractmethod  
    def undo(self) \-\> None:  
        pass

class CreateBookingCommand(Command):  
    def \_\_init\_\_(self, booking\_service, booking\_data):  
        self.booking\_service \= booking\_service  
        self.booking\_data \= booking\_data  
        self.booking\_id \= None  
      
    def execute(self) \-\> Booking:  
        self.booking\_id \= self.booking\_service.create\_booking(self.booking\_data)  
        return self.booking\_id  
      
    def undo(self) \-\> None:  
        if self.booking\_id:  
            self.booking\_service.cancel\_booking(self.booking\_id)

class ProcessPaymentCommand(Command):  
    def \_\_init\_\_(self, payment\_service, payment\_data):  
        self.payment\_service \= payment\_service  
        self.payment\_data \= payment\_data  
        self.payment\_id \= None  
      
    def execute(self) \-\> Payment:  
        self.payment\_id \= self.payment\_service.process\_payment(self.payment\_data)  
        return self.payment\_id  
      
    def undo(self) \-\> None:  
        if self.payment\_id:  
            self.payment\_service.refund\_payment(self.payment\_id)

class CommandInvoker:  
    def \_\_init\_\_(self):  
        self.\_command\_history \= \[\]  
        self.\_redo\_stack \= \[\]  
      
    def execute(self, command: Command) \-\> Any:  
        result \= command.execute()  
        self.\_command\_history.append(command)  
        self.\_redo\_stack.clear()  
        return result  
      
    def undo(self):  
        if self.\_command\_history:  
            command \= self.\_command\_history.pop()  
            command.undo()  
            self.\_redo\_stack.append(command)  
      
    def redo(self):  
        if self.\_redo\_stack:  
            command \= self.\_redo\_stack.pop()  
            command.execute()

            self.\_command\_history.append(command)

Benefits:

* Transaction management for business operations  
* Undo/redo capabilities  
* Separates command logic from execution  
* Easy to add new commands

---

## **4\. Refactored Code**

### **4.1 UML Diagrams (Refactored)**

#### Structural Diagram \- Refactored Class Diagram

text

┌─────────────────────────────────────────────────────────────────────────────┐  
│                         Parking Management System                           │  
│                              (Refactored)                                   │  
├─────────────────────────────────────────────────────────────────────────────┤  
│                                                                             │  
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐               │  
│  │   Domain     │     │  Application │     │Infrastructure│               │  
│  │   Layer      │────▶│    Layer     │────▶│    Layer     │               │  
│  └──────────────┘     └──────────────┘     └──────────────┘               │  
│                                                                             │  
│  ┌─────────────────────────────────────────────────────────────────────┐   │  
│  │                           Domain Models                             │   │  
│  ├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤   │  
│  │  User    │ Vehicle  │Parking   │ Booking  │ Payment  │Charging  │   │  
│  │          │          │  Lot     │          │          │Session   │   │  
│  └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘   │  
│                                                                             │  
│  ┌─────────────────────────────────────────────────────────────────────┐   │  
│  │                       Value Objects                                 │   │  
│  ├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤   │  
│  │ Address  │ Location │  Money   │Operating│ Contact  │  Image   │   │  
│  │          │          │          │  Hours   │          │          │   │  
│  └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘   │  
│                                                                             │  
│  ┌─────────────────────────────────────────────────────────────────────┐   │  
│  │                         Services                                    │   │  
│  ├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤   │  
│  │ Parking  │ Booking  │ Payment  │  User    │Charging  │ Notif.   │   │  
│  │ Service  │ Service  │ Service  │ Service  │ Service  │ Service  │   │  
│  └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘   │  
│                                                                             │  
│  ┌─────────────────────────────────────────────────────────────────────┐   │  
│  │                       Design Patterns                                │   │  
│  ├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤   │  
│  │ Strategy │ Observer │ Repos.   │ Factory  │Singleton│ Command  │   │  
│  └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘   │  
│                                                                             │

└─────────────────────────────────────────────────────────────────────────────┘

#### Behavioral Diagram \- Refactored Sequence Diagram (Booking Flow)

text

User     APIGateway    BookingService    PricingService    PaymentService    ParkingService    NotificationService  
  |            |              |               |                  |                  |                    |  
  |──Book─────\>|              |               |                  |                  |                    |  
  |            |──Create───\>|               |                  |                  |                    |  
  |            |              |──Calculate──\>|                  |                  |                    |  
  |            |              |\<─────────────|                  |                  |                    |  
  |            |              |──Validate───────────────────────\>|                  |                    |  
  |            |              |\<────────────────────────────────|                  |                    |  
  |            |              |──Reserve─────────────────────────────────────────\>|                    |  
  |            |              |\<─────────────────────────────────────────────────|                    |  
  |            |              |──Process───\>|                  |                  |                    |  
  |            |              |\<─────────────|                  |                  |                    |  
  |            |              |──Save───\>    |                  |                  |                    |  
  |            |              |\<─────────────|                  |                  |                    |  
  |            |              |──Notify─────────────────────────────────────────────────────────────────\>|  
  |            |\<─────────────|               |                  |                  |                    |

  |\<───────────|              |               |                  |                  |                    |

### **4.2 Anti-Pattern Resolution**

| Anti-Pattern | Original Code | Refactored Solution |
| :---- | :---- | :---- |
| God Class | Single ParkingLotManager handling everything | Separated into multiple services: ParkingService, BookingService, PaymentService, UserService, ChargingService, NotificationService |
| Spaghetti Code | Tangled logic with no clear separation | Clean layered architecture: Domain, Application, Infrastructure |
| Hard-Coded Values | Configuration scattered throughout | Centralized AppConfig with environment variables |
| Poor Error Handling | Bare except clauses, silent failures | Proper exception hierarchy, logging, and user-friendly error messages |
| Tight Coupling | Direct dependencies between modules | Dependency Injection, interfaces, and event-driven communication |
| Code Duplication | Repeated logic in multiple places | Extracted into shared services and utility classes |
| Global Variables | Global state management | Proper encapsulation and dependency injection |
| Primitive Obsession | Primitive types losing domain meaning | Value Objects: Address, Location, Money, OperatingHours |

---

## **5\. Domain-Driven Design**

### **5.1 Core Domain Identification**

Core Domain: Parking Management

Justification: Parking management is the primary business activity that generates revenue and provides value to customers. It's the reason customers use the platform and the main competitive advantage.

Core Subdomains:

1. Parking Lot Management  
   * Managing parking facilities  
   * Spot allocation and availability  
   * Dynamic pricing  
   * Occupancy tracking  
2. Booking Management  
   * Reservation creation  
   * Check-in/check-out  
   * Booking extensions  
   * Cancellation handling  
3. Payment Processing  
   * Payment collection  
   * Refund processing  
   * Wallet management  
   * Loyalty points

### **5.2 Bounded Contexts**

text

┌─────────────────────────────────────────────────────────────────────────────────┐  
│                          Parking Management System                             │  
├─────────────────────────────────────────────────────────────────────────────────┤  
│                                                                                 │  
│  ┌──────────────────────────┐    ┌──────────────────────────┐                   │  
│  │   Parking Context         │    │   Booking Context        │                   │  
│  ├──────────────────────────┤    ├──────────────────────────┤                   │  
│  │ • Parking Lot Management │    │ • Reservation Management │                   │  
│  │ • Spot Management        │    │ • Check-in/Check-out     │                   │  
│  │ • Availability Tracking  │    │ • Duration Management    │                   │  
│  │ • Dynamic Pricing        │    │ • Cancellation           │                   │  
│  └────────────┬─────────────┘    └────────────┬─────────────┘                   │  
│               │                               │                                  │  
│               ▼                               ▼                                  │  
│  ┌──────────────────────────┐    ┌──────────────────────────┐                   │  
│  │   Payment Context        │    │   User Context           │                   │  
│  ├──────────────────────────┤    ├──────────────────────────┤                   │  
│  │ • Payment Processing     │    │ • User Registration      │                   │  
│  │ • Refund Management      │    │ • Authentication         │                   │  
│  │ • Wallet Management      │    │ • Profile Management     │                   │  
│  │ • Loyalty Points         │    │ • Vehicle Management     │                   │  
│  └────────────┬─────────────┘    └────────────┬─────────────┘                   │  
│               │                               │                                  │  
│               ▼                               ▼                                  │  
│  ┌──────────────────────────┐    ┌──────────────────────────┐                   │  
│  │   Charging Context       │    │   Notification Context   │                   │  
│  ├──────────────────────────┤    ├──────────────────────────┤                   │  
│  │ • EV Station Management │    │ • Email Notifications     │                   │  
│  │ • Charging Session Mgt   │    │ • Push Notifications     │                   │  
│  │ • OCPP Protocol          │    │ • SMS Notifications      │                   │  
│  │ • Energy Consumption     │    │ • Notification Settings  │                   │  
│  └──────────────────────────┘    └──────────────────────────┘                   │  
│                                                                                 │

└─────────────────────────────────────────────────────────────────────────────────┘

### **5.3 Ubiquitous Language**

#### Parking Context

* Parking Lot: A physical facility with multiple parking spots  
* Parking Spot: An individual space within a parking lot  
* Availability: The number of free spots in a parking lot  
* Occupancy: The number of occupied spots  
* Peak Hours: Times of high demand with premium pricing

#### Booking Context

* Booking: A reservation for a parking spot  
* Check-in: Confirming arrival at the parking spot  
* Check-out: Ending the parking session  
* Extension: Increasing the booking duration  
* Cancellation: Removing a booking before the start time  
* No-show: Failure to check-in for a booking

#### Payment Context

* Payment: A financial transaction for a booking  
* Refund: Returning payment to the customer  
* Wallet: Digital balance for storing funds  
* Loyalty Points: Rewards earned through bookings  
* Payment Method: Credit card, PayPal, etc.

#### Charging Context

* Charging Station: EV charging equipment  
* Connector: The physical cable/plug for charging  
* Charging Session: A period of EV charging  
* Energy Consumption: Electricity used in kWh  
* OCPP: Open Charge Point Protocol for station communication

### **5.4 Domain Models**

#### Entities

text

User  
├── id: UUID  
├── name: String  
├── email: String  
├── phone: String  
├── loyalty\_points: Integer  
├── vehicles: List\<Vehicle\>  
├── bookings: List\<Booking\>  
├── payments: List\<Payment\>  
└── preferences: UserPreferences

ParkingLot  
├── id: UUID  
├── name: String  
├── address: Address  
├── location: Location  
├── total\_spots: Integer  
├── available\_spots: Integer  
├── reserved\_spots: Integer  
├── base\_price: Money  
├── pricing\_strategy: PricingStrategy  
├── operating\_hours: OperatingHours  
├── amenities: List\<String\>  
├── rating: Float  
└── spots: List\<ParkingSpot\>

Booking  
├── id: UUID  
├── user: User  
├── parking\_lot: ParkingLot  
├── spot: ParkingSpot  
├── vehicle: Vehicle  
├── start\_time: DateTime  
├── end\_time: DateTime  
├── status: BookingStatus  
├── amount: Money  
├── payment\_status: PaymentStatus  
├── check\_in\_time: DateTime  
└── check\_out\_time: DateTime

ChargingSession  
├── id: UUID  
├── user: User  
├── station: ChargingStation  
├── connector: ChargingConnector  
├── vehicle: Vehicle  
├── start\_time: DateTime  
├── end\_time: DateTime  
├── energy\_used: Float  
├── cost: Money  
├── status: ChargingStatus

└── meter\_start: Float

#### Value Objects

text

Address  
├── street: String  
├── city: String  
├── state: String  
├── country: String  
├── postal\_code: String  
└── formatted: String

Location  
├── latitude: Float  
├── longitude: Float  
└── altitude: Float

Money  
├── amount: Decimal  
└── currency: String  
    ├── add(other: Money) \-\> Money  
    ├── subtract(other: Money) \-\> Money  
    ├── multiply(factor: Float) \-\> Money  
    └── format() \-\> String

OperatingHours  
├── monday: DayHours  
├── tuesday: DayHours  
├── wednesday: DayHours  
├── thursday: DayHours  
├── friday: DayHours  
├── saturday: DayHours  
├── sunday: DayHours  
└── is\_open(date: DateTime) \-\> Boolean

Contact  
├── name: String  
├── phone: String  
└── email: String

Image  
├── url: String  
├── alt: String  
├── width: Integer  
├── height: Integer  
├── is\_primary: Boolean

└── order: Integer

#### Aggregates

text

ParkingLotAggregate  
├── ParkingLot (Root)  
├── ParkingSpots  
├── Amenities  
├── OperatingHours  
└── PricingRules

BookingAggregate  
├── Booking (Root)  
├── User  
├── ParkingLot  
├── ParkingSpot  
├── Vehicle  
└── Payments

UserAggregate  
├── User (Root)  
├── Vehicles  
├── Bookings  
├── Payments

└── Preferences

---

## **6\. Microservices Architecture**

### **6.1 Service Identification**

Based on the bounded contexts identified in the DDD analysis, the following microservices are proposed:

| Service | Bounded Context | Description |
| :---- | :---- | :---- |
| Parking Service | Parking Context | Manages parking lots, spots, availability, and dynamic pricing |
| Booking Service | Booking Context | Handles reservations, check-in/check-out, and booking management |
| Payment Service | Payment Context | Processes payments, refunds, and wallet management |
| User Service | User Context | Manages user profiles, authentication, and vehicles |
| Charging Service | Charging Context | Manages EV charging stations, sessions, and OCPP protocol |
| Notification Service | Notification Context | Sends email, push, and SMS notifications |
| Report Service | Reporting Context | Generates analytics and business reports |
| API Gateway | \- | Single entry point for all client requests |

### **6.2 APIs/Endpoints**

#### External Facing APIs (Public)

text

Parking Service  
├── GET    /api/v1/parking/lots  
├── POST   /api/v1/parking/lots  
├── GET    /api/v1/parking/lots/{id}  
├── PUT    /api/v1/parking/lots/{id}  
├── DELETE /api/v1/parking/lots/{id}  
├── GET    /api/v1/parking/lots/{id}/availability  
├── GET    /api/v1/parking/lots/nearby  
└── GET    /api/v1/parking/lots/search

Booking Service  
├── GET    /api/v1/bookings  
├── POST   /api/v1/bookings  
├── GET    /api/v1/bookings/{id}  
├── PUT    /api/v1/bookings/{id}  
├── DELETE /api/v1/bookings/{id}  
├── POST   /api/v1/bookings/{id}/check-in  
├── POST   /api/v1/bookings/{id}/check-out  
├── POST   /api/v1/bookings/{id}/extend  
└── POST   /api/v1/bookings/{id}/cancel

Payment Service  
├── GET    /api/v1/payments/methods  
├── POST   /api/v1/payments/methods  
├── DELETE /api/v1/payments/methods/{id}  
├── POST   /api/v1/payments/process  
├── GET    /api/v1/payments/history  
├── GET    /api/v1/payments/{id}  
└── GET    /api/v1/payments/{id}/receipt

User Service  
├── GET    /api/v1/users/profile  
├── PUT    /api/v1/users/profile  
├── GET    /api/v1/users/vehicles  
├── POST   /api/v1/users/vehicles  
├── PUT    /api/v1/users/vehicles/{id}  
├── DELETE /api/v1/users/vehicles/{id}  
└── POST   /api/v1/users/vehicles/{id}/default

Charging Service  
├── GET    /api/v1/charging/stations  
├── POST   /api/v1/charging/sessions  
├── GET    /api/v1/charging/sessions/{id}  
├── POST   /api/v1/charging/sessions/{id}/stop  
├── GET    /api/v1/charging/sessions/history

└── GET    /api/v1/charging/stations/nearby

#### Internal Service-to-Service APIs (gRPC)

text

Parking Service (Internal)  
├── GetAvailability(ParkingLotId, TimeRange) \-\> AvailabilityResponse  
├── ReserveSpot(ParkingLotId, SpotId) \-\> ReserveResponse  
└── ReleaseSpot(ParkingLotId, SpotId) \-\> ReleaseResponse

Booking Service (Internal)  
├── ValidateBooking(BookingData) \-\> ValidationResponse  
├── ConfirmBooking(BookingId) \-\> ConfirmResponse  
└── CancelBooking(BookingId, Reason) \-\> CancelResponse

Payment Service (Internal)  
├── ProcessPayment(PaymentRequest) \-\> PaymentResponse  
├── RefundPayment(PaymentId) \-\> RefundResponse  
└── GetPaymentStatus(PaymentId) \-\> StatusResponse

User Service (Internal)  
├── GetUserProfile(UserId) \-\> UserProfile  
├── ValidateUser(UserId) \-\> ValidationResponse

└── GetUserVehicles(UserId) \-\> VehicleList

### **6.3 Database Per Service**

Each service has its own dedicated database:

| Service | Database | Purpose |
| :---- | :---- | :---- |
| Parking Service | PostgreSQL | Parking lots, spots, availability, pricing rules |
| Booking Service | PostgreSQL | Bookings, check-in/out records, extensions |
| Payment Service | PostgreSQL | Payments, refunds, wallet transactions |
| User Service | PostgreSQL | Users, profiles, vehicles, preferences |
| Charging Service | PostgreSQL | Charging stations, sessions, energy consumption |
| Notification Service | PostgreSQL | Notifications, templates, delivery logs |
| Report Service | Data Warehouse | Analytics, reports, aggregated data |

#### Database Schemas

Parking Service Database

sql

CREATE TABLE parking\_lots (  
    id UUID PRIMARY KEY,  
    name VARCHAR(255) NOT NULL,  
    address JSONB NOT NULL,  
    location GEOGRAPHY(POINT) NOT NULL,  
    total\_spots INTEGER NOT NULL,  
    available\_spots INTEGER NOT NULL,  
    base\_price DECIMAL(10,2) NOT NULL,  
    operating\_hours JSONB,  
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP  
);

CREATE TABLE parking\_spots (  
    id UUID PRIMARY KEY,  
    parking\_lot\_id UUID REFERENCES parking\_lots(id),  
    number VARCHAR(20) NOT NULL,  
    type VARCHAR(50) NOT NULL,  
    status VARCHAR(50) NOT NULL,  
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP

);

Booking Service Database

sql

CREATE TABLE bookings (  
    id UUID PRIMARY KEY,  
    parking\_lot\_id UUID NOT NULL,  
    spot\_id UUID NOT NULL,  
    user\_id UUID NOT NULL,  
    vehicle\_id UUID NOT NULL,  
    start\_time TIMESTAMP NOT NULL,  
    end\_time TIMESTAMP NOT NULL,  
    status VARCHAR(50) NOT NULL,  
    amount DECIMAL(10,2) NOT NULL,  
    payment\_status VARCHAR(50) NOT NULL,  
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP  
);

CREATE TABLE booking\_extensions (  
    id UUID PRIMARY KEY,  
    booking\_id UUID REFERENCES bookings(id),  
    additional\_hours INTEGER NOT NULL,  
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP

);

Payment Service Database

sql

CREATE TABLE payments (  
    id UUID PRIMARY KEY,  
    user\_id UUID NOT NULL,  
    booking\_id UUID NOT NULL,  
    amount DECIMAL(10,2) NOT NULL,  
    method VARCHAR(50) NOT NULL,  
    status VARCHAR(50) NOT NULL,  
    provider\_transaction\_id VARCHAR(255),  
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP  
);

CREATE TABLE payment\_methods (  
    id UUID PRIMARY KEY,  
    user\_id UUID NOT NULL,  
    type VARCHAR(50) NOT NULL,  
    last4 VARCHAR(4),  
    expiry\_month INTEGER,  
    expiry\_year INTEGER,  
    is\_default BOOLEAN DEFAULT FALSE,  
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP

);

---

## **7\. EV Charging Extension**

### **7.1 Business Requirements**

The EV Charging Station Management feature adds the following capabilities:

1. Station Management: Add, update, and remove charging stations  
2. Connector Management: Support multiple connector types (Type 1, Type 2, CCS, CHAdeMO, Tesla)  
3. Session Management: Start, stop, and monitor charging sessions  
4. Energy Tracking: Track energy consumption in kWh  
5. Pricing: Dynamic pricing based on time and energy usage  
6. OCPP Protocol: Communicate with charging stations using OCPP  
7. Reservations: Allow users to reserve charging stations

### **7.2 Domain Model Extensions**

text

ChargingStation (Aggregate Root)  
├── id: UUID  
├── name: String  
├── address: Address  
├── location: Location  
├── connectors: List\<ChargingConnector\>  
├── power\_level: ChargingPowerLevel  
├── status: ChargingStatus  
├── price\_per\_kwh: Money  
├── rating: Float  
├── amenities: List\<String\>  
├── images: List\<Image\>  
└── ocpp\_config: OCPPConfig

ChargingConnector (Entity)  
├── id: UUID  
├── station\_id: UUID  
├── type: ConnectorType  
├── power: Integer  
├── status: ConnectorStatus  
└── vehicle\_id: UUID (optional)

ChargingSession (Aggregate Root)  
├── id: UUID  
├── station: ChargingStation  
├── connector: ChargingConnector  
├── user: User  
├── vehicle: Vehicle  
├── start\_time: DateTime  
├── end\_time: DateTime  
├── energy\_used: Float  
├── cost: Money  
├── status: ChargingStatus  
└── meter\_start: Float

OCPPConfig (Value Object)  
├── protocol: String  
├── version: String  
├── vendor: String  
├── model: String

└── capabilities: JSON

### **7.3 Microservices Integration**

The Charging Service integrates with other services:

1. User Service: Validate user identity and permissions  
2. Vehicle Service: Validate vehicle and EV capabilities  
3. Payment Service: Process charging session payments  
4. Notification Service: Send charging updates and alerts  
5. Booking Service: Coordinate parking and charging bookings

---

## **8\. Conclusion**

### **8.1 Summary of Improvements**

| Aspect | Original Code | Refactored System |
| :---- | :---- | :---- |
| Architecture | Monolithic | Microservices |
| Patterns Used | None | Strategy, Observer, Repository, Factory, Singleton, Command |
| Separation of Concerns | Poor | Clean layered architecture |
| Testability | Difficult | High (dependency injection, interfaces) |
| Scalability | Limited | High (horizontal scaling, event-driven) |
| Maintainability | Low | High (clean code, SOLID principles) |
| Extensibility | Difficult | Easy (new services can be added) |

### **8.2 Design Pattern Justification**

The selected design patterns were chosen based on the specific problems identified in the original codebase:

1. Strategy Pattern: Solves rigid pricing logic, enabling dynamic pricing strategies  
2. Observer Pattern: Decouples event producers from consumers, enabling event-driven architecture  
3. Repository Pattern: Abstracts data access, improving testability  
4. Factory Pattern: Centralizes object creation, enforcing business rules  
5. Singleton Pattern: Provides global access to configuration and logging services  
6. Command Pattern: Enables transaction management and undo/redo capabilities

### **8.3 DDD & Microservices Justification**

The domain-driven design approach was essential for creating a scalable microservices architecture:

1. Bounded Contexts: Clear boundaries between different business domains  
2. Ubiquitous Language: Consistent terminology across the system  
3. Domain Models: Rich domain models with business logic  
4. Service Boundaries: Each service aligned with a bounded context  
5. Database Per Service: Decentralized data management

### **8.4 Future Considerations**

1. API Gateway: Implement a unified API gateway with rate limiting and authentication  
2. Service Mesh: Introduce Istio or Linkerd for service-to-service communication  
3. Event Sourcing: Implement event sourcing for audit trails and replayability  
4. CQRS: Separate read and write models for performance optimization  
5. Observability: Implement distributed tracing and metrics collection  
6. CI/CD: Automate deployment with Kubernetes and GitOps

### **8.5 Conclusion**

The refactored system demonstrates significant improvements in code quality, maintainability, scalability, and extensibility. The implementation of appropriate design patterns, removal of anti-patterns, and adoption of microservices architecture positions EasyParkPlus for successful growth and expansion into new business areas, including EV charging station management.

The system now follows industry best practices, enabling the team to:

* Add new features with minimal impact on existing functionality  
* Scale services independently based on demand  
* Maintain and debug the system more effectively  
* Onboard new developers more quickly  
* Adapt to changing business requirements

---

## **Appendix**

### **A. UML Diagram Legend**

* Structural Diagrams: Show the static structure of the system  
  * Class Diagrams: Show classes, attributes, methods, and relationships  
  * Component Diagrams: Show system components and their dependencies  
* Behavioral Diagrams: Show the dynamic behavior of the system  
  * Sequence Diagrams: Show interactions between objects over time  
  * Activity Diagrams: Show workflow and process flows

### **B. Technology Stack**

| Component | Technology | Version |
| :---- | :---- | :---- |
| Backend Framework | FastAPI (Python) | 0.104.1 |
| Microservices | Python 3.11, Node.js 18 | \- |
| Database | PostgreSQL | 15.x |
| Cache | Redis | 7.x |
| Message Queue | RabbitMQ | 3.12 |
| Containerization | Docker | \- |
| Orchestration | Kubernetes | \- |
| API Gateway | NGINX | 1.25 |

### **C. References**

1. Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley.  
2. Evans, E. (2003). *Domain-Driven Design: Tackling Complexity in the Heart of Software*. Addison-Wesley.  
3. Fowler, M. (2018). *Refactoring: Improving the Design of Existing Code* (2nd ed.). Addison-Wesley.  
4. Newman, S. (2015). *Building Microservices: Designing Fine-Grained Systems*. O'Reilly Media.  
5. Richards, M., & Ford, N. (2020). *Fundamentals of Software Architecture: An Engineering Approach*. O'Reilly Media.

---

Author: Software Engineering Team

Date: 13th August, 2026\.

Version: 2.0.0

Status: Final

---

*This document is confidential and proprietary to EasyParkPlus Inc.*