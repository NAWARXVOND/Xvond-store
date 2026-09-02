#!/usr/bin/env sh
set -eu

BACKUP_DIR="${BACKUP_DIR:-./backups}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.production.yml}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
FILE="$BACKUP_DIR/xvond_store_$STAMP.dump"

mkdir -p "$BACKUP_DIR"
umask 077

docker compose -f "$COMPOSE_FILE" exec -T postgres \
  pg_dump -U xvond_store -d xvond_store -Fc > "$FILE"

test -s "$FILE"
echo "Database backup created: $FILE"
