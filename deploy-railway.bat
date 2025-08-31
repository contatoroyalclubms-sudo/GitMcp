@echo off
echo ========================================
echo DEPLOY SISTEMA MEEP NO RAILWAY
echo ========================================
echo.

cd /d "C:\Users\User\OneDrive\Desktop\MCP-PROGRAMADOR\MCP01PROG\CLAUDE PREGRADOR\sistema-meep-deploy"

echo Projeto Railway: sistema-meep01
echo GitHub Repo: https://github.com/contatoroyalclubms-sudo/GitMcp
echo Branch: supremaaaddmeep01
echo.

echo Configurações do Deploy:
echo - Frontend React com Vite
echo - Build: npm install e npm run build
echo - Serve: npm run preview
echo - Porta: Variável PORT do Railway
echo.

echo Para fazer o deploy no Railway:
echo.
echo 1. Acesse: https://railway.app/project/41555273-319a-4fd5-af0e-b743861c29fa
echo 2. Clique em "New Service"
echo 3. Selecione "Deploy from GitHub repo"
echo 4. Escolha o repositório: contatoroyalclubms-sudo/GitMcp
echo 5. Selecione a branch: supremaaaddmeep01
echo 6. O Railway detectará automaticamente as configurações do nixpacks.toml
echo.
echo Ou use o comando:
echo railway up --service sistema-meep01-frontend
echo.
pause