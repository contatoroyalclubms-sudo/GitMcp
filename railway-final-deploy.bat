@echo off
echo.
echo ========================================
echo   RAILWAY URGENT DEPLOY - PROTECTIVE-PATIENCE
echo ========================================
echo.

REM Set Railway token explicitly
set "RAILWAY_TOKEN=b7666038-be55-471e-aff1-5d436dd0dd52"

echo [1/7] Setting Railway token...
echo Token configured: %RAILWAY_TOKEN:~0,8%...

echo.
echo [2/7] Testing Railway authentication...
railway whoami
if errorlevel 1 (
    echo ERROR: Authentication failed
    echo.
    echo MANUAL LOGIN REQUIRED:
    echo 1. Open browser and go to: https://railway.app/login
    echo 2. Login with: contato.royalclubms@gmail.com
    echo 3. Go to Account Settings > Tokens
    echo 4. Use existing token or create new one
    echo 5. Come back and run this script again
    pause
    exit /b 1
)

echo.
echo [3/7] Listing available projects...
railway list

echo.
echo [4/7] Connecting to protective-patience project...
railway connect protective-patience
if errorlevel 1 (
    echo ERROR: Could not connect to project
    echo Trying alternative connection method...
    
    REM Create railway config manually
    mkdir .railway 2>nul
    echo {"projectId": "protective-patience", "environmentId": "production"} > .railway\config.json
    echo {"projectId": "protective-patience", "environmentId": "production"} > .railwayconfig
    
    echo Railway config created manually.
)

echo.
echo [5/7] Checking current directory and files...
echo Current directory: %CD%
dir server.js package.json 2>nul
if not exist server.js (
    echo ERROR: server.js not found!
    exit /b 1
)
if not exist package.json (
    echo ERROR: package.json not found!
    exit /b 1
)
echo Required files found.

echo.
echo [6/7] Starting Railway deployment...
echo This may take a few minutes...

railway up --detach
if errorlevel 1 (
    echo.
    echo WARNING: Detached deployment failed, trying regular deployment...
    railway up
    if errorlevel 1 (
        echo.
        echo ERROR: All deployment methods failed.
        echo.
        echo FALLBACK SOLUTIONS:
        echo 1. Try manual deployment via Railway dashboard
        echo 2. Push code to GitHub and connect GitHub to Railway
        echo 3. Use Railway CLI with interactive login
        echo.
        echo Manual CLI steps:
        echo   railway login
        echo   railway connect protective-patience
        echo   railway up
        echo.
        pause
        exit /b 1
    )
)

echo.
echo [7/7] Getting deployment information...
timeout /t 5 >nul

echo.
echo Checking deployment status...
railway status

echo.
echo Getting service URL...
railway domain

echo.
echo ========================================
echo   DEPLOYMENT COMPLETED!
echo ========================================
echo.
echo Your server should now be live on Railway.
echo Check the Railway dashboard for complete details:
echo https://railway.app/project/protective-patience
echo.
echo Server endpoints:
echo - GET / (status check)
echo - GET /health (health check)
echo.
pause