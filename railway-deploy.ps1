$env:RAILWAY_TOKEN = "b7666038-be55-471e-aff1-5d436dd0dd52"

Write-Host "`n=== INICIANDO DEPLOY RAILWAY ===" -ForegroundColor Green

# Tenta fazer o deploy direto primeiro
Write-Host "`nTentando deploy direto..." -ForegroundColor Yellow
$result = & railway up --detach 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nProjeto não linkado. Use os comandos abaixo:" -ForegroundColor Red
    Write-Host "`n1. railway link" -ForegroundColor Cyan
    Write-Host "2. Selecione 'protective-patience'" -ForegroundColor Cyan
    Write-Host "3. railway up --detach" -ForegroundColor Cyan
    Write-Host "4. railway logs --tail" -ForegroundColor Cyan
} else {
    Write-Host "`nDeploy iniciado com sucesso!" -ForegroundColor Green
    Write-Host "`nObtendo status..." -ForegroundColor Yellow
    & railway status
    
    Write-Host "`nMonitorando logs..." -ForegroundColor Yellow
    & railway logs --tail
}