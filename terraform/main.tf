terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }

  # Uncomment and configure backend when ready
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "medical-app/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "medical-app"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# Data sources for existing resources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Local values for consistent naming
locals {
  project_name = "medical-app"
  common_tags = {
    Project     = local.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
  
  # S3 bucket naming convention
  s3_bucket_prefix = "${local.project_name}-${var.environment}"
} 