#!/bin/bash
# scripts/force_backup.sh
# Manually triggers a database backup utilizing the db-backup service container.

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/backups/manual_backup_$TIMESTAMP.sql"

echo "[*] Triggering Manual Database Backup..."

# We execute pg_dump directly inside the db-backup container (or db container)
# The db-backup container has the volume mounted to /backups

# Check if db-backup container is running
if [ -z "$(docker compose ps -q db-backup)" ]; then
    echo "    ⚠️  'db-backup' service is not running. Starting it..."
    docker compose up -d db-backup
fi

echo "    Target: $BACKUP_FILE"

# Execute Dump
docker compose exec -T db-backup sh -c \
 "pg_dump -h db -U \${POSTGRES_USER} -d \${POSTGRES_DB} -f $BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup Successful!"
    # Show file size
    docker compose exec -T db-backup ls -lh "$BACKUP_FILE"
else
    echo "❌ Backup Failed."
    exit 1
fi
