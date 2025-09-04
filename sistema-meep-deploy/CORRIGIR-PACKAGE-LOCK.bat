@echo off
cls
echo =============================================
echo   MEEP - CORRETOR DE PACKAGE-LOCK.JSON
echo =============================================
echo.

color 0a

echo [INFO] Verificando problema do package-lock.json...
echo.

REM Verificar se package.json existe
if not exist "package.json" (
    echo [ERRO] package.json nao encontrado!
    echo [INFO] Procurando em subpastas...
    
    if exist "meep-enterprise-system\package.json" (
        echo [OK] Encontrado em meep-enterprise-system\
        cd meep-enterprise-system
    ) else if exist "sistema-meep-complete\package.json" (
        echo [OK] Encontrado em sistema-meep-complete\
        cd sistema-meep-complete
    ) else (
        echo [ERRO] Nenhum package.json encontrado!
        pause
        exit /b 1
    )
)

echo [INFO] package.json encontrado: %cd%
echo.

REM Backup do package-lock.json atual
if exist "package-lock.json" (
    echo [INFO] Fazendo backup do package-lock.json atual...
    copy package-lock.json package-lock.json.backup
    echo [OK] Backup criado!
)

REM Limpar cache e arquivos antigos
echo [INFO] Limpando cache npm...
npm cache clean --force
if %errorlevel% neq 0 (
    echo [AVISO] Falha ao limpar cache - continuando...
)

echo [INFO] Removendo node_modules e package-lock.json antigos...
if exist "node_modules" rmdir /s /q node_modules
if exist "package-lock.json" del package-lock.json

REM Verificar integridade do package.json
echo [INFO] Verificando package.json...
node -e "JSON.parse(require('fs').readFileSync('package.json'))" 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] package.json invalido!
    pause
    exit /b 1
)
echo [OK] package.json valido!

REM Gerar novo package-lock.json
echo [INFO] Gerando novo package-lock.json...
npm install --package-lock-only
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao gerar package-lock.json
    echo [INFO] Tentando instalacao completa...
    npm install
    if %errorlevel% neq 0 (
        echo [ERRO] Instalacao falhou completamente
        pause
        exit /b 1
    )
) else (
    echo [OK] package-lock.json gerado com sucesso!
    
    REM Instalar dependencias usando npm ci
    echo [INFO] Instalando dependencias com npm ci...
    npm ci --omit=dev
    if %errorlevel% neq 0 (
        echo [AVISO] npm ci falhou, usando npm install...
        npm install --only=production
    )
)

echo.
echo [INFO] Verificando instalacao...
npm ls --depth=0

echo.
echo =============================================
echo        CORRECAO CONCLUIDA COM SUCESSO!
echo =============================================
echo.

REM Criar Dockerfile corrigido
echo [INFO] Criando Dockerfile corrigido...
echo FROM node:18-alpine > Dockerfile.fixed
echo WORKDIR /app >> Dockerfile.fixed
echo RUN apk add --no-cache bash curl postgresql-client >> Dockerfile.fixed
echo COPY package*.json ./ >> Dockerfile.fixed
echo RUN npm cache clean --force ^&^& npm install --only=production >> Dockerfile.fixed
echo COPY . . >> Dockerfile.fixed
echo RUN mkdir -p logs ^&^& chown -R node:node /app >> Dockerfile.fixed
echo USER node >> Dockerfile.fixed
echo EXPOSE 3000 >> Dockerfile.fixed
echo HEALTHCHECK --interval=30s --timeout=10s CMD curl -f http://localhost:3000/health ^|^| exit 1 >> Dockerfile.fixed
echo CMD ["node", "server.js"] >> Dockerfile.fixed
echo [OK] Dockerfile.fixed criado!

echo.
echo Arquivos criados:
echo - package-lock.json (novo)
echo - Dockerfile.fixed
if exist "package-lock.json.backup" echo - package-lock.json.backup
echo.

echo Para usar o Dockerfile corrigido:
echo   docker build -f Dockerfile.fixed -t meep-app .
echo.

pause
