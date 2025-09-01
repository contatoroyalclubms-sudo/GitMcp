#!/bin/bash

echo "========================================"
echo "🚀 DEPLOY AUTOMÁTICO - GITMCP"
echo "========================================"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório do projeto"
    exit 1
fi

# 1. Verificar mudanças
echo ""
echo "📋 Verificando mudanças..."
git status --short

# 2. Adicionar mudanças
echo ""
echo "📦 Adicionando arquivos..."
git add -A

# 3. Commit
echo ""
echo "💾 Fazendo commit..."
git commit -m "Deploy automático: $(date '+%Y-%m-%d %H:%M:%S')" || {
    echo "⚠️ Nada para commitar"
}

# 4. Push
echo ""
echo "📤 Enviando para GitHub..."
git push origin production-deploy-v1 || {
    echo "❌ Erro no push. Tentando pull primeiro..."
    git pull origin production-deploy-v1
    git push origin production-deploy-v1
}

# 5. Verificar Railway CLI
echo ""
echo "🔧 Verificando Railway CLI..."
if command -v railway &> /dev/null; then
    echo "✅ Railway CLI instalado"
    
    # Tentar deploy via CLI
    echo ""
    echo "🚂 Iniciando deploy no Railway..."
    railway up || {
        echo "⚠️ Railway CLI não está conectado"
        echo "Execute: railway link"
    }
else
    echo "⚠️ Railway CLI não instalado"
    echo "Instale com: npm install -g @railway/cli"
fi

# 6. Testar health check
echo ""
echo "🏥 Aguardando 30 segundos para testar..."
sleep 30

echo ""
echo "🔍 Executando health check..."
node health-check.js

echo ""
echo "========================================"
echo "✅ Deploy concluído!"
echo "========================================"
echo ""
echo "📊 Próximos passos:"
echo "1. Verifique o dashboard: https://railway.app"
echo "2. Veja os logs: railway logs"
echo "3. Teste a aplicação no domínio gerado"