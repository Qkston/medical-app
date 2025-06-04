# S3 Module for Medical App Storage
module "s3_buckets" {
  source = "./modules/s3"

  bucket_prefix         = local.s3_bucket_prefix
  tags                 = local.common_tags
  versioning_enabled   = var.s3_versioning_enabled
  force_destroy        = var.s3_force_destroy
  allowed_cors_origins = var.allowed_cors_origins
  enable_cloudfront    = var.environment == "prod" ? true : false  # Enable CloudFront only in production
} 