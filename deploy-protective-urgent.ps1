Write-Host "🚀 Railway Protective-Patience URGENT Deploy" -ForegroundColor Green

# Set Railway token as environment variable
$env:RAILWAY_TOKEN = "b7666038-be55-471e-aff1-5d436dd0dd52"

Write-Host "🔧 Setting up Railway environment..." -ForegroundColor Yellow

# Check authentication
Write-Host "🔍 Checking Railway authentication..." -ForegroundColor Yellow
try {
    $whoami = railway whoami
    Write-Host "✅ Authenticated as: $whoami" -ForegroundColor Green
} catch {
    Write-Host "❌ Authentication failed" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Current working directory:" -ForegroundColor Yellow
Get-Location

Write-Host "📂 Available files:" -ForegroundColor Yellow
Get-ChildItem | Select-Object Name, Length | Format-Table

# Check if we have the required files
if (-not (Test-Path "server.js")) {
    Write-Host "❌ server.js not found!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Required files found" -ForegroundColor Green

# Try to deploy directly
Write-Host "🚀 Attempting deployment to protective-patience..." -ForegroundColor Yellow

try {
    # Try to connect to the project first
    Write-Host "🔗 Connecting to protective-patience project..." -ForegroundColor Yellow
    railway connect protective-patience
    
    Write-Host "🚀 Starting deployment..." -ForegroundColor Yellow
    railway up --detach
    
    Write-Host "⏳ Waiting for deployment to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host "📊 Checking deployment status..." -ForegroundColor Yellow
    railway status
    
    Write-Host "🌐 Getting service information..." -ForegroundColor Yellow
    railway domain
    
    Write-Host "🎉 Deployment process completed!" -ForegroundColor Green
    Write-Host "Check your Railway dashboard for final status." -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Deployment failed: $_" -ForegroundColor Red
    
    Write-Host "🔄 Trying alternative deployment method..." -ForegroundColor Yellow
    
    # Alternative: Initialize git and push
    try {
        if (-not (Test-Path ".git")) {
            Write-Host "🔧 Initializing Git repository..." -ForegroundColor Yellow
            git init
            git add .
            git commit -m "Initial deployment commit"
        }
        
        # Try Railway deployment again
        railway up --detach
        
        Write-Host "✅ Alternative deployment successful!" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ All deployment methods failed: $_" -ForegroundColor Red
        Write-Host "💡 Manual steps required:" -ForegroundColor Cyan
        Write-Host "1. Run: railway login" -ForegroundColor White
        Write-Host "2. Run: railway connect protective-patience" -ForegroundColor White
        Write-Host "3. Run: railway up" -ForegroundColor White
        exit 1
    }
}

Write-Host "🔍 Final status check..." -ForegroundColor Yellow
try {
    railway status
} catch {
    Write-Host "⚠️ Could not get final status, check Railway dashboard" -ForegroundColor Yellow
}