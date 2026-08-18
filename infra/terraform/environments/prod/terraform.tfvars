# ============================================================================
# Terraform Environment - Production Configuration
# ============================================================================

# parking-management-system/infra/terraform/environments/prod/terraform.tfvars

environment   = "prod"
aws_region    = "us-east-1"
domain_name   = "parkingapp.com"

# Network
vpc_cidr         = "10.0.0.0/16"
private_subnets  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24", "10.0.4.0/24"]
public_subnets   = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24", "10.0.104.0/24"]
database_subnets = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24", "10.0.204.0/24"]

# EKS
instance_types = ["t3.large", "t3.xlarge"]
min_nodes      = 3
max_nodes      = 10
desired_nodes  = 5

# Database
db_instance_class    = "db.t3.large"
db_storage          = 100
db_max_storage      = 500
db_backup_retention = 30

# Redis
redis_node_type = "cache.t3.medium"

# Alerts
alert_email = "prod-alerts@parkingapp.com"