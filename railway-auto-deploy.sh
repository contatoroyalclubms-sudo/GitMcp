#!/bin/bash

set -e

echo "🚀 Starting comprehensive Railway deployment..."

export RAILWAY_TOKEN="78d98e0e-a4c6-4f4e-975b-424904cd35d6"
PROJECT_ID="41555273-319a-4fd5-af0e-b743861c29fa"

if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

echo "🔐 Testing Railway authentication..."

echo "Approach 1: Direct token authentication"
railway whoami || echo "Direct token failed"

echo "Approach 2: Railway link with project ID"
railway link -p $PROJECT_ID || echo "Link failed"

echo "Approach 3: Railway status check"
railway status || echo "Status check failed"

echo "🏗️ Attempting deployment via Railway CLI..."

echo "📦 Deploying backend service..."
cd backend
railway up --service backend --detach || echo "Backend deployment failed"

echo "🎨 Deploying frontend service..."
cd ..
railway up --service frontend --detach || echo "Frontend deployment failed"

echo "🌐 Attempting deployment via Railway API..."

echo "Creating backend service via API..."
curl -X POST \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "backend",
    "source": {
      "type": "github",
      "repo": "contatoroyalclubms-sudo/GitMcp",
      "branch": "devin/1756568924-roles-permissions-integration",
      "rootDirectory": "backend"
    },
    "variables": {
      "NODE_ENV": "production",
      "JWT_SECRET": "your-super-secret-jwt-key-change-in-production",
      "PORT": "3001"
    }
  }' \
  https://backboard.railway.app/projects/$PROJECT_ID/services || echo "API backend creation failed"

echo "Creating frontend service via API..."
curl -X POST \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "frontend", 
    "source": {
      "type": "github",
      "repo": "contatoroyalclubms-sudo/GitMcp",
      "branch": "devin/1756568924-roles-permissions-integration"
    },
    "variables": {
      "NODE_ENV": "production"
    }
  }' \
  https://backboard.railway.app/projects/$PROJECT_ID/services || echo "API frontend creation failed"

echo "✅ Deployment attempts completed!"
echo "Check Railway dashboard: https://railway.com/project/$PROJECT_ID"
echo "If deployment failed, manual setup may be required."
