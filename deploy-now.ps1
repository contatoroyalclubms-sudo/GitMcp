# Railway Deploy Script - Protective Patience
$env:RAILWAY_TOKEN = "b7666038-be55-471e-aff1-5d436dd0dd52"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " RAILWAY DEPLOY - PROTECTIVE-PATIENCE" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check auth
Write-Host "[1/5] Verificando autenticacao..." -ForegroundColor Yellow
$auth = railway whoami
Write-Host $auth -ForegroundColor Green
Write-Host ""

# Try to get current status
Write-Host "[2/5] Verificando status atual..." -ForegroundColor Yellow
$status = railway status 2>&1

if ($status -match "No linked project") {
    Write-Host "Projeto nao linkado. Executando link..." -ForegroundColor Red
    Write-Host ""
    Write-Host "INSTRUCOES:" -ForegroundColor Cyan
    Write-Host "1. Execute: railway link" -ForegroundColor White
    Write-Host "2. Selecione: protective-patience" -ForegroundColor White
    Write-Host "3. Depois execute novamente este script" -ForegroundColor White
    Write-Host ""
    
    # Try to link
    Write-Host "Tentando linkar agora..." -ForegroundColor Yellow
    Start-Process -FilePath "railway.exe" -ArgumentList "link" -NoNewWindow -Wait
}

# After linking, try deploy
Write-Host ""
Write-Host "[3/5] Iniciando deploy..." -ForegroundColor Yellow
$deploy = railway up --detach 2>&1

if ($deploy -match "Deployment created") {
    Write-Host "Deploy iniciado com sucesso!" -ForegroundColor Green
} else {
    Write-Host $deploy -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[4/5] Obtendo status..." -ForegroundColor Yellow
railway status

Write-Host ""
Write-Host "[5/5] Verificando logs..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
railway logs --tail

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " DEPLOY CONCLUIDO!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Comandos uteis:" -ForegroundColor Yellow
Write-Host "- Ver logs: railway logs --tail" -ForegroundColor White
Write-Host "- Ver status: railway status" -ForegroundColor White
Write-Host "- Fazer rollback: railway down" -ForegroundColor White