#!/bin/bash

echo "🚀 MEEP Enterprise - Build Script Robusto"
echo "=========================================="

# Definir cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para logs
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se package.json existe
if [ ! -f "package.json" ]; then
    log_error "package.json não encontrado!"
    exit 1
fi

log_info "package.json encontrado ✓"

# Limpar cache npm
log_info "Limpando cache npm..."
npm cache clean --force

# Remover node_modules e package-lock.json antigos
log_info "Removendo arquivos antigos..."
rm -rf node_modules
rm -f package-lock.json

# Instalar dependências
log_info "Instalando dependências..."
npm install --no-optional --no-fund --no-audit

if [ $? -eq 0 ]; then
    log_info "Dependências instaladas com sucesso ✓"
else
    log_error "Falha na instalação de dependências"
    exit 1
fi

# Verificar se todas as dependências estão instaladas
log_info "Verificando dependências..."
npm ls --depth=0

# Criar diretórios necessários
log_info "Criando diretórios..."
mkdir -p logs
mkdir -p public
mkdir -p uploads

# Definir permissões (se em ambiente Linux/Mac)
if [ "$(uname)" != "Windows_NT" ]; then
    chmod +x server.js
    chmod -R 755 public
fi

log_info "Build concluído com sucesso! 🎉"
echo "=========================================="
