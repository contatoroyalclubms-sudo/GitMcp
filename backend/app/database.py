"""
Database configuration with advanced performance optimizations.
Implements connection pooling, query optimization, and caching strategies.
Target: <5ms for indexed queries, <50ms for analytical queries.
"""
import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import NullPool
from sqlalchemy import event
from redis import Redis
import asyncio
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database Configuration
    database_url: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:password@localhost/meep_db")
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Security Configuration
    secret_key: str = os.getenv("SECRET_KEY", "meep-ultra-secure-key-2024")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Performance Settings
    db_pool_size: int = 20
    db_max_overflow: int = 40
    db_pool_recycle: int = 3600
    cache_ttl: int = 300
    
    # Email Configuration
    email_host: str = os.getenv("EMAIL_HOST", "smtp.gmail.com")
    email_port: int = int(os.getenv("EMAIL_PORT", "587"))
    email_user: str = os.getenv("EMAIL_USER", "")
    email_password: str = os.getenv("EMAIL_PASSWORD", "")
    email_from: str = os.getenv("EMAIL_FROM", "")
    email_from_name: str = os.getenv("EMAIL_FROM_NAME", "MEEP System")
    email_use_tls: bool = os.getenv("EMAIL_USE_TLS", "true").lower() == "true"
    
    # WhatsApp Configuration
    twilio_account_sid: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    twilio_auth_token: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    twilio_whatsapp_from: str = os.getenv("TWILIO_WHATSAPP_FROM", "")
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Create async engine with connection pooling optimization
engine = create_async_engine(
    settings.database_url,
    # Connection pool settings for high concurrency
    pool_size=settings.db_pool_size,  # Base connections
    max_overflow=settings.db_max_overflow,  # Additional connections under load  
    pool_pre_ping=True,  # Validate connections
    pool_recycle=settings.db_pool_recycle,  # Recycle connections every hour
    # Query optimization
    echo=False,  # Disable in production
    future=True,
    # Performance settings
    connect_args={
        "server_settings": {
            "jit": "off",  # Disable JIT for consistent performance
            "application_name": "meep_system",
        }
    }
)

# Session factory with optimized settings
async_session_maker = async_sessionmaker(
    engine, 
    class_=AsyncSession,
    expire_on_commit=False  # Keep objects alive after commit
)

Base = declarative_base()

# Redis client for caching
redis_client = Redis.from_url(settings.redis_url, decode_responses=True)

# Database session dependency with connection pooling
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Database session generator with automatic cleanup.
    Implements proper connection lifecycle management.
    """
    async with async_session_maker() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# Cache layer for frequent queries
class DatabaseCache:
    """
    Multi-tier caching system:
    L1: In-memory (< 1ms)
    L2: Redis (< 5ms)
    L3: Database (< 50ms)
    """
    
    def __init__(self):
        self._memory_cache = {}
        self._cache_ttl = settings.cache_ttl
    
    async def get(self, key: str):
        """Get from L1 cache first, then L2 (Redis)"""
        # L1: Memory cache
        if key in self._memory_cache:
            return self._memory_cache[key]
        
        # L2: Redis cache
        try:
            value = redis_client.get(key)
            if value:
                self._memory_cache[key] = value  # Populate L1
                return value
        except Exception:
            pass
        
        return None
    
    async def set(self, key: str, value: str, ttl: int = None):
        """Set in both L1 and L2 caches"""
        ttl = ttl or self._cache_ttl
        
        # L1: Memory cache
        self._memory_cache[key] = value
        
        # L2: Redis cache
        try:
            redis_client.setex(key, ttl, value)
        except Exception:
            pass
    
    async def delete(self, key: str):
        """Invalidate cache across all layers"""
        # L1: Memory cache
        self._memory_cache.pop(key, None)
        
        # L2: Redis cache
        try:
            redis_client.delete(key)
        except Exception:
            pass

# Global cache instance
cache = DatabaseCache()

# Database event listeners for performance monitoring
@event.listens_for(engine.sync_engine, "before_cursor_execute")
def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    """Monitor query performance"""
    import time
    context._query_start_time = time.time()

@event.listens_for(engine.sync_engine, "after_cursor_execute") 
def receive_after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    """Log slow queries (>50ms)"""
    import time
    total = time.time() - context._query_start_time
    if total > 0.05:  # 50ms threshold
        print(f"SLOW QUERY: {total:.3f}s - {statement[:100]}")

async def init_database():
    """Initialize database with optimized settings"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Health check function
async def check_database_health() -> bool:
    """Database health check for monitoring"""
    try:
        async with async_session_maker() as session:
            result = await session.execute("SELECT 1")
            return result.scalar() == 1
    except Exception:
        return False
