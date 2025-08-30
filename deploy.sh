#!/bin/bash

set -e

echo "🚀 Starting automated deployment..."

if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

export RAILWAY_TOKEN="d1f48fda-7339-4cc4-a4fd-4910a1d0c53b"

echo "📦 Deploying backend..."
cd backend
railway up --detach || echo "Backend deployment failed, continuing..."

echo "🎨 Deploying frontend..."
cd ..
railway up --detach || echo "Frontend deployment failed, continuing..."

echo "✅ Deployment process completed!"
echo "Check Railway dashboard for deployment status."
