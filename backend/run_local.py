#!/usr/bin/env python
"""Script para executar o sistema localmente com SQLite síncrono"""

import os
import sys

# Configurar variáveis de ambiente para SQLite síncrono
os.environ["DATABASE_URL"] = "sqlite:///./meep.db"
os.environ["SYNC_MODE"] = "true"
os.environ["DEBUG"] = "true"

# Adicionar o diretório atual ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    import uvicorn
    
    print("=" * 50)
    print("INICIANDO SISTEMA MEEP - MODO LOCAL")
    print("=" * 50)
    print("URL: http://localhost:8000")
    print("Docs: http://localhost:8000/docs")
    print("=" * 50)
    
    try:
        # Tentar importar e executar
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        print(f"Erro ao iniciar: {e}")
        print("\nTentando modo alternativo...")
        
        # Tentar executar de forma mais simples
        os.system("python -m uvicorn app.main:app --host 0.0.0.0 --port 8000")