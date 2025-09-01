@echo off
REM Railway Simple Deploy Script for Windows
REM Handles automated deployment with project linking

setlocal enabledelayedexpansion

set PROJECT_NAME=%1
if "%PROJECT_NAME%"=="" set PROJECT_NAME=sistema-meep01

echo 🚂 Railway Simple Deployment Starting...
echo 📋 Target Project: %PROJECT_NAME%
echo ⏰ Started at: %date% %time%

REM Check if Railway CLI is available
railway --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Railway CLI not found. Please install Railway CLI first.
    exit /b 1
)

REM Check authentication
railway whoami >nul 2>&1
if errorlevel 1 (
    echo ❌ Railway CLI not authenticated. Please run 'railway login' first.
    exit /b 1
)

echo ✅ Railway CLI ready

REM Pre-deployment checks
echo 🔍 Running pre-deployment checks...

if not exist package.json (
    echo ❌ package.json not found
    exit /b 1
)

if not exist server.js (
    echo ❌ server.js not found
    exit /b 1
)

node --check server.js >nul 2>&1
if errorlevel 1 (
    echo ❌ Syntax error in server.js
    exit /b 1
)

echo ✅ Pre-deployment checks passed

REM Check if already linked
railway status >nul 2>&1
if not errorlevel 1 (
    echo ✅ Directory already linked to Railway project
    goto DEPLOY
)

REM Create expect script for automated project selection
echo spawn railway link > temp_link.exp
echo expect "Select a project" >> temp_link.exp
echo send "%PROJECT_NAME%\r" >> temp_link.exp
echo expect eof >> temp_link.exp

REM Try automated linking if expect is available
where expect >nul 2>&1
if not errorlevel 1 (
    echo 🔗 Attempting automated project linking...
    expect temp_link.exp
    del temp_link.exp
) else (
    echo ⚠️ expect not available, using Railway CLI directly...
    echo 🔗 Linking to project: %PROJECT_NAME%
    echo Please select the project "%PROJECT_NAME%" when prompted:
    railway link
)

REM Verify link was successful
railway status >nul 2>&1
if errorlevel 1 (
    echo ❌ Failed to link to project
    exit /b 1
)

echo ✅ Successfully linked to project

:DEPLOY
echo 🚀 Starting deployment...

REM Store rollback info
railway status > .railway-rollback.txt 2>nul

REM Deploy
railway up --detach
if errorlevel 1 (
    echo ❌ Deployment failed
    goto ROLLBACK
)

echo ✅ Deployment initiated

REM Monitor deployment (simplified)
echo 👁️ Monitoring deployment...
timeout /t 30 /nobreak >nul
railway status

echo 🎉 Deployment process completed!
echo ⏰ Finished at: %date% %time%

REM Show final status
echo 📊 Final status:
railway status

goto END

:ROLLBACK
echo 🚨 Attempting rollback...
railway down
if errorlevel 1 (
    echo ❌ Rollback failed
) else (
    echo ✅ Rollback completed
)
exit /b 1

:END
echo 🏁 Script execution completed
exit /b 0