#!/usr/bin/env bash
set -euo pipefail

# Load environment variables from .env if present
if [[ -f .env ]]; then
  export $(grep -v '^#' .env | xargs)
fi

# Bring up Docker Compose services
echo "Starting Docker Compose services..."
# Use the Docker Compose file in the current directory
docker compose up -d

# Wait for PostgreSQL container to be ready using docker exec
CONTAINER_NAME="sees-postgres"
USER="${POSTGRES_USER:-sees_user}"
PASSWORD="${POSTGRES_PASSWORD:-sees_password}"
DB="${POSTGRES_DB:-sees_db}"

function wait_for_pg() {
  echo "Waiting for PostgreSQL inside container $CONTAINER_NAME..."
  for i in {1..30}; do
    if docker exec $CONTAINER_NAME pg_isready -U $USER > /dev/null 2>&1; then
      echo "PostgreSQL is ready."
      return 0
    fi
    sleep 2
  done
  echo "PostgreSQL did not become ready in time." >&2
  exit 1
}

wait_for_pg

# Restore the database from dump inside container
DUMP_FILE="backups/sees_db_complete.dump"
if [[ ! -f "$DUMP_FILE" ]]; then
  echo "Dump file $DUMP_FILE not found!" >&2
  exit 1
fi

echo "Restoring database from $DUMP_FILE inside container $CONTAINER_NAME..."
# Copy dump into container (if not already accessible)
docker cp "$DUMP_FILE" $CONTAINER_NAME:/tmp/sees_db.dump
# Perform restore
docker exec -e PGPASSWORD=$PASSWORD $CONTAINER_NAME pg_restore -U $USER -d $DB -Fc /tmp/sees_db.dump

echo "Database restoration complete."

