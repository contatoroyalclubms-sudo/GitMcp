$env:RAILWAY_TOKEN = "b7666038-be55-471e-aff1-5d436dd0dd52"

Write-Host "Fazendo deploy no Railway..." -ForegroundColor Green

# Primeiro tenta fazer o up direto, se falhar, pede para fazer link manual
try {
    railway up --detach
} catch {
    Write-Host "Por favor, execute manualmente:" -ForegroundColor Yellow
    Write-Host "1. railway link" -ForegroundColor Cyan
    Write-Host "2. Selecione 'protective-patience' ou outro projeto existente" -ForegroundColor Cyan
    Write-Host "3. Depois execute: railway up --detach" -ForegroundColor Cyan
}

Write-Host "Para ver os logs: railway logs --tail" -ForegroundColor Blue