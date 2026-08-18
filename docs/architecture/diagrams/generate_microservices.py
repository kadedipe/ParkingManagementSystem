# ============================================================================
# Microservices Diagram - Python Script
# ============================================================================

# parking-management-system/docs/architecture/diagrams/generate_microservices.py

from diagrams import Diagram, Edge, Cluster
from diagrams.aws.compute import ECS
from diagrams.aws.network import ALB
from diagrams.aws.database import RDS, ElastiCache
from diagrams.aws.storage import S3
from diagrams.onprem.queue import RabbitMQ
from diagrams.onprem.monitoring import Grafana, Prometheus
from diagrams.programming.language import Python, Nodejs

def create_microservices_diagram():
    with Diagram(
        "Microservices Architecture",
        filename="microservices_architecture",
        outformat=["png", "svg"],
        show=False,
        direction="TB"
    ):
        # ============================================================================
        # API Gateway
        # ============================================================================
        api_gateway = ALB("API Gateway")
        service_discovery = ECS("Service Discovery\nConsul")

        # ============================================================================
        # Services
        # ============================================================================
        with Cluster("Microservices"):
            with Cluster("Core Services"):
                parking = Python("Parking Service")
                booking = Nodejs("Booking Service")
                payment = Python("Payment Service")
                user = Nodejs("User Service")
                vehicle = Python("Vehicle Service")
                charging = Python("Charging Service")
                notification = Nodejs("Notification Service")
                report = Python("Report Service")

                core_services = [
                    parking, booking, payment, user,
                    vehicle, charging, notification, report
                ]

            with Cluster("Shared Services"):
                message_queue = RabbitMQ("Message Queue")
                cache = ElastiCache("Redis Cache")
                storage = S3("File Storage")

                shared_services = [message_queue, cache, storage]

        # ============================================================================
        # Data Layer
        # ============================================================================
        with Cluster("Data Layer"):
            with Cluster("Databases"):
                db_primary = RDS("PostgreSQL Primary")
                db_replicas = RDS("Read Replicas")
                search = Elasticsearch("Elasticsearch")

                databases = [db_primary, db_replicas, search]

        # ============================================================================
        # Monitoring
        # ============================================================================
        prometheus = Prometheus("Prometheus")
        grafana = Grafana("Grafana")

        # ============================================================================
        # Connections
        # ============================================================================
        # API Gateway to Services
        api_gateway >> Edge(color="#4a9eff") >> parking
        api_gateway >> Edge(color="#4a9eff") >> booking
        api_gateway >> Edge(color="#4a9eff") >> payment
        api_gateway >> Edge(color="#4a9eff") >> user
        api_gateway >> Edge(color="#4a9eff") >> vehicle
        api_gateway >> Edge(color="#4a9eff") >> charging
        api_gateway >> Edge(color="#4a9eff") >> notification
        api_gateway >> Edge(color="#4a9eff") >> report

        # Services to Shared Services
        for service in core_services:
            service >> Edge(color="#f5a623", style="dashed") >> message_queue
            service >> Edge(color="#f5a623", style="dashed") >> cache
            service >> Edge(color="#f5a623", style="dashed") >> storage

        # Services to Data Layer
        for service in core_services:
            service >> Edge(color="#ff6b6b", style="dotted") >> db_primary
            service >> Edge(color="#ff6b6b", style="dotted") >> search

        db_primary >> Edge(color="#ff6b6b", style="dotted") >> db_replicas

        # Monitoring
        for service in core_services:
            service >> Edge(color="#4a9eff", style="dashed") >> prometheus

        prometheus >> grafana

        # Service Discovery
        for service in core_services:
            service >> Edge(color="#4a9eff", style="dashed") >> service_discovery

if __name__ == "__main__":
    create_microservices_diagram()