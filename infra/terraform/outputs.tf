locals {
  public_ip = var.use_elastic_ip ? aws_eip.app[0].public_ip : aws_instance.app.public_ip
}

output "instance_id" {
  value = aws_instance.app.id
}

output "public_ip" {
  value = local.public_ip
}

output "bucket_uploads" {
  description = "Put this in the backend .env as S3_BUCKET_UPLOADS"
  value       = aws_s3_bucket.uploads.bucket
}

output "bucket_pages" {
  description = "Put this in the backend .env as S3_BUCKET_PAGES"
  value       = aws_s3_bucket.pages.bucket
}

output "ssh" {
  value = "ssh -i ~/.ssh/transcripta_ed25519 ubuntu@${local.public_ip}"
}

output "ecr_repo_url" {
  description = "docker tag/push target and the image ref for docker-compose.prod.yml"
  value       = aws_ecr_repository.backend.repository_url
}
