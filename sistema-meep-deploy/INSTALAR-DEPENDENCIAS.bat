@echo off
cd /d "c:\Users\User\.claude\agents\sistema-meep-deploy"

echo ============================================
echo     MEEP - INSTALADOR DE DEPENDENCIAS
echo ============================================

echo [1/4] Verificando Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js nao encontrado - baixe de https://nodejs.org
    echo Continuando...
) else (
    echo Node.js OK
    node --version
)

echo.
echo [2/4] Verificando npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo npm nao encontrado
) else (
    echo npm OK
    npm --version
)

echo.
echo [3/4] Instalando Railway CLI...
npm install -g @railway/cli 2>nul
if %errorlevel% equ 0 (
    echo Railway CLI instalado!
) else (
    echo Falha na instalacao - tente manualmente: npm install -g @railway/cli
)

echo.
echo [4/4] Verificando Railway...
where railway >nul 2>&1
if %errorlevel% neq 0 (
    echo Railway CLI nao encontrado
) else (
    echo Railway CLI OK
    railway version
)

echo.
echo ============================================
echo          DEPENDENCIAS VERIFICADAS
echo ============================================
echo.

echo Proximo passo: Execute o deploy
echo .\DEPLOY-MVP-ROBUSTO.bat

pause
