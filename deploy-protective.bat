@echo off
echo ========================================
echo DEPLOY RAILWAY - PROTECTIVE-PATIENCE
echo ========================================
echo.

set RAILWAY_TOKEN=b7666038-be55-471e-aff1-5d436dd0dd52

echo [1/4] Verificando autenticacao...
railway whoami

echo.
echo [2/4] Linkando ao projeto protective-patience...
echo IMPORTANTE: Selecione "protective-patience" quando solicitado!
railway link

echo.
echo [3/4] Fazendo deploy...
railway up --detach

echo.
echo [4/4] Obtendo status e URL...
railway status

echo.
echo ========================================
echo DEPLOY COMPLETO!
echo Para ver logs: railway logs --tail
echo ========================================
pause