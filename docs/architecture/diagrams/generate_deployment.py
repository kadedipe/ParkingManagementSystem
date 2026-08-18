# ============================================================================
# Deployment Diagram - Python Script
# ============================================================================

# parking-management-system/docs/architecture/diagrams/generate_deployment.py

from diagrams import Diagram, Edge, Cluster
from diagrams.aws.compute import EKS, ECS, Lambda
from diagrams.aws.network import VPC, Subnet, InternetGateway, Route53
from diagrams.aws.database import RDS, ElastiCache
from diagrams.aws.storage import S3
from diagrams.aws.management import Cloudwatch
from diagrams.aws.security import WAF, Shield
from diagrams.onprem.container import Docker
from diagrams.k8s.compute import Pod
from diagrams.k8s.network import Ingress, Service
from diagrams.k8s.storage import PVC
from diagrams.k8s.group import Namespace

def create_deployment_diagram():
    with Diagram(
        "Deployment Architecture",
        filename="deployment_architecture",
        outformat=["png", "svg"],
        show=False,
        direction="TB"
    ):
        # ============================================================================
        # AWS Infrastructure
        # ============================================================================
        with Cluster("AWS Cloud"):
            vpc = VPC("VPC")
            
            with Cluster("Public Subnets"):
                internet_gateway = InternetGateway("Internet Gateway")
                route53 = Route53("Route 53")
                waf = WAF("WAF")
                shield = Shield("Shield")
                cloudwatch = Cloudwatch("CloudWatch")
            
            with Cluster("Private Subnets"):
                with Cluster("EKS Cluster"):
                    namespace = Namespace("parking-system")
                    
                    with Cluster("Services"):
                        api_gateway = Service("API Gateway\nService")
                        ingress = Ingress("Ingress\nController")
                        
                        with Cluster("Microservices"):
                            with Cluster("Parking"):
                                parking_pod = Pod("Parking\nPod")
                                parking_pvc = PVC("Parking\nPVC")
                            
                            with Cluster("Booking"):
                                booking_pod = Pod("Booking\nPod")
                                booking_pvc = PVC("Booking\nPVC")
                            
                            with Cluster("Payment"):
                                payment_pod = Pod("Payment\nPod")
                                payment_pvc = PVC("Payment\nPVC")
                            
                            with Cluster("User"):
                                user_pod = Pod("User\nPod")
                                user_pvc = PVC("User\nPVC")
                            
                            with Cluster("Vehicle"):
                                vehicle_pod = Pod("Vehicle\nPod")
                                vehicle_pvc = PVC("Vehicle\nPVC")
                            
                            with Cluster("Charging"):
                                charging_pod = Pod("Charging\nPod")
                                charging_pvc = PVC("Charging\nPVC")
                            
                            with Cluster("Notification"):
                                notification_pod = Pod("Notification\nPod")
                                notification_pvc = PVC("Notification\nPVC")
                            
                            with Cluster("Report"):
                                report_pod = Pod("Report\nPod")
                                report_pvc = PVC("Report\nPVC")
                
                with Cluster("Data Layer"):
                    with Cluster("PostgreSQL"):
                        rds_primary = RDS("Primary")
                        rds_replica = RDS("Read Replica")
                    
                    redis = ElastiCache("Redis\nCluster")
                    
                    with Cluster("Storage"):
                        s3_app = S3("App Storage")
                        s3_logs = S3("Log Storage")
                        s3_backups = S3("Backups")
            
            with Cluster("Monitoring"):
                prometheus = ECS("Prometheus")
                grafana = ECS("Grafana")
                elasticsearch = ECS("Elasticsearch")
                kibana = ECS("Kibana")
            
            with Cluster("CI/CD"):
                github_actions = ECS("GitHub Actions")
                ecr = ECS("ECR")

        # ============================================================================
        # Connections
        # ============================================================================
        # Internet to AWS
        internet_gateway >> Edge(color="#4a9eff") >> waf
        internet_gateway >> Edge(color="#4a9eff") >> shield
        waf >> Edge(color="#4a9eff") >> route53
        
        # AWS to EKS
        route53 >> Edge(color="#4a9eff") >> ingress
        ingress >> Edge(color="#4a9eff") >> api_gateway
        
        # API Gateway to Services
        api_gateway >> Edge(color="#4a9eff") >> parking_pod
        api_gateway >> Edge(color="#4a9eff") >> booking_pod
        api_gateway >> Edge(color="#4a9eff") >> payment_pod
        api_gateway >> Edge(color="#4a9eff") >> user_pod
        api_gateway >> Edge(color="#4a9eff") >> vehicle_pod
        api_gateway >> Edge(color="#4a9eff") >> charging_pod
        api_gateway >> Edge(color="#4a9eff") >> notification_pod
        api_gateway >> Edge(color="#4a9eff") >> report_pod

        # Services to Data Layer
        parking_pod >> Edge(color="#f5a623") >> rds_primary
        booking_pod >> Edge(color="#f5a623") >> rds_primary
        payment_pod >> Edge(color="#f5a623") >> rds_primary
        user_pod >> Edge(color="#f5a623") >> rds_primary
        vehicle_pod >> Edge(color="#f5a623") >> rds_primary
        charging_pod >> Edge(color="#f5a623") >> rds_primary
        notification_pod >> Edge(color="#f5a623") >> rds_primary
        report_pod >> Edge(color="#f5a623") >> rds_primary

        # Read Replicas
        rds_primary >> Edge(color="#f5a623") >> rds_replica
        report_pod >> Edge(color="#f5a623") >> rds_replica

        # Redis Cache
        parking_pod >> Edge(color="#ff6b6b") >> redis
        booking_pod >> Edge(color="#ff6b6b") >> redis
        payment_pod >> Edge(color="#ff6b6b") >> redis
        user_pod >> Edge(color="#ff6b6b") >> redis
        vehicle_pod >> Edge(color="#ff6b6b") >> redis
        charging_pod >> Edge(color="#ff6b6b") >> redis
        notification_pod >> Edge(color="#ff6b6b") >> redis
        report_pod >> Edge(color="#ff6b6b") >> redis

        # S3 Storage
        parking_pod >> Edge(color="#4a9eff") >> s3_app
        booking_pod >> Edge(color="#4a9eff") >> s3_app
        payment_pod >> Edge(color="#4a9eff") >> s3_app
        user_pod >> Edge(color="#4a9eff") >> s3_app
        vehicle_pod >> Edge(color="#4a9eff") >> s3_app
        charging_pod >> Edge(color="#4a9eff") >> s3_app
        notification_pod >> Edge(color="#4a9eff") >> s3_app
        report_pod >> Edge(color="#4a9eff") >> s3_app

        # Monitoring
        parking_pod >> Edge(color="#ff6b6b", style="dashed") >> prometheus
        booking_pod >> Edge(color="#ff6b6b", style="dashed") >> prometheus
        payment_pod >> Edge(color="#ff6b6b", style="dashed") >> prometheus
        user_pod >> Edge(color="#ff6b6b", style="dashed") >> prometheus
        vehicle_pod >> Edge(color="#ff6b6b", style="dashed") >> prometheus
        charging_pod >> Edge(color="#ff6b6b", style="dashed") >> prometheus
        notification_pod >> Edge(color="#ff6b6b", style="dashed") >> prometheus
        report_pod >> Edge(color="#ff6b6b", style="dashed") >> prometheus

        prometheus >> Edge(color="#ff6b6b") >> grafana

        # Logging
        parking_pod >> Edge(color="#4a9eff", style="dashed") >> elasticsearch
        booking_pod >> Edge(color="#4a9eff", style="dashed") >> elasticsearch
        payment_pod >> Edge(color="#4a9eff", style="dashed") >> elasticsearch
        user_pod >> Edge(color="#4a9eff", style="dashed") >> elasticsearch
        vehicle_pod >> Edge(color="#4a9eff", style="dashed") >> elasticsearch
        charging_pod >> Edge(color="#4a9eff", style="dashed") >> elasticsearch
        notification_pod >> Edge(color="#4a9eff", style="dashed") >> elasticsearch
        report_pod >> Edge(color="#4a9eff", style="dashed") >> elasticsearch

        elasticsearch >> Edge(color="#4a9eff") >> kibana

        # CI/CD
        github_actions >> Edge(color="#4a9eff") >> ecr
        ecr >> Edge(color="#4a9eff") >> parking_pod
        ecr >> Edge(color="#4a9eff") >> booking_pod
        ecr >> Edge(color="#4a9eff") >> payment_pod
        ecr >> Edge(color="#4a9eff") >> user_pod
        ecr >> Edge(color="#4a9eff") >> vehicle_pod
        ecr >> Edge(color="#4a9eff") >> charging_pod
        ecr >> Edge(color="#4a9eff") >> notification_pod
        ecr >> Edge(color="#4a9eff") >> report_pod

if __name__ == "__main__":
    create_deployment_diagram()