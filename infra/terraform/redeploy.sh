#!/usr/bin/env bash
# Rebuild the backend image (linux/amd64, the EC2 arch), push to ECR, and tell
# the instance to redeploy. Safe to re-run any time after a code change.
set -euo pipefail
export PATH="/opt/homebrew/bin:$PATH"
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"

URL=$(terraform -chdir="$HERE" output -raw ecr_repo_url)
REGISTRY="${URL%/*}"
IP=$(terraform -chdir="$HERE" output -raw public_ip)

echo "==> build image (arm64, native on Apple Silicon; matches the Graviton host)"
docker build -f "$ROOT/apps/backend/Dockerfile" -t transcripta-backend:local "$ROOT"

echo "==> push ${URL}:latest"
aws ecr get-login-password --profile roman --region us-east-1 \
  | docker login --username AWS --password-stdin "$REGISTRY"
docker tag transcripta-backend:local "${URL}:latest"
docker push "${URL}:latest"

echo "==> trigger redeploy on the instance (SSM)"
aws ssm send-command --profile roman --region us-east-1 \
  --document-name AWS-RunShellScript \
  --targets Key=tag:Project,Values=transcripta \
  --comment "manual redeploy" \
  --parameters commands='/usr/local/bin/transcripta-deploy.sh' \
  --query "Command.CommandId" --output text

echo "Pushed + triggered. Give it ~1 min, then check:  curl -I http://${IP}"
