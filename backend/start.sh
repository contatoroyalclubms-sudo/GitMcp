#!/bin/bash

# Script de startup para Railway - Backend
echo "🚀 Iniciando Backend FastAPI no Railway..."

# Configurar variáveis essenciais
export PYTHONUNBUFFERED=1
export PORT=${PORT:-8000}

echo "📊 Configurações:"
echo "PORT: $PORT"
echo "PYTHONPATH: $PYTHONPATH"
echo "DATABASE_URL: ${DATABASE_URL:0:20}..." # Mostra apenas início da URL

# Verificar estrutura do projeto
echo "✅ Estrutura do projeto:"
pwd
ls -la

# Aguardar banco de dados
echo "⏳ Aguardando conexão com banco de dados..."
sleep 3

echo "🌟 Iniciando servidor FastAPI na porta $PORT..."

# Executar uvicorn com configurações otimizadas para Railway
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port $PORT \
    --workers 1 \
    --loop uvloop \
    --timeout-keep-alive 120 \
    --access-log \
    --log-level info
