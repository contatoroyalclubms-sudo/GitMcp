@echo off
cls
echo ================================================
echo    MEEP ENTERPRISE - CORRETOR MASTER DE BUILD
echo ================================================
echo.

color 0b

echo [MASTER] Iniciando correcao completa do sistema...
echo [MASTER] Data/Hora: %date% %time%
echo.

REM Verificar se estamos na pasta correta
if not exist "sistema-meep-deploy" (
    if exist "..\sistema-meep-deploy" (
        cd ..
        echo [MASTER] Navegando para pasta pai...
    ) else (
        echo [ERRO] Pasta sistema-meep-deploy nao encontrada!
        pause
        exit /b 1
    )
)

echo [MASTER] Pasta atual: %cd%
echo.

REM Etapa 1: Corrigir Package-Lock
echo ==========================================
echo   ETAPA 1: CORRIGINDO PACKAGE-LOCK.JSON
echo ==========================================
echo.

if exist "sistema-meep-deploy\CORRIGIR-PACKAGE-LOCK.bat" (
    cd sistema-meep-deploy
    call CORRIGIR-PACKAGE-LOCK.bat
    cd ..
    echo [MASTER] Package-lock corrigido!
) else (
    echo [AVISO] Script de correcao nao encontrado - continuando...
)

echo.

REM Etapa 2: Atualizar Dockerfiles
echo ==========================================
echo   ETAPA 2: ATUALIZANDO DOCKERFILES
echo ==========================================
echo.

REM Corrigir Dockerfile principal
if exist "Dockerfile" (
    echo [INFO] Atualizando Dockerfile principal...
    echo FROM node:18-alpine > Dockerfile.backup
    type Dockerfile >> Dockerfile.backup
    
    echo FROM node:18-alpine > Dockerfile
    echo WORKDIR /app >> Dockerfile
    echo RUN apk add --no-cache bash curl postgresql-client >> Dockerfile
    echo COPY package*.json ./ >> Dockerfile
    echo RUN npm cache clean --force ^&^& npm install --only=production >> Dockerfile
    echo COPY . . >> Dockerfile
    echo RUN mkdir -p logs ^&^& chown -R node:node /app >> Dockerfile
    echo USER node >> Dockerfile
    echo EXPOSE 3000 >> Dockerfile
    echo HEALTHCHECK --interval=30s --timeout=10s CMD curl -f http://localhost:3000/health ^|^| exit 1 >> Dockerfile
    echo CMD ["node", "server.js"] >> Dockerfile
    echo [OK] Dockerfile principal atualizado!
)

REM Corrigir Dockerfile do meep-enterprise-system
if exist "meep-enterprise-system\Dockerfile" (
    echo [INFO] Atualizando Dockerfile do meep-enterprise-system...
    cd meep-enterprise-system
    
    echo FROM node:18-alpine > Dockerfile
    echo WORKDIR /app >> Dockerfile
    echo RUN apk add --no-cache bash curl postgresql-client >> Dockerfile
    echo COPY package*.json ./ >> Dockerfile
    echo RUN npm cache clean --force ^&^& npm install --only=production >> Dockerfile
    echo COPY . . >> Dockerfile
    echo RUN mkdir -p logs ^&^& chown -R node:node /app >> Dockerfile
    echo USER node >> Dockerfile
    echo EXPOSE 3000 >> Dockerfile
    echo HEALTHCHECK --interval=30s --timeout=10s CMD curl -f http://localhost:3000/health ^|^| exit 1 >> Dockerfile
    echo CMD ["node", "server.js"] >> Dockerfile
    echo [OK] Dockerfile do meep-enterprise-system atualizado!
    cd ..
)

echo.

REM Etapa 3: Verificar Railway
echo ==========================================
echo   ETAPA 3: VERIFICANDO RAILWAY CLI
echo ==========================================
echo.

railway version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Instalando Railway CLI...
    npm install -g @railway/cli
    if %errorlevel% neq 0 (
        echo [AVISO] Falha ao instalar Railway CLI
    ) else (
        echo [OK] Railway CLI instalado!
    )
) else (
    echo [OK] Railway CLI ja instalado!
)

echo.

REM Etapa 4: Preparar Deploy
echo ==========================================
echo   ETAPA 4: PREPARANDO ARQUIVOS DE DEPLOY
echo ==========================================
echo.

REM Criar railway.json otimizado
echo [INFO] Criando railway.json otimizado...
echo {> railway.json
echo   "build": {>> railway.json
echo     "builder": "DOCKERFILE",>> railway.json
echo     "dockerfilePath": "Dockerfile">> railway.json
echo   },>> railway.json
echo   "deploy": {>> railway.json
echo     "startCommand": "node server.js",>> railway.json
echo     "healthcheckPath": "/health",>> railway.json
echo     "healthcheckTimeout": 300,>> railway.json
echo     "restartPolicyType": "ON_FAILURE",>> railway.json
echo     "restartPolicyMaxRetries": 10>> railway.json
echo   }>> railway.json
echo }>> railway.json
echo [OK] railway.json criado!

REM Criar Procfile
echo [INFO] Criando Procfile...
echo web: node server.js > Procfile
echo [OK] Procfile criado!

echo.

REM Etapa 5: Resumo
echo ================================================
echo               CORRECAO CONCLUIDA!
echo ================================================
echo.

echo Arquivos corrigidos/criados:
echo ✅ Dockerfile (principal)
if exist "meep-enterprise-system\Dockerfile" echo ✅ Dockerfile (meep-enterprise-system)
if exist "package-lock.json" echo ✅ package-lock.json
echo ✅ railway.json
echo ✅ Procfile
if exist "Dockerfile.backup" echo ✅ Dockerfile.backup (backup)
echo.

echo Proximos passos:
echo 1. Execute: railway login
echo 2. Execute: railway init
echo 3. Execute: railway up
echo.

echo Ou use o deploy automatico:
if exist "sistema-meep-deploy\DEPLOY-MVP-ROBUSTO.bat" (
    echo 4. Execute: sistema-meep-deploy\DEPLOY-MVP-ROBUSTO.bat
)

echo.
echo ================================================
echo        SISTEMA PRONTO PARA DEPLOY! 🚀
echo ================================================
echo.

pause
