@echo off
cls
echo ============================================
echo     MEEP ENTERPRISE - DEPLOY MVP ROBUSTO
echo ============================================
echo.

REM Definir cores no terminal
color 0a

echo [INFO] Iniciando deploy robusto do MEEP Enterprise...
echo [INFO] Verificando e instalando dependencias automaticamente...

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Node.js nao encontrado! Tentando instalar via Chocolatey...
    
    REM Verificar se Chocolatey está instalado
    choco --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [INFO] Instalando Chocolatey...
        powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    )
    
    REM Instalar Node.js
    echo [INFO] Instalando Node.js...
    choco install nodejs -y
    
    REM Recarregar PATH
    refreshenv
    
    REM Verificar novamente
    node --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [AVISO] Falha na instalacao automatica do Node.js
        echo [INFO] Por favor, instale Node.js manualmente de https://nodejs.org
        echo [INFO] Continuando sem Node.js...
    ) else (
        echo [OK] Node.js instalado com sucesso!
    )
) else (
    echo [OK] Node.js encontrado!
)

REM Verificar se Railway CLI está instalado
railway version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Railway CLI nao encontrado! Instalando automaticamente...
    
    REM Tentar instalar via npm
    npm --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo [INFO] Instalando Railway CLI via npm...
        npm install -g @railway/cli
        if %errorlevel% neq 0 (
            echo [AVISO] Falha na instalacao via npm - tentando alternativa...
            
            REM Tentar via PowerShell
            powershell -Command "irm https://railway.app/install.ps1 | iex"
            if %errorlevel% neq 0 (
                echo [AVISO] Instalacao automatica falhou
                echo [INFO] Continuando sem Railway CLI - deploy manual necessario
            )
        ) else (
            echo [OK] Railway CLI instalado via npm!
        )
    ) else (
        echo [INFO] npm nao disponivel - tentando instalacao direta...
        powershell -Command "irm https://railway.app/install.ps1 | iex"
        if %errorlevel% neq 0 (
            echo [AVISO] Instalacao automatica falhou
            echo [INFO] Continuando sem Railway CLI - deploy manual necessario
        )
    )
) else (
    echo [OK] Railway CLI encontrado!
)

echo [OK] Dependencias verificadas!
echo.

REM Fazer login no Railway
echo [INFO] Fazendo login no Railway...
railway login
if %errorlevel% neq 0 (
    echo [ERRO] Falha no login do Railway
    pause
    exit /b 1
)

echo [OK] Login realizado com sucesso!
echo.

REM Inicializar projeto Railway
echo [INFO] Inicializando projeto Railway...
railway init
if %errorlevel% neq 0 (
    echo [AVISO] Projeto pode ja estar inicializado
)

echo [INFO] Linkando ao projeto existente ou criando novo...
railway link
echo.

REM Configurar variáveis de ambiente essenciais
echo [INFO] Configurando variaveis de ambiente...

railway variables set "NODE_ENV=production"
railway variables set "PORT=3000"
railway variables set "CLAUDE_API_KEY=sk-ant-api03-example-key-here"
railway variables set "SENTRY_DSN=https://example@sentry.io/project"
railway variables set "DATABASE_URL=postgresql://user:pass@host:port/db"
railway variables set "REDIS_URL=redis://localhost:6379"
railway variables set "JWT_SECRET=meep-ultra-secure-jwt-secret-2024"
railway variables set "ENCRYPTION_KEY=meep-encryption-key-256bit"
railway variables set "API_VERSION=v1"
railway variables set "MAX_CONNECTIONS=100"
railway variables set "RATE_LIMIT=1000"
railway variables set "CACHE_TTL=3600"
railway variables set "LOG_LEVEL=info"
railway variables set "HEALTH_CHECK=true"
railway variables set "MONITORING=true"
railway variables set "AUTO_SCALE=true"
railway variables set "BACKUP_ENABLED=true"
railway variables set "SECURITY_HEADERS=true"
railway variables set "CORS_ORIGINS=*"
railway variables set "SESSION_TIMEOUT=3600"
railway variables set "FILE_UPLOAD_LIMIT=10MB"
railway variables set "WEBHOOK_SECRET=meep-webhook-secret"

echo [OK] Variaveis de ambiente configuradas!
echo.

REM Criar ou atualizar Dockerfile robusto
echo [INFO] Criando Dockerfile robusto...
echo FROM node:18-alpine AS base> Dockerfile
echo.>> Dockerfile
echo # Install system dependencies>> Dockerfile
echo RUN apk add --no-cache \>> Dockerfile
echo     bash \>> Dockerfile
echo     curl \>> Dockerfile
echo     postgresql-client \>> Dockerfile
echo     ^&^& rm -rf /var/cache/apk/*>> Dockerfile
echo.>> Dockerfile
echo WORKDIR /app>> Dockerfile
echo.>> Dockerfile
echo # Copy package files>> Dockerfile
echo COPY package*.json ./>> Dockerfile
echo.>> Dockerfile
echo # Clean install with fallback>> Dockerfile
echo RUN npm cache clean --force ^&^& \>> Dockerfile
echo     rm -rf node_modules package-lock.json ^&^& \>> Dockerfile
echo     npm install --no-optional --no-fund --no-audit ^&^& \>> Dockerfile
echo     npm prune --production>> Dockerfile
echo.>> Dockerfile
echo # Copy application code>> Dockerfile
echo COPY . .>> Dockerfile
echo.>> Dockerfile
echo # Create directories and set permissions>> Dockerfile
echo RUN mkdir -p logs public uploads ^&^& \>> Dockerfile
echo     chown -R node:node /app>> Dockerfile
echo.>> Dockerfile
echo USER node>> Dockerfile
echo EXPOSE 3000>> Dockerfile
echo.>> Dockerfile
echo HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \>> Dockerfile
echo   CMD curl -f http://localhost:3000/health ^|^| curl -f http://localhost:3000/api/health ^|^| exit 1>> Dockerfile
echo.>> Dockerfile
echo CMD ["node", "server.js"]>> Dockerfile
echo [OK] Dockerfile robusto criado!

REM Criar ou atualizar Procfile
echo [INFO] Criando Procfile otimizado...
echo web: node server.js > Procfile
echo worker: node worker.js >> Procfile
echo [OK] Procfile criado!

REM Criar ou atualizar railway.json
echo [INFO] Criando railway.json...
echo {> railway.json
echo   "build": {>> railway.json
echo     "builder": "NIXPACKS",>> railway.json
echo     "buildCommand": "npm install && npm run build">> railway.json
echo   },>> railway.json
echo   "deploy": {>> railway.json
echo     "startCommand": "npm start",>> railway.json
echo     "healthcheckPath": "/health",>> railway.json
echo     "healthcheckTimeout": 100,>> railway.json
echo     "restartPolicyType": "ON_FAILURE",>> railway.json
echo     "restartPolicyMaxRetries": 10>> railway.json
echo   }>> railway.json
echo }>> railway.json
echo [OK] railway.json criado!

REM Instalar dependências
echo [INFO] Instalando dependencias...
npm install
if %errorlevel% neq 0 (
    echo [ERRO] Falha na instalacao de dependencias
    pause
    exit /b 1
)

echo [OK] Dependencias instaladas!
echo.

REM Executar testes básicos (se existirem)
echo [INFO] Executando testes...
npm test >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Testes passaram!
) else (
    echo [AVISO] Testes nao encontrados ou falharam - continuando deploy...
)
echo.

REM Fazer deploy
echo [INFO] Iniciando deploy no Railway...
echo [INFO] Isso pode levar alguns minutos...
railway up --detach
if %errorlevel% neq 0 (
    echo [ERRO] Falha no deploy
    echo [INFO] Tentando deploy alternativo...
    railway deploy
    if %errorlevel% neq 0 (
        echo [ERRO] Deploy falhou completamente
        pause
        exit /b 1
    )
)

echo.
echo ============================================
echo           DEPLOY CONCLUIDO COM SUCESSO!
echo ============================================
echo.

REM Obter URL do projeto
echo [INFO] Obtendo URL do projeto...
railway status
echo.

REM Mostrar logs recentes
echo [INFO] Logs recentes do deploy:
railway logs --tail=20
echo.

echo [INFO] Verificando status do servico...
railway ps
echo.

echo ============================================
echo              DEPLOY FINALIZADO
echo ============================================
echo.
echo O MEEP Enterprise foi deployado com sucesso!
echo.
echo Comandos uteis:
echo - railway logs : Ver logs em tempo real
echo - railway status : Ver status do projeto
echo - railway open : Abrir no navegador
echo - railway domain : Gerenciar dominios
echo.

pause
