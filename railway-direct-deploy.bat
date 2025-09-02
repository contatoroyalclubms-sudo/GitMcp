@echo off
echo 🚀 Railway Protective-Patience Deploy Starting...

REM Set Railway token
set RAILWAY_TOKEN=b7666038-be55-471e-aff1-5d436dd0dd52

echo 🔧 Checking Railway authentication...
railway whoami

echo 📋 Listing projects...
railway list

echo 🔗 Connecting to protective-patience project...
railway connect protective-patience

echo 🚀 Starting deployment...
railway up --detach

echo ✅ Deployment initiated! Checking status...
timeout /t 10

echo 📊 Getting deployment status...
railway status

echo 🌐 Getting service URL...
railway domain

echo 🎉 Deploy process completed!
echo Check your Railway dashboard for final deployment status.

pause