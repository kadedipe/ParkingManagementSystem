# ============================================================================
# Architecture Diagram Generator - Python Script
# ============================================================================

# parking-management-system/docs/architecture/diagrams/generate_diagram.py

from diagrams import Diagram, Edge, Cluster
from diagrams.aws.compute import EC2, ECS, Lambda
from diagrams.aws.network import ALB, Route53, CloudFront, APIGateway
from diagrams.aws.database import RDS, DynamoDB, ElastiCache
from diagrams.aws.storage import S3
from diagrams.aws.analytics import Redshift, Glue
from diagrams.aws.management import Cloudwatch
from diagrams.aws.security import Cognito, WAF, Shield
from diagrams.onprem.client import Client, Users
from diagrams.onprem.queue import RabbitMQ
from diagrams.onprem.monitoring import Grafana, Prometheus
from diagrams.onprem.logging import Logstash, Elasticsearch, Kibana
from diagrams.programming.language import Python, Nodejs
from diagrams.generic.device import Mobile, Tablet
from diagrams.custom import Custom

def create_architecture_diagram():
    with Diagram(
        "Parking Management System Architecture",
        filename="parking_management_architecture",
        outformat=["png", "svg"],
        show=False,
        direction="TB"
    ):
        # ============================================================================
        # Client Layer
        # ============================================================================
        with Cluster("Client Layer"):
            mobile = Mobile("Mobile App\nReact Native")
            web = Client("Web App\nReact/Next.js")
            admin = Client("Admin Dashboard\nReact")
            third_party = Client("3rd Party APIs")

            clients = [mobile, web, admin, third_party]

        # ============================================================================
        # API Gateway Layer
        # ============================================================================
        with Cluster("API Gateway Layer"):
            route53 = Route53("DNS Management")
            cloudfront = CloudFront("CDN")
            waf = WAF("Web Application Firewall")
            api_gateway = APIGateway("API Gateway\nNGINX/Kong")
            alb = ALB("Load Balancer\nHAProxy/ALB")

        # ============================================================================
        # Authentication Layer
        # ============================================================================
        with Cluster("Authentication Layer"):
            cognito = Cognito("Auth Service\nJWT/OAuth2")
            waf_shield = Shield("Security\nWAF/Shield")

        # ============================================================================
        # Service Mesh
        # ============================================================================
        with Cluster("Service Mesh"):
            with Cluster("Core Services"):
                parking = Python("Parking Service\nPython/FastAPI")
                booking = Nodejs("Booking Service\nNode.js/NestJS")
                payment = Python("Payment Service\nPython/FastAPI")
                user = Nodejs("User Service\nNode.js/NestJS")
                vehicle = Python("Vehicle Service\nPython/FastAPI")
                charging = Python("Charging Service\nPython/FastAPI")
                notification = Nodejs("Notification Service\nNode.js/NestJS")
                report = Python("Report Service\nPython/FastAPI")

                services = [
                    parking, booking, payment, user,
                    vehicle, charging, notification, report
                ]

            with Cluster("Shared Services"):
                consul = Custom("Service Discovery\nConsul", "./icons/consul.png")
                rabbitmq = RabbitMQ("Message Queue\nRabbitMQ/Kafka")
                redis = ElastiCache("Cache Layer\nRedis Cluster")
                s3 = S3("File Storage\nS3/MinIO")

                shared_services = [consul, rabbitmq, redis, s3]

        # ============================================================================
        # Data Layer
        # ============================================================================
        with Cluster("Data Layer"):
            with Cluster("Primary Database"):
                rds_primary = RDS("PostgreSQL\nPrimary")
            
            with Cluster("Read Replicas"):
                rds_replica = RDS("PostgreSQL\nRead Replicas")
            
            elasticsearch = Elasticsearch("Elasticsearch\nSearch/Logs")
            
            with Cluster("Data Warehouse"):
                redshift = Redshift("Redshift/BigQuery\nAnalytics")
                glue = Glue("ETL Pipeline")

            data_services = [rds_primary, rds_replica, elasticsearch, redshift, glue]

        # ============================================================================
        # Monitoring & Observability
        # ============================================================================
        with Cluster("Monitoring & Observability"):
            prometheus = Prometheus("Metrics\nPrometheus")
            grafana = Grafana("Dashboards\nGrafana")
            
            with Cluster("ELK Stack"):
                logstash = Logstash("Log Collector")
                elasticsearch_logs = Elasticsearch("Elasticsearch\nLog Storage")
                kibana = Kibana("Visualization\nKibana")
            
            jaeger = Custom("Distributed Tracing\nJaeger", "./icons/jaeger.png")
            cloudwatch = Cloudwatch("AWS\nCloudWatch")

            monitoring = [
                prometheus, grafana, logstash,
                elasticsearch_logs, kibana, jaeger, cloudwatch
            ]

        # ============================================================================
        # Connections
        # ============================================================================
        # Client to API Gateway
        for client in clients:
            client >> Edge(color="#f5a623") >> route53
        
        route53 >> Edge(color="#f5a623") >> cloudfront
        cloudfront >> Edge(color="#f5a623") >> waf
        waf >> Edge(color="#f5a623") >> api_gateway
        api_gateway >> Edge(color="#f5a623") >> alb

        # API Gateway to Auth
        alb >> Edge(color="#f5a623") >> cognito
        alb >> Edge(color="#f5a623") >> waf_shield

        # API Gateway to Services
        for service in services:
            alb >> Edge(color="#f5a623") >> service

        # Services to Shared Services
        for service in services:
            service >> Edge(color="#4a9eff") >> consul
            service >> Edge(color="#4a9eff") >> rabbitmq
            service >> Edge(color="#4a9eff") >> redis
            service >> Edge(color="#4a9eff") >> s3

        # Services to Data Layer
        for service in services:
            service >> Edge(color="#4a9eff") >> rds_primary
            service >> Edge(color="#4a9eff") >> elasticsearch

        # Data Layer Internal Connections
        rds_primary >> Edge(color="#4a9eff") >> rds_replica
        rds_primary >> Edge(color="#4a9eff") >> redshift
        rds_primary >> Edge(color="#4a9eff") >> glue

        # Monitoring Connections
        for service in services:
            service >> Edge(color="#ff6b6b", style="dashed") >> prometheus
            service >> Edge(color="#ff6b6b", style="dashed") >> logstash
            service >> Edge(color="#ff6b6b", style="dashed") >> jaeger

        prometheus >> Edge(color="#ff6b6b") >> grafana
        logstash >> Edge(color="#ff6b6b") >> elasticsearch_logs
        elasticsearch_logs >> Edge(color="#ff6b6b") >> kibana

if __name__ == "__main__":
    create_architecture_diagram()