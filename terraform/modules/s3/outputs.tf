# Medical Files Bucket Outputs
output "medical_files_bucket_name" {
  description = "Name of the medical files S3 bucket"
  value       = aws_s3_bucket.medical_files.bucket
}

output "medical_files_bucket_arn" {
  description = "ARN of the medical files S3 bucket"
  value       = aws_s3_bucket.medical_files.arn
}

output "medical_files_bucket_domain_name" {
  description = "Domain name of the medical files S3 bucket"
  value       = aws_s3_bucket.medical_files.bucket_domain_name
}

output "medical_files_bucket_regional_domain_name" {
  description = "Regional domain name of the medical files S3 bucket"
  value       = aws_s3_bucket.medical_files.bucket_regional_domain_name
}

# Static Assets Bucket Outputs
output "static_assets_bucket_name" {
  description = "Name of the static assets S3 bucket"
  value       = aws_s3_bucket.static_assets.bucket
}

output "static_assets_bucket_arn" {
  description = "ARN of the static assets S3 bucket"
  value       = aws_s3_bucket.static_assets.arn
}

output "static_assets_bucket_domain_name" {
  description = "Domain name of the static assets S3 bucket"
  value       = aws_s3_bucket.static_assets.bucket_domain_name
}

output "static_assets_bucket_regional_domain_name" {
  description = "Regional domain name of the static assets S3 bucket"
  value       = aws_s3_bucket.static_assets.bucket_regional_domain_name
}

# Backup Bucket Outputs
output "backup_bucket_name" {
  description = "Name of the backup S3 bucket"
  value       = aws_s3_bucket.backup.bucket
}

output "backup_bucket_arn" {
  description = "ARN of the backup S3 bucket"
  value       = aws_s3_bucket.backup.arn
}

output "backup_bucket_domain_name" {
  description = "Domain name of the backup S3 bucket"
  value       = aws_s3_bucket.backup.bucket_domain_name
}

output "backup_bucket_regional_domain_name" {
  description = "Regional domain name of the backup S3 bucket"
  value       = aws_s3_bucket.backup.bucket_regional_domain_name
}

# CloudFront Outputs
output "static_assets_cloudfront_url" {
  description = "CloudFront distribution URL for static assets"
  value       = var.enable_cloudfront ? "https://${aws_cloudfront_distribution.static_assets[0].domain_name}" : null
}

output "static_assets_cloudfront_domain_name" {
  description = "CloudFront distribution domain name for static assets"
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.static_assets[0].domain_name : null
}

output "static_assets_cloudfront_id" {
  description = "CloudFront distribution ID for static assets"
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.static_assets[0].id : null
} 