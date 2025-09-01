#!/bin/bash
# Deploy automático para Railway

echo "========================================="
echo "  DEPLOY SISTEMA MEEP - RAILWAY"
echo "  Branch: production-deploy-v1"
echo "========================================="

# Verificar se está autenticado
echo "Verificando autenticação..."
railway whoami

# Configurar projeto (usar projeto existente sistema-meep01)
echo "Usando projeto sistema-meep01..."

# Deploy direto com GitHub integration
echo "Iniciando deploy..."
echo "Por favor, faça o deploy via Railway Dashboard:"
echo ""
echo "1. Acesse: https://railway.app/dashboard"
echo "2. Selecione o projeto 'sistema-meep01'"
echo "3. Clique em 'New Service' > 'GitHub Repo'"
echo "4. Selecione o repositório: contatoroyalclubms-sudo/GitMcp"
echo "5. Escolha o branch: production-deploy-v1"
echo "6. Railway detectará automaticamente:"
echo "   - Backend Python/FastAPI"
echo "   - Frontend estático"
echo "   - PostgreSQL e Redis necessários"
echo ""
echo "Configurações já presentes no repositório:"
echo "- railway.toml (configuração principal)"
echo "- backend/requirements.txt (dependências Python)"
echo "- Procfile (comandos de inicialização)"
echo ""
echo "O deploy será automático após conectar o GitHub!"