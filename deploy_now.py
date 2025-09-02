#!/usr/bin/env python3
import subprocess
import sys
import time

print("RAILWAY DEPLOY AUTOMATICO")
print("=" * 40)

# Set token
subprocess.run(['set', 'RAILWAY_TOKEN=b7666038-be55-471e-aff1-5d436dd0dd52'], shell=True)

# Check auth
print("\n[1] Verificando autenticação...")
auth = subprocess.run(['railway', 'whoami'], capture_output=True, text=True)
print(auth.stdout)

# Try direct upload using git
print("\n[2] Tentando deploy via Git...")
try:
    # Add Railway remote if not exists
    subprocess.run(['git', 'remote', 'remove', 'railway'], capture_output=True)
    subprocess.run(['git', 'remote', 'add', 'railway', 'https://railway.app/project/protective-patience.git'])
    
    # Push to Railway
    print("Fazendo push para Railway...")
    result = subprocess.run(['git', 'push', 'railway', 'master', '--force'], capture_output=True, text=True)
    print(result.stdout)
    print(result.stderr)
    
except Exception as e:
    print(f"Erro: {e}")

print("\n[3] Alternativa: Deploy via Railway CLI com projeto já configurado")
print("Execute manualmente:")
print("1. railway link")
print("2. Selecione: protective-patience")
print("3. railway up --detach")
print("\nSistema pronto para deploy!")