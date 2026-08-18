#!/usr/bin/env bash
# One-shot first deploy: provision AWS, then push the backend image to ECR.
# The EC2 instance pulls it and starts the stack automatically (systemd unit in
# user-data.sh), so the page comes up on its own a few minutes after the push.
set -euo pipefail
export PATH="/opt/homebrew/bin:$PATH"
cd "$(dirname "$0")"

echo "==> terraform apply  (creates EC2 + S3 + ECR + IAM; ~\$18-20/mo while running)"
terraform apply -auto-approve

URL=$(terraform output -raw ecr_repo_url)
REGISTRY="${URL%/*}"
IP=$(terraform output -raw public_ip)

echo "==> ECR login + push image (transcripta-backend:local -> $URL:latest)"
aws ecr get-login-password --profile roman --region us-east-1 \
  | docker login --username AWS --password-stdin "$REGISTRY"
docker tag transcripta-backend:local "$URL:latest"
docker push "$URL:latest"

echo
echo "Pushed. The instance self-deploys (ECR pull + docker compose up)."
echo "  Page will be live at:  http://$IP"
echo "  First boot installs Docker + awscli then deploys — allow a few minutes."
echo "  Watch it come up:  curl -sf -o /dev/null -w '%{http_code}\\n' http://$IP"
