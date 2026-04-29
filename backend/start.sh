#!/bin/bash

# Exit on any error
set -e

echo "=================================="
echo "Starting AI-Powered Factory Backend"
echo "=================================="

# Wait for database to be ready
echo "Waiting for PostgreSQL to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if pg_isready -h postgres -U ${DB_USER:-ai-camera} -d ${DB_NAME:-aiPostgres} 2>/dev/null; then
    echo "✓ Database is ready!"
    break
  fi
  attempt=$((attempt + 1))
  echo "Attempt $attempt/$max_attempts: Database not ready yet..."
  sleep 1
done

if [ $attempt -eq $max_attempts ]; then
  echo "✗ Database did not become ready in time"
  exit 1
fi

# Run Prisma migrations
echo "Running Prisma migrations..."
bunx prisma migrate deploy || bunx prisma db push

# Seed the database with initial data
echo "Seeding database with initial data..."
bunx prisma db seed 2>/dev/null || echo "Note: Seed script not found or already executed"

# Start the application
echo "Starting application server..."
exec bun index.ts
