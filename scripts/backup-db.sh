#!/bin/bash

# Database Backup Script for BerseMuka
# Usage: ./scripts/backup-db.sh [backup_directory]

set -e

# Load environment variables
if [ -f ".env.production" ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Configuration
BACKUP_DIR=${1:-"./backups/$(date +%Y%m%d_%H%M%S)"}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Parse DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL not set"
    exit 1
fi

# Extract connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
DB_PASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "Starting database backup..."
echo "Database: $DB_NAME"
echo "Host: $DB_HOST"
echo "Backup directory: $BACKUP_DIR"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Perform backup
BACKUP_FILE="$BACKUP_DIR/bersemuka_${TIMESTAMP}.sql"

if command -v docker &> /dev/null && docker ps | grep -q bersemuka-postgres; then
    # Use Docker if postgres is running in container
    echo "Backing up from Docker container..."
    docker exec bersemuka-postgres pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"
else
    # Use direct pg_dump
    echo "Backing up directly from database..."
    PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-owner \
        --no-acl \
        > "$BACKUP_FILE"
fi

# Compress backup
echo "Compressing backup..."
gzip "$BACKUP_FILE"

# Create metadata file
cat > "$BACKUP_DIR/metadata.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "database": "$DB_NAME",
  "host": "$DB_HOST",
  "size": "$(du -h $BACKUP_FILE.gz | cut -f1)",
  "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo "Backup completed successfully!"
echo "Backup file: $BACKUP_FILE.gz"
echo "Size: $(du -h $BACKUP_FILE.gz | cut -f1)"

# Optional: Upload to cloud storage
# Uncomment and configure for your cloud provider
# aws s3 cp "$BACKUP_FILE.gz" "s3://your-backup-bucket/database-backups/"
# gsutil cp "$BACKUP_FILE.gz" "gs://your-backup-bucket/database-backups/"