#!/bin/bash

echo "🚀 MEEP SUPREMO - Setup Completo Automático"
echo "=========================================="

# Navegar para o diretório do projeto
cd "$(dirname "$0")"

echo "📦 1. Instalando dependências do projeto principal..."
npm install

echo "📦 2. Instalando dependências do frontend..."
cd frontend
npm install

echo "📦 3. Instalando dependências do backend..."
cd ../backend
npm install

echo "🔧 4. Configurando banco de dados..."
# Gerar Prisma client
npx prisma generate

# Executar migrations (criar tabelas)
npx prisma migrate dev --name init

# Executar seeds (dados iniciais)
npx prisma db seed

echo "🔄 5. Buildando o frontend..."
cd ../frontend
npm run build

echo "🔄 6. Buildando o backend..."
cd ../backend
npm run build

echo "✅ Setup completo! O MEEP Supremo está pronto!"
echo ""
echo "🎯 Para executar em desenvolvimento:"
echo "   npm run dev          # Frontend + Backend"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   Health:   http://localhost:8000/health"
echo ""
echo "🔑 Login padrão:"
echo "   Email: admin@meep-supremo.com"
echo "   Senha: admin123"
echo ""
echo "🚀 PRONTO PARA COMEÇAR OS TRABALHOS!"
