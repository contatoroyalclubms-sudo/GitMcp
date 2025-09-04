# MEEP Enterprise - Deploy Robusto PowerShell
# Instalação automática de dependências e deploy

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "    MEEP ENTERPRISE - DEPLOY ROBUSTO PS1" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Função para verificar se um comando existe
function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Função para instalar Chocolatey
function Install-Chocolatey {
    Write-Host "[INFO] Instalando Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    refreshenv
}

# Função para instalar Node.js
function Install-NodeJS {
    Write-Host "[INFO] Instalando Node.js..." -ForegroundColor Yellow
    
    if (Test-CommandExists choco) {
        choco install nodejs -y
    }
    else {
        Write-Host "[INFO] Chocolatey não encontrado, instalando primeiro..." -ForegroundColor Yellow
        Install-Chocolatey
        choco install nodejs -y
    }
    
    # Atualizar PATH
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
}

# Função para instalar Railway CLI
function Install-Railway {
    Write-Host "[INFO] Instalando Railway CLI..." -ForegroundColor Yellow
    
    if (Test-CommandExists npm) {
        npm install -g @railway/cli
    }
    else {
        # Instalação direta via PowerShell
        Invoke-WebRequest https://railway.app/install.ps1 | Invoke-Expression
    }
}

Write-Host "[INFO] Verificando dependências..." -ForegroundColor Green

# Verificar Node.js
if (-not (Test-CommandExists node)) {
    Write-Host "[WARN] Node.js não encontrado! Instalando..." -ForegroundColor Red
    Install-NodeJS
    
    if (Test-CommandExists node) {
        Write-Host "[OK] Node.js instalado com sucesso!" -ForegroundColor Green
        node --version
    }
    else {
        Write-Host "[ERROR] Falha na instalação do Node.js" -ForegroundColor Red
    }
}
else {
    Write-Host "[OK] Node.js encontrado:" -ForegroundColor Green
    node --version
}

# Verificar npm
if (-not (Test-CommandExists npm)) {
    Write-Host "[WARN] npm não encontrado!" -ForegroundColor Red
}
else {
    Write-Host "[OK] npm encontrado:" -ForegroundColor Green
    npm --version
}

# Verificar Railway CLI
if (-not (Test-CommandExists railway)) {
    Write-Host "[WARN] Railway CLI não encontrado! Instalando..." -ForegroundColor Red
    Install-Railway
    
    if (Test-CommandExists railway) {
        Write-Host "[OK] Railway CLI instalado com sucesso!" -ForegroundColor Green
        railway version
    }
    else {
        Write-Host "[ERROR] Falha na instalação do Railway CLI" -ForegroundColor Red
    }
}
else {
    Write-Host "[OK] Railway CLI encontrado:" -ForegroundColor Green
    railway version
}

Write-Host ""
Write-Host "[INFO] Navegando para pasta do projeto..." -ForegroundColor Yellow

# Navegar para a pasta do projeto
Set-Location "c:\Users\User\.claude\agents"

# Verificar se package.json existe
if (Test-Path "package.json") {
    Write-Host "[OK] package.json encontrado na pasta raiz" -ForegroundColor Green
}
elseif (Test-Path "meep-enterprise-system\package.json") {
    Write-Host "[OK] package.json encontrado em meep-enterprise-system" -ForegroundColor Green
    Set-Location "meep-enterprise-system"
}
else {
    Write-Host "[WARN] package.json não encontrado! Criando básico..." -ForegroundColor Yellow
    
    $packageJson = @{
        name         = "meep-enterprise-deploy"
        version      = "1.0.0"
        description  = "MEEP Enterprise Deploy System"
        main         = "server.js"
        scripts      = @{
            start = "node server.js"
            dev   = "nodemon server.js"
        }
        dependencies = @{
            express = "^4.18.0"
            cors    = "^2.8.5"
            dotenv  = "^16.0.0"
        }
    } | ConvertTo-Json -Depth 3
    
    $packageJson | Out-File -FilePath "package.json" -Encoding UTF8
    Write-Host "[OK] package.json básico criado!" -ForegroundColor Green
}

Write-Host ""
Write-Host "[INFO] Instalando dependências do projeto..." -ForegroundColor Yellow

if (Test-CommandExists npm) {
    npm cache clean --force
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Dependências instaladas com sucesso!" -ForegroundColor Green
    }
    else {
        Write-Host "[WARN] Problemas na instalação de dependências" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "[INFO] Configurando Railway..." -ForegroundColor Yellow

if (Test-CommandExists railway) {
    # Login no Railway
    Write-Host "[INFO] Fazendo login no Railway..." -ForegroundColor Yellow
    railway login
    
    # Inicializar projeto
    Write-Host "[INFO] Inicializando projeto Railway..." -ForegroundColor Yellow
    railway init
    
    # Configurar variáveis de ambiente básicas
    Write-Host "[INFO] Configurando variáveis de ambiente..." -ForegroundColor Yellow
    railway variables set NODE_ENV=production
    railway variables set PORT=3000
    
    # Fazer deploy
    Write-Host "[INFO] Iniciando deploy..." -ForegroundColor Yellow
    railway up --detach
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "============================================" -ForegroundColor Green
        Write-Host "         DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
        Write-Host "============================================" -ForegroundColor Green
        
        # Mostrar status
        railway status
    }
    else {
        Write-Host "[ERROR] Falha no deploy" -ForegroundColor Red
    }
}
else {
    Write-Host "[ERROR] Railway CLI não disponível - não é possível fazer deploy" -ForegroundColor Red
}

Write-Host ""
Write-Host "Script concluído!" -ForegroundColor Cyan
Read-Host "Pressione Enter para continuar..."
