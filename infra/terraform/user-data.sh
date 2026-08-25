#!/usr/bin/env bash
# First-boot provisioning + self-deploy. Installs Docker, writes the prod
# compose, then a systemd unit pulls the image from ECR and starts the stack.
# The pull retries until the image exists, so the box self-heals whether it
# boots before or after the first `docker push`. On every stop/start it re-pulls
# the latest image.
set -euxo pipefail

REGION="us-east-1"
ACCOUNT="940521992973"
REGISTRY="${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com"
IMAGE="${REGISTRY}/transcripta-backend:latest"
APP_DIR="/opt/transcripta"

# --- swap: t4g.micro has only 1 GB, and it runs Node + Postgres + Redis ---
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >>/etc/fstab
fi

# --- Docker + compose plugin + awscli (for ECR login) ---
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg unzip
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  >/etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
usermod -aG docker ubuntu

# Cap container logs. The default json-file driver grows without bound, which is
# the other way this box can fill its disk and lock itself out of SSM.
mkdir -p /etc/docker
cat >/etc/docker/daemon.json <<'JSON'
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" }
}
JSON

systemctl enable --now docker

curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-$(uname -m).zip" -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install
rm -rf /tmp/aws /tmp/awscliv2.zip

# --- app files ---
mkdir -p "$APP_DIR"

cat >"$APP_DIR/docker-compose.prod.yml" <<'YAML'
services:
  backend:
    image: ${BACKEND_IMAGE}
    restart: unless-stopped
    env_file: .env.prod
    ports:
      - "80:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
  postgres:
    image: postgres:17
    restart: unless-stopped
    environment:
      POSTGRES_USER: transcripta
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-transcripta}
      POSTGRES_DB: transcripta
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U transcripta"]
      interval: 5s
      timeout: 5s
      retries: 10
  redis:
    image: redis:7
    restart: unless-stopped
    command: ["redis-server", "--maxmemory", "2gb", "--maxmemory-policy", "noeviction", "--appendonly", "yes"]
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 10
volumes:
  pgdata:
  redisdata:
YAML

cat >"$APP_DIR/.env.prod" <<'ENV'
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
DB_CONNECTION_STRING=postgresql://transcripta:transcripta@postgres:5432/transcripta
DB_DIALECT=pg
DB_POOL_MIN=2
DB_POOL_MAX=10
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=us.amazon.nova-pro-v1:0
ENV

# --- deploy script: ECR login, pull (retry until present), up ---
cat >/usr/local/bin/transcripta-deploy.sh <<DEPLOY
#!/usr/bin/env bash
set -uo pipefail
export BACKEND_IMAGE="${IMAGE}"
cd "${APP_DIR}"
until aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${REGISTRY}; do
  echo "ecr login failed, retrying"; sleep 5
done
until docker compose -f docker-compose.prod.yml pull; do
  echo "image not in ECR yet, waiting..."; sleep 15
done
docker compose -f docker-compose.prod.yml up -d
# Drop the image this deploy just replaced. No `until` filter: the image we are
# replacing is usually minutes old, so any age filter would skip the one thing
# this line exists to remove. `up -d` has already started the new container, so
# the images still in use are protected by Docker itself.
# Without this every deploy strands another ~1 GB; a full root disk locks out
# SSM and the box becomes unreachable, which is exactly how it died once.
docker image prune -af
DEPLOY
chmod +x /usr/local/bin/transcripta-deploy.sh

# --- systemd: deploy on boot; stop/start re-pulls latest ---
cat >/etc/systemd/system/transcripta.service <<'UNIT'
[Unit]
Description=Transcripta: pull image from ECR and start the stack
After=docker.service network-online.target
Requires=docker.service
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/local/bin/transcripta-deploy.sh

[Install]
WantedBy=multi-user.target
UNIT

# --- weekly cleanup: a safety net for whatever prune-on-deploy misses ---
cat >/etc/systemd/system/docker-prune.service <<'UNIT'
[Unit]
Description=Reclaim disk from unused Docker data

[Service]
Type=oneshot
ExecStart=/usr/bin/docker system prune -af --filter "until=168h"
UNIT

cat >/etc/systemd/system/docker-prune.timer <<'UNIT'
[Unit]
Description=Weekly Docker cleanup

[Timer]
OnCalendar=weekly
Persistent=true

[Install]
WantedBy=timers.target
UNIT

systemctl daemon-reload
systemctl enable transcripta.service
systemctl enable --now docker-prune.timer
systemctl start --no-block transcripta.service
