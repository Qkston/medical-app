output "aws_account_id" {
  description = "Current AWS Account ID"
  value       = data.aws_caller_identity.current.account_id
}

output "aws_region" {
  description = "Current AWS Region"
  value       = data.aws_region.current.name
}

# S3 Bucket Outputs
output "medical_files_bucket_name" {
  description = "Name of the medical files S3 bucket"
  value       = module.s3_buckets.medical_files_bucket_name
}

output "medical_files_bucket_arn" {
  description = "ARN of the medical files S3 bucket"
  value       = module.s3_buckets.medical_files_bucket_arn
}

output "static_assets_bucket_name" {
  description = "Name of the static assets S3 bucket"
  value       = module.s3_buckets.static_assets_bucket_name
}

output "static_assets_bucket_arn" {
  description = "ARN of the static assets S3 bucket"
  value       = module.s3_buckets.static_assets_bucket_arn
}

output "backup_bucket_name" {
  description = "Name of the backup S3 bucket"
  value       = module.s3_buckets.backup_bucket_name
}

output "backup_bucket_arn" {
  description = "ARN of the backup S3 bucket"
  value       = module.s3_buckets.backup_bucket_arn
}

# CloudFront Distribution URLs (when implemented)
output "static_assets_cloudfront_url" {
  description = "CloudFront distribution URL for static assets"
  value       = module.s3_buckets.static_assets_cloudfront_url
} 