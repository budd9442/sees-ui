#!/bin/bash

# Database Restore and Sync Script
# This script wipes the current database, restores from a .dump file, 
# and synchronizes the schema with the current Prisma definitions.

set -e

# Find the project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load environment variables from .env if it exists in project root
if [ -f "$PROJECT_ROOT/.env" ]; then
  # Use set -a to export all variables from the sourced file
  set -a
  source "$PROJECT_ROOT/.env"
  set +a
fi

DUMP_FILE=$1

if [ -z "$DUMP_FILE" ]; then
  echo "Usage: $0 <path_to_dump_file>"
  exit 1
fi

# Make path absolute if it's relative
if [[ "$DUMP_FILE" != /* ]]; then
  # If it's a relative path, assume it's relative to the current working directory
  DUMP_FILE="$(pwd)/$DUMP_FILE"
fi

if [ ! -f "$DUMP_FILE" ]; then
  echo "Error: File $DUMP_FILE not found."
  exit 1
fi

echo "🚀 Starting database restore process..."
echo "📂 Dump file: $DUMP_FILE"

# Ensure we are in the project root for docker compose commands
cd "$PROJECT_ROOT"

# 1. Stop application services to release DB connections
echo "🛑 Stopping application services..."
docker compose stop app email-worker lms-worker gpa-worker

# 2. Wipe and recreate the database
echo "🗑️  Wiping and recreating database: $POSTGRES_DB..."
if [ -z "$POSTGRES_DB" ]; then
  echo "Error: POSTGRES_DB environment variable not set. Check your .env file."
  exit 1
fi

export PGPASSWORD=$POSTGRES_PASSWORD
docker exec -e PGPASSWORD -i sees-postgres dropdb -U $POSTGRES_USER --if-exists $POSTGRES_DB
docker exec -e PGPASSWORD -i sees-postgres createdb -U $POSTGRES_USER $POSTGRES_DB

# 3. Restore the dump
echo "📥 Restoring data from dump..."
# Copy to container first for better reliability with large dumps
docker cp "$DUMP_FILE" sees-postgres:/tmp/restore.dump
docker exec -e PGPASSWORD -i sees-postgres pg_restore -U $POSTGRES_USER -d $POSTGRES_DB --no-owner --no-privileges /tmp/restore.dump
docker exec -i sees-postgres rm /tmp/restore.dump

# 4. Start the app container to run Prisma sync
echo "⚙️  Starting app container for schema sync..."
docker compose start app

# 5. Synchronize schema with Prisma
echo "🔄 Synchronizing schema with Prisma client (accepting potential data loss for schema alignment)..."
docker exec -i sees-app npx prisma db push --accept-data-loss

# 6. Restart all services to ensure they use the new schema/data
echo "♻️  Restarting all services..."
docker compose restart app
docker compose start email-worker lms-worker gpa-worker

echo "✅ Database restore and sync complete!"
echo "📈 User count:"
docker exec -e PGPASSWORD -i sees-postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT count(*) FROM \"User\";"
