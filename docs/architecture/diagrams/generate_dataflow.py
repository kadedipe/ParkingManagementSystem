# ============================================================================
# Data Flow Diagram - Python Script
# ============================================================================

# parking-management-system/docs/architecture/diagrams/generate_dataflow.py

from diagrams import Diagram, Edge, Cluster
from diagrams.aws.compute import ECS
from diagrams.aws.database import RDS, ElastiCache
from diagrams.aws.storage import S3
from diagrams.onprem.queue import RabbitMQ
from diagrams.programming.language import Python, Nodejs
from diagrams.generic.device import Mobile

def create_dataflow_diagram():
    with Diagram(
        "Data Flow Diagram",
        filename="dataflow_diagram",
        outformat=["png", "svg"],
        show=False,
        direction="LR"
    ):
        # ============================================================================
        # Sources
        # ============================================================================
        user = Mobile("User")
        parking_lot = ECS("Parking Lot\nSensors")
        admin = ECS("Admin")

        # ============================================================================
        # Services
        # ============================================================================
        with Cluster("Services"):
            api_gateway = ECS("API Gateway")
            
            with Cluster("Core"):
                booking = Nodejs("Booking\nService")
                parking = Python("Parking\nService")
                payment = Python("Payment\nService")
                notification = Nodejs("Notification\nService")
                report = Python("Report\nService")

            with Cluster("Data"):
                cache = ElastiCache("Redis\nCache")
                db = RDS("PostgreSQL\nDatabase")
                search = ECS("Elasticsearch")
                queue = RabbitMQ("Message\nQueue")

        # ============================================================================
        # Data Flow
        # ============================================================================
        # User flow
        user >> Edge(color="#4a9eff", label="1. Create Booking") >> api_gateway
        api_gateway >> Edge(color="#4a9eff", label="2. Validate") >> booking
        booking >> Edge(color="#4a9eff", label="3. Check Availability") >> parking
        parking >> Edge(color="#4a9eff", label="4. Available") >> booking
        booking >> Edge(color="#4a9eff", label="5. Process Payment") >> payment
        booking >> Edge(color="#4a9eff", label="6. Save Booking") >> db
        booking >> Edge(color="#4a9eff", label="7. Cache Booking") >> cache
        booking >> Edge(color="#4a9eff", label="8. Send Confirmation") >> notification
        notification >> Edge(color="#4a9eff", label="9. Notify User") >> user

        # Parking lot flow
        parking_lot >> Edge(color="#f5a623", label="1. Status Update") >> parking
        parking >> Edge(color="#f5a623", label="2. Update Availability") >> db
        parking >> Edge(color="#f5a623", label="3. Update Cache") >> cache
        parking >> Edge(color="#f5a623", label="4. Update Search") >> search

        # Admin flow
        admin >> Edge(color="#ff6b6b", label="1. Generate Report") >> report
        report >> Edge(color="#ff6b6b", label="2. Query Data") >> db
        report >> Edge(color="#ff6b6b", label="3. Query Cache") >> cache
        report >> Edge(color="#ff6b6b", label="4. Generate PDF") >> admin

        # Event flow
        booking >> Edge(color="#4a9eff", style="dashed", label="Event: Booking Created") >> queue
        notification >> Edge(color="#4a9eff", style="dashed", label="Event: Send Notification") >> queue
        parking >> Edge(color="#4a9eff", style="dashed", label="Event: Availability Changed") >> queue

if __name__ == "__main__":
    create_dataflow_diagram()