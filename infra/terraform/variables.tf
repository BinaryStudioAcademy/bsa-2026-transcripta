variable "project" {
  description = "Name prefix for all resources"
  type        = string
  default     = "transcripta"
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "profile" {
  description = "AWS CLI profile used by Terraform and the stop/start scripts"
  type        = string
  default     = "roman"
}

variable "instance_type" {
  description = "Graviton/arm64. t4g.micro (1 GB) is cheapest for the scaffold; bump to t4g.small (2 GB) before the sharp/pdf pipeline lands."
  type        = string
  default     = "t4g.micro"
}

variable "root_volume_gb" {
  description = "Root EBS size. Holds the OS, Docker images and the Postgres data volume; survives stop/start."
  type        = number
  default     = 15
}

variable "allowed_ssh_cidr" {
  description = "CIDR allowed to SSH (your IP as x.x.x.x/32). HTTP/HTTPS stay open to the world."
  type        = string
}

variable "public_key_path" {
  description = "Public SSH key uploaded to the instance"
  type        = string
  default     = "~/.ssh/transcripta_ed25519.pub"
}

variable "use_elastic_ip" {
  description = "Allocate an Elastic IP so the address stays the same across stop/start. Costs ~$3.6/mo even while stopped; false = cheaper, but the public IP changes on each start."
  type        = bool
  default     = false
}

variable "bucket_force_destroy" {
  description = "If true, terraform destroy also deletes buckets WITH their objects. Keep false to protect uploads."
  type        = bool
  default     = false
}

variable "app_origins" {
  description = "Browser origins allowed to PUT directly into the uploads bucket (CORS)."
  type        = list(string)
  default     = ["http://localhost:3000"]
}

variable "github_repo" {
  description = "owner/repo allowed to assume the GitHub Actions deploy role via OIDC."
  type        = string
  default     = "BinaryStudioAcademy/bsa-2026-transcripta"
}
