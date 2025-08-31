#!/bin/bash

echo "🚀 Iniciando Sistema MEEP Universal..."

# Instalar dependências Python se necessário
if [ ! -d "venv" ]; then
    echo "📦 Instalando dependências Python..."
    pip install -r backend/requirements.txt
fi

# Verificar se o frontend está buildado
if [ ! -d "frontend/dist" ]; then
    echo "🔨 Buildando frontend..."
    cd frontend
    npm install
    npm run build
    cd ..
fi

# Configurar variáveis de ambiente
export PYTHONPATH=/app/backend:$PYTHONPATH
export DATABASE_URL=${DATABASE_URL:-"sqlite:///./database.db"}

# Iniciar servidor
echo "✅ Iniciando servidor na porta ${PORT:-8000}..."
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}