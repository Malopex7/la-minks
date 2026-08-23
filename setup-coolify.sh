#!/bin/bash
set -e

mkdir -p /data/coolify/{source,ssh,applications,databases,backups,services,proxy,sentinel,images} /data/coolify/ssh/{keys,mux} /data/coolify/proxy/dynamic

cat <<'EOF' > /data/coolify/source/.env
APP_ID=coolify_local_app
APP_NAME=Coolify
APP_KEY=base64:XG8L9V4Q2zW6Y8kR1sT4vU7xZ0mN3pQ5rS7tV9wX1yA=
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=coolify-db
DB_PORT=5432
DB_DATABASE=coolify
DB_USERNAME=coolify
DB_PASSWORD=coolify_secret_pass

REDIS_HOST=coolify-redis
REDIS_PASSWORD=coolify_secret_pass
REDIS_PORT=6379

PUSHER_APP_ID=coolify
PUSHER_APP_KEY=coolify_pusher_key_123456
PUSHER_APP_SECRET=coolify_pusher_secret_123456

REGISTRY_URL=docker.io
AUTOUPDATE=false
EOF

cat <<'EOF' > /data/coolify/source/docker-compose.custom.yml
services:
  coolify:
    ports:
      - "8000:8080"
  redis:
    command: redis-server --save 20 1 --loglevel warning --requirepass coolify_secret_pass
    environment:
      REDIS_PASSWORD: coolify_secret_pass
    healthcheck:
      test: [ "CMD", "redis-cli", "-a", "coolify_secret_pass", "ping" ]
      interval: 3s
      retries: 15
      timeout: 2s
  postgres:
    environment:
      POSTGRES_USER: coolify
      POSTGRES_PASSWORD: coolify_secret_pass
      POSTGRES_DB: coolify
    healthcheck:
      test: [ "CMD", "pg_isready", "-U", "coolify", "-d", "coolify" ]
      interval: 3s
      retries: 15
      timeout: 2s
EOF

if [ ! -f /data/coolify/ssh/keys/id.root@host.docker.internal ]; then
    ssh-keygen -t ed25519 -a 100 -f /data/coolify/ssh/keys/id.root@host.docker.internal -q -N "" -C root@coolify
fi

docker network create --attachable coolify 2>/dev/null || true

docker rm -f coolify coolify-db coolify-redis coolify-realtime 2>/dev/null || true
docker volume rm -f coolify-db coolify-redis 2>/dev/null || true

echo "Starting Coolify containers..."
docker compose \
  --env-file /data/coolify/source/.env \
  -f /data/coolify/source/docker-compose.yml \
  -f /data/coolify/source/docker-compose.prod.yml \
  -f /data/coolify/source/docker-compose.custom.yml \
  up -d

echo "SUCCESS: Coolify is now running on http://localhost:8000"
