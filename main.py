from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os
from typing import Dict, Any

app = FastAPI(
    title="Sistema MEEP API",
    version="1.0.0",
    description="Event Management Enterprise Platform"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root() -> Dict[str, Any]:
    """Root endpoint with system status"""
    return {
        "name": "Sistema MEEP API",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": os.getenv("RAILWAY_ENVIRONMENT", "production"),
        "endpoints": {
            "health": "/healthz",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }

@app.get("/healthz")
async def health_check() -> Dict[str, str]:
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/v1/status")
async def api_status() -> Dict[str, Any]:
    """Detailed API status"""
    return {
        "api_version": "1.0.0",
        "database": "connected" if os.getenv("DATABASE_URL") else "not_configured",
        "redis": "connected" if os.getenv("REDIS_URL") else "not_configured",
        "uptime": "running",
        "port": os.getenv("PORT", "3000")
    }

# Event management endpoints
@app.get("/api/v1/events")
async def get_events():
    """List all events"""
    return {
        "events": [
            {"id": 1, "name": "Event 1", "date": "2025-01-15", "status": "active"},
            {"id": 2, "name": "Event 2", "date": "2025-02-20", "status": "upcoming"}
        ],
        "total": 2
    }

@app.post("/api/v1/events")
async def create_event(event_data: dict):
    """Create new event"""
    return {
        "message": "Event created successfully",
        "event": event_data
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3000))
    uvicorn.run(app, host="0.0.0.0", port=port)