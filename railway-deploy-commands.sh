#!/bin/bash
# Railway Deploy Commands - GitMcp Project
# Execute estes comandos no diretório raiz do seu projeto GitMcp

echo "=== Railway Deploy Setup for GitMcp ==="
echo ""

# 1. Verificar se estamos no diretório correto
echo "1. Verificando diretório atual..."
pwd
if [ ! -f "package.json" ]; then
    echo "⚠️  AVISO: package.json não encontrado. Certifique-se de estar no diretório raiz do projeto GitMcp"
    exit 1
fi
echo "✅ Diretório correto confirmado"
echo ""

# 2. Copiar arquivos de configuração (ajuste os caminhos conforme necessário)
echo "2. Copiando arquivos de configuração..."
cp /c/Users/User/.claude/agents/railway.json ./railway.json
cp /c/Users/User/.claude/agents/Procfile ./Procfile
echo "✅ Arquivos railway.json e Procfile copiados"
echo ""

# 3. Verificar se package.json tem as configurações necessárias
echo "3. Verificando package.json..."
if grep -q '"start"' package.json; then
    echo "✅ Script 'start' encontrado no package.json"
else
    echo "⚠️  Adicione o script 'start' ao package.json:"
    echo '   "scripts": {'
    echo '     "start": "node server.js"'
    echo '   }'
fi

if grep -q '"engines"' package.json; then
    echo "✅ Engines configurado no package.json"
else
    echo "⚠️  Adicione a configuração de engines ao package.json:"
    echo '   "engines": {'
    echo '     "node": ">=18.0.0"'
    echo '   }'
fi
echo ""

# 4. Verificar dependências
echo "4. Verificando dependências..."
npm audit --audit-level moderate
echo ""

# 5. Testar aplicação localmente
echo "5. Testando aplicação localmente..."
echo "Instalando dependências..."
npm install

echo "⚠️  MANUAL: Inicie sua aplicação com 'npm start' e verifique se roda na porta 3000"
echo "⚠️  MANUAL: Teste com: curl http://localhost:3000"
echo ""

# 6. Preparar commit
echo "6. Preparando commit para deploy..."
git status
echo ""
echo "Adicionando arquivos de configuração..."
git add railway.json Procfile

echo ""
echo "=== PRÓXIMOS PASSOS MANUAIS ==="
echo "1. Execute: git commit -m 'Add Railway configuration for deploy'"
echo "2. Execute: git push origin production-deploy-v1"
echo "3. Acesse railway.app e faça login com GitHub"
echo "4. Crie novo projeto conectando ao repositório contatoroyalclubms-sudo/GitMcp"
echo "5. Selecione branch: production-deploy-v1"
echo "6. Adicione PostgreSQL e Redis como serviços"
echo "7. Configure variáveis de ambiente usando o template fornecido"
echo ""
echo "=== VARIÁVEIS DE AMBIENTE ESSENCIAIS ==="
echo "NODE_ENV=production"
echo "JWT_SECRET=sua_chave_secreta_aqui"
echo "PORT=3000"
echo ""
echo "DATABASE_URL e REDIS_URL serão fornecidas automaticamente pelos addons"
echo ""
echo "✅ Setup completo! Siga os próximos passos manuais para completar o deploy."