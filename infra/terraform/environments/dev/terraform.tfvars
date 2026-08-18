# ============================================================================
# Terraform Environment - Development Configuration
# ============================================================================

# parking-management-system/infra/terraform/environments/dev/terraform.tfvars

environment   = "dev"
aws_region    = "us-east-1"
domain_name   = "dev.parkingapp.com"

# Network
vpc_cidr         = "10.0.0.0/16"
private_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
public_subnets   = ["10.0.101.0/24", "10.0.102.0/24"]
database_subnets = ["10.0.201.0/24", "10.0.202.0/24"]

# EKS
instance_types = ["t3.medium"]
min_nodes      = 1
max_nodes      = 3
desired_nodes  = 2

# Database
db_instance_class    = "db.t3.micro"
db_storage          = 20
db_max_storage      = 50
db_backup_retention = 3

# Redis
redis_node_type = "cache.t3.micro"

# Alerts
alert_email = "dev-alerts@parkingapp.com"