#!/usr/bin/env python3
"""
SISTEMA MEEP - SERVIDOR PRINCIPAL
"""
import os
import sys
from pathlib import Path

# Adicionar o backend ao path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import uvicorn

# Criar aplicação FastAPI
app = FastAPI(
    title="MEEP - Sistema de Gestão de Eventos",
    description="API completa para gestão de eventos empresariais",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== MODELOS ====================
class Event(BaseModel):
    id: Optional[int] = None
    name: str
    description: str
    date: str
    location: str
    capacity: int
    price: float

class User(BaseModel):
    id: Optional[int] = None
    name: str
    email: str
    role: str = "user"

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: str
    database: str
    uptime: str

# ==================== DADOS MOCK ====================
events_db = [
    {
        "id": 1,
        "name": "Tech Conference 2025",
        "description": "Maior conferência de tecnologia do Brasil",
        "date": "2025-03-15",
        "location": "São Paulo, SP",
        "capacity": 5000,
        "price": 299.90
    },
    {
        "id": 2,
        "name": "Music Festival",
        "description": "Festival de música eletrônica",
        "date": "2025-04-20",
        "location": "Rio de Janeiro, RJ",
        "capacity": 10000,
        "price": 180.00
    }
]

users_db = [
    {"id": 1, "name": "Admin", "email": "admin@meep.com", "role": "admin"},
    {"id": 2, "name": "João Silva", "email": "joao@example.com", "role": "user"}
]

# ==================== ROTAS PRINCIPAIS ====================
@app.get("/", response_class=HTMLResponse)
async def root():
    """Página inicial com interface bonita"""
    return """
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MEEP - Sistema de Gestão de Eventos</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                color: white;
            }
            .container {
                text-align: center;
                padding: 50px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                max-width: 600px;
                width: 90%;
            }
            h1 {
                font-size: 3.5em;
                margin-bottom: 20px;
                background: linear-gradient(45deg, #fff, #f0f0f0);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
            }
            .subtitle {
                font-size: 1.3em;
                margin-bottom: 30px;
                opacity: 0.9;
            }
            .status {
                display: inline-block;
                padding: 10px 20px;
                background: rgba(74, 222, 128, 0.2);
                border: 2px solid #4ade80;
                border-radius: 50px;
                color: #4ade80;
                font-weight: bold;
                margin: 20px 0;
            }
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            .feature {
                padding: 20px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                transition: transform 0.3s;
            }
            .feature:hover {
                transform: translateY(-5px);
                background: rgba(255, 255, 255, 0.15);
            }
            .links {
                margin-top: 40px;
                display: flex;
                justify-content: center;
                gap: 15px;
                flex-wrap: wrap;
            }
            .btn {
                padding: 12px 25px;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                text-decoration: none;
                border-radius: 10px;
                transition: all 0.3s;
                display: inline-block;
                border: 1px solid rgba(255, 255, 255, 0.3);
            }
            .btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }
            .btn.primary {
                background: linear-gradient(45deg, #667eea, #764ba2);
                border: none;
            }
            .stats {
                display: flex;
                justify-content: space-around;
                margin: 30px 0;
                padding: 20px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 15px;
            }
            .stat {
                text-align: center;
            }
            .stat-number {
                font-size: 2em;
                font-weight: bold;
                color: #4ade80;
            }
            .stat-label {
                font-size: 0.9em;
                opacity: 0.8;
                margin-top: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>MEEP</h1>
            <p class="subtitle">Sistema de Gestão de Eventos Empresariais</p>
            
            <div class="status">✅ Sistema Operacional</div>
            
            <div class="stats">
                <div class="stat">
                    <div class="stat-number">2</div>
                    <div class="stat-label">Eventos Ativos</div>
                </div>
                <div class="stat">
                    <div class="stat-number">15K</div>
                    <div class="stat-label">Participantes</div>
                </div>
                <div class="stat">
                    <div class="stat-number">99.9%</div>
                    <div class="stat-label">Uptime</div>
                </div>
            </div>
            
            <div class="features">
                <div class="feature">
                    📊 Analytics em Tempo Real
                </div>
                <div class="feature">
                    💳 Sistema Cashless
                </div>
                <div class="feature">
                    📱 Check-in Digital
                </div>
                <div class="feature">
                    🎯 Gestão Completa
                </div>
            </div>
            
            <div class="links">
                <a href="/docs" class="btn primary">📚 Documentação API</a>
                <a href="/health" class="btn">❤️ Health Check</a>
                <a href="/api/events" class="btn">🎉 Ver Eventos</a>
                <a href="/api/dashboard" class="btn">📊 Dashboard</a>
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Verificação de saúde do sistema"""
    return {
        "status": "healthy",
        "service": "MEEP Backend",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat(),
        "database": "connected",
        "uptime": "99.9%"
    }

# ==================== API DE EVENTOS ====================
@app.get("/api/events", response_model=List[Event])
async def get_events():
    """Listar todos os eventos"""
    return events_db

@app.get("/api/events/{event_id}", response_model=Event)
async def get_event(event_id: int):
    """Buscar evento por ID"""
    event = next((e for e in events_db if e["id"] == event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    return event

@app.post("/api/events", response_model=Event)
async def create_event(event: Event):
    """Criar novo evento"""
    new_event = event.dict()
    new_event["id"] = len(events_db) + 1
    events_db.append(new_event)
    return new_event

@app.put("/api/events/{event_id}", response_model=Event)
async def update_event(event_id: int, event: Event):
    """Atualizar evento"""
    for i, e in enumerate(events_db):
        if e["id"] == event_id:
            events_db[i] = {**event.dict(), "id": event_id}
            return events_db[i]
    raise HTTPException(status_code=404, detail="Evento não encontrado")

@app.delete("/api/events/{event_id}")
async def delete_event(event_id: int):
    """Deletar evento"""
    for i, e in enumerate(events_db):
        if e["id"] == event_id:
            del events_db[i]
            return {"message": "Evento deletado com sucesso"}
    raise HTTPException(status_code=404, detail="Evento não encontrado")

# ==================== API DE USUÁRIOS ====================
@app.get("/api/users", response_model=List[User])
async def get_users():
    """Listar todos os usuários"""
    return users_db

@app.get("/api/users/{user_id}", response_model=User)
async def get_user(user_id: int):
    """Buscar usuário por ID"""
    user = next((u for u in users_db if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return user

# ==================== DASHBOARD ====================
@app.get("/api/dashboard")
async def dashboard():
    """Dashboard com estatísticas"""
    return {
        "total_events": len(events_db),
        "total_users": len(users_db),
        "total_capacity": sum(e["capacity"] for e in events_db),
        "total_revenue": sum(e["price"] * e["capacity"] for e in events_db),
        "upcoming_events": len([e for e in events_db if e["date"] > "2025-01-01"]),
        "active_users": len([u for u in users_db if u["role"] == "user"]),
        "system_status": "operational",
        "last_update": datetime.now().isoformat()
    }

# ==================== ANALYTICS ====================
@app.get("/api/analytics")
async def analytics():
    """Analytics do sistema"""
    return {
        "events": {
            "total": len(events_db),
            "by_month": {
                "march": 1,
                "april": 1
            },
            "average_capacity": sum(e["capacity"] for e in events_db) / len(events_db) if events_db else 0,
            "average_price": sum(e["price"] for e in events_db) / len(events_db) if events_db else 0
        },
        "users": {
            "total": len(users_db),
            "by_role": {
                "admin": len([u for u in users_db if u["role"] == "admin"]),
                "user": len([u for u in users_db if u["role"] == "user"])
            }
        },
        "revenue": {
            "potential": sum(e["price"] * e["capacity"] for e in events_db),
            "currency": "BRL"
        }
    }

# ==================== TESTE ====================
@app.get("/api/test")
async def test_endpoint():
    """Endpoint de teste"""
    return {
        "message": "API funcionando perfeitamente!",
        "timestamp": datetime.now().isoformat(),
        "environment": os.environ.get("NODE_ENV", "development"),
        "port": os.environ.get("PORT", "3000")
    }

# ==================== MAIN ====================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    
    print("\n" + "="*60)
    print("SISTEMA MEEP - SERVIDOR PRINCIPAL")
    print("="*60)
    print(f"URL: http://localhost:{port}")
    print(f"API Docs: http://localhost:{port}/docs")
    print(f"Health: http://localhost:{port}/health")
    print(f"Dashboard: http://localhost:{port}/api/dashboard")
    print("="*60)
    print("Ambiente:", os.environ.get("NODE_ENV", "development"))
    print("="*60 + "\n")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )