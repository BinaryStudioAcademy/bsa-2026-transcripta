provider "aws" {
  region  = var.region
  profile = var.profile

  default_tags {
    tags = {
      Project   = var.project
      ManagedBy = "terraform"
    }
  }
}

data "aws_caller_identity" "current" {}

# ---------------------------------------------------------------------------
# Network — reuse the account's default VPC (no VPC is created or destroyed)
# ---------------------------------------------------------------------------
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Latest Ubuntu 24.04 LTS AMI (arm64, for Graviton), published by Canonical as a
# public SSM parameter.
data "aws_ssm_parameter" "ubuntu" {
  name = "/aws/service/canonical/ubuntu/server/24.04/stable/current/arm64/hvm/ebs-gp3/ami-id"
}

# ---------------------------------------------------------------------------
# SSH key + firewall
# ---------------------------------------------------------------------------
resource "aws_key_pair" "app" {
  key_name   = "${var.project}-key"
  public_key = file(pathexpand(var.public_key_path))
}

resource "aws_security_group" "app" {
  name        = "${var.project}-sg"
  description = "transcripta app host"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH (locked to your IP)"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ---------------------------------------------------------------------------
# S3 — two private buckets (survive stop AND destroy while force_destroy=false)
# ---------------------------------------------------------------------------
locals {
  bucket_uploads = "${var.project}-uploads-${data.aws_caller_identity.current.account_id}"
  bucket_pages   = "${var.project}-pages-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket" "uploads" {
  bucket        = local.bucket_uploads
  force_destroy = var.bucket_force_destroy
}

resource "aws_s3_bucket" "pages" {
  bucket        = local.bucket_pages
  force_destroy = var.bucket_force_destroy
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket                  = aws_s3_bucket.uploads.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_public_access_block" "pages" {
  bucket                  = aws_s3_bucket.pages.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  cors_rule {
    allowed_methods = ["PUT"]
    allowed_origins = var.app_origins
    allowed_headers = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# ---------------------------------------------------------------------------
# IAM — the instance gets a role scoped to just the two buckets.
# No static AWS key is ever placed on the box.
# ---------------------------------------------------------------------------
data "aws_iam_policy_document" "assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "app" {
  name               = "${var.project}-app-role"
  assume_role_policy = data.aws_iam_policy_document.assume.json
}

data "aws_iam_policy_document" "s3" {
  statement {
    sid       = "Objects"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.uploads.arn}/*", "${aws_s3_bucket.pages.arn}/*"]
  }

  statement {
    sid       = "List"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.uploads.arn, aws_s3_bucket.pages.arn]
  }
}

resource "aws_iam_role_policy" "s3" {
  name   = "${var.project}-s3"
  role   = aws_iam_role.app.id
  policy = data.aws_iam_policy_document.s3.json
}

# The app calls Claude through Bedrock. Scoped to invoke only — no model
# management, no listing, and no other AWS service.
data "aws_iam_policy_document" "bedrock" {
  statement {
    actions = [
      "bedrock:InvokeModel",
      "bedrock:InvokeModelWithResponseStream",
    ]
    resources = [
      # Every vendor, not just Anthropic: a cross-region inference profile call
      # needs the foundation models behind the profile, and Amazon Nova is what
      # actually works today.
      "arn:aws:bedrock:*::foundation-model/*",
      "arn:aws:bedrock:*:${data.aws_caller_identity.current.account_id}:inference-profile/*",
    ]
  }
}

resource "aws_iam_role_policy" "bedrock" {
  name   = "${var.project}-bedrock"
  role   = aws_iam_role.app.id
  policy = data.aws_iam_policy_document.bedrock.json
}

# The Anthropic API key lives in SSM as a SecureString, not in .env — nothing
# on the box holds it at rest, and rotating it needs no redeploy.
data "aws_iam_policy_document" "ssm_params" {
  statement {
    actions   = ["ssm:GetParameter", "ssm:GetParameters"]
    resources = ["arn:aws:ssm:*:${data.aws_caller_identity.current.account_id}:parameter/${var.project}/*"]
  }

  statement {
    actions   = ["kms:Decrypt"]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "kms:ViaService"
      values   = ["ssm.${data.aws_region.current.name}.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy" "ssm_params" {
  name   = "${var.project}-ssm-params"
  role   = aws_iam_role.app.id
  policy = data.aws_iam_policy_document.ssm_params.json
}

resource "aws_iam_instance_profile" "app" {
  name = "${var.project}-app-profile"
  role = aws_iam_role.app.name
}

# ---------------------------------------------------------------------------
# The instance. Stop/start keeps this exact machine and its EBS (all data).
# ---------------------------------------------------------------------------
resource "aws_instance" "app" {
  ami                    = data.aws_ssm_parameter.ubuntu.value
  instance_type          = var.instance_type
  subnet_id              = data.aws_subnets.default.ids[0]
  vpc_security_group_ids = [aws_security_group.app.id]
  key_name               = aws_key_pair.app.key_name
  iam_instance_profile   = aws_iam_instance_profile.app.name
  user_data              = file("${path.module}/user-data.sh")

  root_block_device {
    volume_size = var.root_volume_gb
    volume_type = "gp3"
    encrypted   = true
  }

  tags = { Name = "${var.project}-app" }

  # The AMI updates over time; ignore it so a re-apply never replaces the
  # running instance (and its data) just because a newer Ubuntu shipped.
  lifecycle {
    ignore_changes = [ami]
  }
}

# Stable public address that stays the same across stop/start.
resource "aws_eip" "app" {
  count    = var.use_elastic_ip ? 1 : 0
  instance = aws_instance.app.id
  domain   = "vpc"
}
