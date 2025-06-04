variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "medical-app"
}

# S3 Configuration Variables
variable "s3_versioning_enabled" {
  description = "Enable versioning on S3 buckets"
  type        = bool
  default     = true
}

variable "s3_encryption_enabled" {
  description = "Enable server-side encryption on S3 buckets"
  type        = bool
  default     = true
}

variable "s3_force_destroy" {
  description = "Allow force destroy of S3 buckets (useful for dev/test environments)"
  type        = bool
  default     = false
}

variable "allowed_cors_origins" {
  description = "Allowed CORS origins for S3 buckets"
  type        = list(string)
  default     = ["http://localhost:3000", "https://localhost:3000"]
} 