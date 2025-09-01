#!/usr/bin/env python
"""Servidor mínimo para teste do sistema MEEP"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import os

# Criar aplicação FastAPI
app = FastAPI(
    title="Sistema MEEP - Teste Local",
    description="Versão simplificada para testes locais",
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

# Dados em memória para teste
users_db = []
products_db = []
events_db = []

# Modelos Pydantic
class User(BaseModel):
    username: str
    email: str
    password: str

class Product(BaseModel):
    name: str
    price: float
    quantity: int
    description: Optional[str] = None

class Event(BaseModel):
    title: str
    date: str
    location: str
    description: Optional[str] = None

# Rotas principais
@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <html>
        <head>
            <title>Sistema MEEP - Local</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    max-width: 800px; 
                    margin: 50px auto; 
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                h1 { text-align: center; }
                .links { 
                    display: flex; 
                    justify-content: center; 
                    gap: 20px; 
                    margin-top: 30px;
                }
                a { 
                    color: white; 
                    padding: 10px 20px; 
                    background: rgba(255,255,255,0.2); 
                    text-decoration: none;
                    border-radius: 5px;
                }
                a:hover { background: rgba(255,255,255,0.3); }
                .status { 
                    text-align: center; 
                    padding: 20px; 
                    background: rgba(0,255,0,0.2); 
                    border-radius: 10px;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <h1>🚀 Sistema MEEP - Modo Local</h1>
            <div class="status">
                ✅ Servidor Funcionando!<br>
                📍 Porta: 8000<br>
                🔧 Modo: Teste Local
            </div>
            <div class="links">
                <a href="/docs">📚 API Docs</a>
                <a href="/health">❤️ Health Check</a>
                <a href="/api/users">👥 Usuários</a>
                <a href="/api/products">📦 Produtos</a>
                <a href="/api/events">📅 Eventos</a>
            </div>
        </body>
    </html>
    """

@app.get("/health")
async def health_check():
    return JSONResponse(content={
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "mode": "local_test",
        "database": "in_memory",
        "services": {
            "api": "running",
            "database": "mock",
            "redis": "not_connected",
            "email": "disabled"
        }
    })

# API de Usuários
@app.post("/api/users/register")
async def register_user(user: User):
    users_db.append(user.dict())
    return {"message": "User registered successfully", "username": user.username}

@app.get("/api/users")
async def get_users():
    return {"total": len(users_db), "users": users_db}

# API de Produtos
@app.post("/api/products")
async def create_product(product: Product):
    products_db.append(product.dict())
    return {"message": "Product created", "product": product.dict()}

@app.get("/api/products")
async def get_products():
    return {"total": len(products_db), "products": products_db}

# API de Eventos
@app.post("/api/events")
async def create_event(event: Event):
    events_db.append(event.dict())
    return {"message": "Event created", "event": event.dict()}

@app.get("/api/events")
async def get_events():
    return {"total": len(events_db), "events": events_db}

# Rota de teste para simular login
@app.post("/api/auth/login")
async def login(username: str, password: str):
    return {
        "access_token": "fake-jwt-token-for-testing",
        "token_type": "bearer",
        "user": {"username": username, "role": "admin"}
    }

if __name__ == "__main__":
    import uvicorn
    
    print("=" * 60)
    print("SISTEMA MEEP - SERVIDOR MINIMO FUNCIONAL")
    print("=" * 60)
    print("URL: http://localhost:8000")
    print("API Docs: http://localhost:8000/docs")
    print("Health: http://localhost:8000/health")
    print("=" * 60)
    print("Pressione CTRL+C para parar")
    print("=" * 60)
    
    uvicorn.run(app, host="0.0.0.0", port=8000)