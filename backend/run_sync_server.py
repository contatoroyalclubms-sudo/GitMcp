#!/usr/bin/env python
"""
Script simplificado para executar servidor localmente
Usa SQLite sem recursos assíncronos para teste local
"""

import os
import sys
from pathlib import Path

# Adicionar diretório ao path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Configurar para usar SQLite síncrono
os.environ["DATABASE_URL"] = "sqlite:///./meep_local.db"
os.environ["SYNC_DATABASE"] = "true"
os.environ["DEBUG"] = "true"

def patch_database():
    """Patch temporário para fazer database.py funcionar com SQLite síncrono"""
    import app.database as db_module
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    
    # Substituir engine assíncrono por síncrono
    db_module.engine = create_engine(
        "sqlite:///./meep_local.db",
        connect_args={"check_same_thread": False}
    )
    
    # Criar session maker síncrono
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_module.engine)
    
    # Substituir get_db
    def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    db_module.get_db = get_db
    
    # Criar tabelas
    from app.models import Base
    Base.metadata.create_all(bind=db_module.engine)
    
    print("✅ Database patched para modo síncrono")
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("SISTEMA MEEP - MODO LOCAL SIMPLIFICADO")
    print("=" * 60)
    
    try:
        # Aplicar patch antes de importar main
        patch_database()
        
        # Agora importar e executar
        from app.main import app
        import uvicorn
        
        print("🚀 Iniciando servidor...")
        print("📍 URL: http://localhost:8000")
        print("📚 Docs: http://localhost:8000/docs")
        print("=" * 60)
        
        uvicorn.run(app, host="0.0.0.0", port=8000)
        
    except ImportError as e:
        print(f"❌ Erro de importação: {e}")
        print("\nTentando modo alternativo...")
        
        # Criar app mínimo para teste
        from fastapi import FastAPI
        from fastapi.responses import JSONResponse
        
        app = FastAPI(title="MEEP Sistema - Teste Local")
        
        @app.get("/")
        def root():
            return {"message": "Sistema MEEP - Modo Teste", "status": "running"}
        
        @app.get("/health")
        def health():
            return JSONResponse(
                content={
                    "status": "ok",
                    "mode": "local_test",
                    "database": "sqlite",
                    "version": "1.0.0"
                }
            )
        
        import uvicorn
        print("🔧 Executando em modo teste simplificado...")
        uvicorn.run(app, host="0.0.0.0", port=8000)
        
    except Exception as e:
        print(f"❌ Erro crítico: {e}")
        print("\nVerifique se as dependências estão instaladas:")
        print("pip install fastapi uvicorn sqlalchemy")