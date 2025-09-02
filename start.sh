#!/bin/bash

# Run database migrations
echo "Running database migrations..."
alembic upgrade head || echo "No migrations to run"

# Start the application
echo "Starting FastAPI application..."
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 4