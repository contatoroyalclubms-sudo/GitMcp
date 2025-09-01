#!/usr/bin/env python3
"""
Servidor MEEP - Sistema Completo
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import uvicorn

# Criar aplicação
app = FastAPI(
    title="MEEP - Sistema de Gestão de Eventos",
    description="Sistema completo de gestão de eventos empresariais",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas básicas
@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>MEEP - Sistema de Gestão</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .container {
                text-align: center;
                padding: 40px;
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            }
            h1 {
                font-size: 3em;
                margin-bottom: 20px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .status {
                font-size: 1.2em;
                color: #4ade80;
                margin: 20px 0;
            }
            .links {
                margin-top: 30px;
            }
            a {
                color: white;
                text-decoration: none;
                padding: 12px 24px;
                background: rgba(255,255,255,0.2);
                border-radius: 8px;
                display: inline-block;
                margin: 10px;
                transition: all 0.3s;
            }
            a:hover {
                background: rgba(255,255,255,0.3);
                transform: translateY(-2px);
            }
            .version {
                margin-top: 20px;
                opacity: 0.8;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎯 MEEP</h1>
            <p>Sistema de Gestão de Eventos Empresariais</p>
            <div class="status">✅ Sistema Operacional</div>
            <div class="links">
                <a href="/docs">📚 API Docs</a>
                <a href="/redoc">📖 ReDoc</a>
                <a href="/health">❤️ Health Check</a>
            </div>
            <div class="version">Versão 1.0.0 | Porta 3000</div>
        </div>
    </body>
    </html>
    """

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "MEEP Backend",
        "version": "1.0.0",
        "port": 3000
    }

@app.get("/api/test")
async def test_api():
    return {
        "message": "API funcionando perfeitamente!",
        "timestamp": "2025-01-09",
        "features": [
            "Gestão de Eventos",
            "Controle Financeiro",
            "Analytics em Tempo Real",
            "Sistema de Cashless"
        ]
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    print("\n" + "="*60)
    print("SISTEMA MEEP - SERVIDOR RODANDO")
    print("="*60)
    print(f"URL Local: http://localhost:{port}")
    print(f"API Docs: http://localhost:{port}/docs")
    print(f"ReDoc: http://localhost:{port}/redoc")
    print(f"Health: http://localhost:{port}/health")
    print("="*60)
    print("Pressione CTRL+C para parar")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")