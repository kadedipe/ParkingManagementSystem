# ============================================================================
# Terraform Main Configuration - AWS Infrastructure
# ============================================================================

# parking-management-system/infra/terraform/main.tf

# ============================================================================
# Terraform Configuration
# ============================================================================

terraform {
  required_version = ">= 1.0.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
  
  backend "s3" {
    bucket         = "parking-terraform-state"
    key            = "parking-system/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

# ============================================================================
# Providers
# ============================================================================

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment   = var.environment
      Project       = "parking-system"
      ManagedBy     = "terraform"
      CostCenter    = "engineering"
      Owner         = "devops@parkingapp.com"
    }
  }
}

provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args = [
      "eks",
      "get-token",
      "--cluster-name",
      module.eks.cluster_name,
      "--region",
      var.aws_region
    ]
  }
}

provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args = [
        "eks",
        "get-token",
        "--cluster-name",
        module.eks.cluster_name,
        "--region",
        var.aws_region
      ]
    }
  }
}

# ============================================================================
# Data Sources
# ============================================================================

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# ============================================================================
# Random Resources
# ============================================================================

resource "random_string" "cluster_suffix" {
  length  = 6
  special = false
  upper   = false
}

resource "random_password" "db_password" {
  length  = 24
  special = true
  min_special = 2
}

resource "random_password" "redis_password" {
  length  = 24
  special = true
  min_special = 2
}

resource "random_password" "jwt_secret" {
  length  = 32
  special = true
  min_special = 2
}

resource "random_password" "refresh_token_secret" {
  length  = 32
  special = true
  min_special = 2
}

# ============================================================================
# VPC Configuration
# ============================================================================

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "parking-vpc-${var.environment}"
  cidr = var.vpc_cidr

  azs             = data.aws_availability_zones.available.names
  private_subnets = var.private_subnets
  public_subnets  = var.public_subnets
  database_subnets = var.database_subnets

  enable_nat_gateway     = true
  single_nat_gateway     = var.environment != "prod"
  enable_vpn_gateway     = false
  enable_dns_hostnames   = true
  enable_dns_support     = true

  tags = {
    Name = "parking-vpc-${var.environment}"
  }
}

# ============================================================================
# EKS Cluster Configuration
# ============================================================================

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.0.0"

  cluster_name    = "parking-cluster-${var.environment}-${random_string.cluster_suffix.result}"
  cluster_version = "1.27"

  cluster_endpoint_public_access  = var.environment != "prod"
  cluster_endpoint_private_access = true

  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
  }

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  manage_aws_auth_configmap = true
  aws_auth_roles = [
    {
      rolearn  = module.eks_managed_node_group.iam_role_arn
      username = "system:node:{{EC2PrivateDNSName}}"
      groups   = ["system:bootstrappers", "system:nodes"]
    }
  ]

  eks_managed_node_groups = {
    main = {
      name = "parking-node-group-${var.environment}"

      instance_types = var.instance_types
      min_size       = var.min_nodes
      max_size       = var.max_nodes
      desired_size   = var.desired_nodes

      capacity_type  = var.environment == "prod" ? "ON_DEMAND" : "SPOT"
      
      update_config = {
        max_unavailable = 1
      }

      tags = {
        Name = "parking-node-${var.environment}"
      }
    }
  }

  tags = {
    Environment = var.environment
    Project     = "parking-system"
  }
}

# ============================================================================
# RDS PostgreSQL Configuration
# ============================================================================

module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "6.0.0"

  identifier = "parking-${var.environment}"

  engine         = "postgres"
  engine_version = "15.3"
  instance_class = var.db_instance_class

  allocated_storage     = var.db_storage
  storage_encrypted     = true
  storage_type          = "gp3"
  max_allocated_storage = var.db_max_storage

  db_name  = "parking_db"
  username = "parking_user"
  password = random_password.db_password.result
  port     = 5432

  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  subnet_ids             = module.vpc.database_subnets
  family                 = "postgres15"

  backup_retention_period      = var.db_backup_retention
  backup_window               = "03:00-04:00"
  maintenance_window          = "sun:04:00-sun:05:00"
  copy_tags_to_snapshot       = true
  deletion_protection         = var.environment == "prod"
  skip_final_snapshot         = var.environment != "prod"
  final_snapshot_identifier   = var.environment == "prod" ? "parking-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  enabled_cloudwatch_logs_exports = ["postgresql"]
  performance_insights_enabled    = true
  performance_insights_retention_period = 7

  tags = {
    Environment = var.environment
    Project     = "parking-system"
  }
}

# ============================================================================
# ElastiCache Redis Configuration
# ============================================================================

module "elasticache" {
  source  = "terraform-aws-modules/elasticache/aws"
  version = "1.2.0"

  cluster_id           = "parking-${var.environment}"
  engine               = "redis"
  engine_version       = "7.0"
  node_type           = var.redis_node_type
  num_cache_nodes     = 1
  parameter_group_name = "default.redis7"
  port                = 6379

  subnet_ids = module.vpc.private_subnets
  security_group_ids = [aws_security_group.redis_sg.id]

  family = "redis7"

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  tags = {
    Environment = var.environment
    Project     = "parking-system"
  }
}

# ============================================================================
# S3 Buckets
# ============================================================================

resource "aws_s3_bucket" "app_storage" {
  bucket = "parking-${var.environment}-storage-${data.aws_caller_identity.current.account_id}"
  
  tags = {
    Environment = var.environment
    Project     = "parking-system"
  }
}

resource "aws_s3_bucket_versioning" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id
  versioning_configuration {
    status = var.environment == "prod" ? "Enabled" : "Suspended"
  }
}

resource "aws_s3_bucket_encryption" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_s3_bucket_public_access_block" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket" "logs" {
  bucket = "parking-${var.environment}-logs-${data.aws_caller_identity.current.account_id}"
  
  tags = {
    Environment = var.environment
    Project     = "parking-system"
  }
}

resource "aws_s3_bucket_versioning" "logs" {
  bucket = aws_s3_bucket.logs.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    id     = "archive-logs"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }
}

# ============================================================================
# Security Groups
# ============================================================================

resource "aws_security_group" "rds_sg" {
  name        = "parking-rds-${var.environment}"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_sg.id]
  }

  tags = {
    Environment = var.environment
    Project     = "parking-system"
  }
}

resource "aws_security_group" "redis_sg" {
  name        = "parking-redis-${var.environment}"
  description = "Security group for Redis"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_sg.id]
  }

  tags = {
    Environment = var.environment
    Project     = "parking-system"
  }
}

resource "aws_security_group" "eks_sg" {
  name        = "parking-eks-${var.environment}"
  description = "Security group for EKS cluster"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Environment = var.environment
    Project     = "parking-system"
  }
}

# ============================================================================
# Route53 Configuration
# ============================================================================

data "aws_route53_zone" "main" {
  name = var.domain_name
}

resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "api.${var.domain_name}"
  type    = "A"

  alias {
    name                   = module.eks.cluster_oidc_issuer_url
    zone_id               = data.aws_route53_zone.main.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "app" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = module.eks.cluster_oidc_issuer_url
    zone_id               = data.aws_route53_zone.main.zone_id
    evaluate_target_health = true
  }
}

# ============================================================================
# ACM Certificates
# ============================================================================

resource "aws_acm_certificate" "main" {
  domain_name       = "*.${var.domain_name}"
  validation_method = "DNS"

  subject_alternative_names = [
    var.domain_name,
    "*.${var.domain_name}"
  ]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Environment = var.environment
    Project     = "parking-system"
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = data.aws_route53_zone.main.zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# ============================================================================
# CloudWatch Alarms
# ============================================================================

resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "parking-cpu-high-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name        = "CPUUtilization"
  namespace          = "AWS/ECS"
  period             = "60"
  statistic          = "Average"
  threshold          = "80"
  alarm_description  = "This metric monitors ecs cpu utilization"
  alarm_actions      = [aws_sns_topic.alerts.arn]

  tags = {
    Environment = var.environment
    Project     = "parking-system"
  }
}

resource "aws_cloudwatch_metric_alarm" "memory_high" {
  alarm_name          = "parking-memory-high-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name        = "MemoryUtilization"
  namespace          = "AWS/ECS"
  period             = "60"
  statistic          = "Average"
  threshold          = "80"
  alarm_description  = "This metric monitors ecs memory utilization"
  alarm_actions      = [aws_sns_topic.alerts.arn]

  tags = {
    Environment = var.environment
    Project     = "parking-system"
  }
}

# ============================================================================
# SNS Topics
# ============================================================================

resource "aws_sns_topic" "alerts" {
  name = "parking-alerts-${var.environment}"
  
  tags = {
    Environment = var.environment
    Project     = "parking-system"
  }
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# ============================================================================
# Outputs
# ============================================================================

output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.db_instance_endpoint
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = module.elasticache.cache_nodes[0].address
}

output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.app_storage.id
}

output "db_password" {
  description = "Database password"
  value       = random_password.db_password.result
  sensitive   = true
}

output "redis_password" {
  description = "Redis password"
  value       = random_password.redis_password.result
  sensitive   = true
}

output "jwt_secret" {
  description = "JWT secret"
  value       = random_password.jwt_secret.result
  sensitive   = true
}