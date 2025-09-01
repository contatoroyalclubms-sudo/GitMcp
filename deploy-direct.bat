@echo off
set RAILWAY_TOKEN=b7666038-be55-471e-aff1-5d436dd0dd52
echo =======================================
echo RAILWAY DEPLOY DIRETO
echo =======================================
echo.
echo [1] Verificando autenticacao...
railway whoami
echo.
echo [2] Fazendo deploy direto...
railway up --detach
echo.
echo [3] Status...
railway status
echo.
echo =======================================
echo Processo finalizado!
echo =======================================
pause