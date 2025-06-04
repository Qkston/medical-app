variable "bucket_prefix" {
  description = "Prefix for bucket names"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "versioning_enabled" {
  description = "Enable versioning on S3 buckets"
  type        = bool
  default     = true
}

variable "force_destroy" {
  description = "Allow force destroy of S3 buckets"
  type        = bool
  default     = false
}

variable "allowed_cors_origins" {
  description = "Allowed CORS origins for S3 buckets"
  type        = list(string)
  default     = ["*"]
}

variable "enable_cloudfront" {
  description = "Enable CloudFront distribution for static assets"
  type        = bool
  default     = false
} 