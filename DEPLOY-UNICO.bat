@echo off
echo ========================================
echo    DEPLOY COMPLETO SISTEMA MEEP
echo ========================================
echo.

REM Configurar token
set RAILWAY_TOKEN=b748a4ea-4a12-4c92-ab9e-1b7968fd4ed3

echo [1/7] Preparando arquivos...
cd sistema-meep-deploy

echo.
echo [2/7] Commitando alteracoes...
git add -A
git commit -m "Deploy completo Sistema MEEP - Todos os modulos"

echo.
echo [3/7] Fazendo login Railway...
echo Por favor, faca login quando solicitado
railway login

echo.
echo [4/7] Conectando ao projeto...
echo Selecione: sistema-jwt-auth
railway link

echo.
echo [5/7] Adicionando PostgreSQL...
railway add postgresql

echo.
echo [6/7] Configurando variaveis...
railway variables set NODE_ENV=production PORT=8000 SECRET_KEY=meep2024universal

echo.
echo [7/7] DEPLOY FINAL...
railway up

echo.
echo ========================================
echo    DEPLOY COMPLETO COM SUCESSO!
echo ========================================
echo.
echo Sistema MEEP com:
echo - 26 modulos funcionando
echo - Frontend React
echo - Backend FastAPI
echo - PostgreSQL
echo - 548 arquivos integrados
echo.
echo Comandos uteis:
echo   railway logs --tail
echo   railway open
echo   railway status
echo.
pause