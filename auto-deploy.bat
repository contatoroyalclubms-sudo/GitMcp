@echo off
set RAILWAY_TOKEN=b7666038-be55-471e-aff1-5d436dd0dd52
echo Iniciando deploy automatico...
echo.
echo | set /p="protective-patience" | railway link
railway up --detach
railway status
railway logs --tail