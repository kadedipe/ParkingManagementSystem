# ============================================================================
# Terraform Environment - Staging Configuration
# ============================================================================

# parking-management-system/infra/terraform/environments/staging/terraform.tfvars

environment   = "staging"
aws_region    = "us-east-1"
domain_name   = "staging.parkingapp.com"

# Network
vpc_cidr         = "10.0.0.0/16"
private_subnets  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
public_subnets   = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
database_subnets = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]

# EKS
instance_types = ["t3.medium", "t3.large"]
min_nodes      = 2
max_nodes      = 5
desired_nodes  = 3

# Database
db_instance_class    = "db.t3.medium"
db_storage          = 50
db_max_storage      = 100
db_backup_retention = 7

# Redis
redis_node_type = "cache.t3.small"

# Alerts
alert_email = "staging-alerts@parkingapp.com"