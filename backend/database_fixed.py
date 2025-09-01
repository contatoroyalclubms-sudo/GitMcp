"""
Database configuration with PostgreSQL support for Railway.
Handles both production (PostgreSQL) and development (SQLite) environments.
"""
import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import NullPool
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Detectar ambiente
    node_env: str = os.getenv("NODE_ENV", "development")
    is_production: bool = os.getenv("NODE_ENV") == "production"
    
    # Database Configuration
    @property
    def database_url(self) -> str:
        # Pegar DATABASE_URL do ambiente
        db_url = os.getenv("DATABASE_URL", "")
        
        if db_url:
            # Railway PostgreSQL - converter formato se necessário
            if db_url.startswith("postgres://"):
                db_url = db_url.replace("postgres://", "postgresql://", 1)
            
            # Adicionar driver asyncpg para PostgreSQL
            if "postgresql://" in db_url and "+asyncpg" not in db_url:
                db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
            
            return db_url
        else:
            # Desenvolvimento local - usar SQLite
            # Instalar: pip install aiosqlite
            return "sqlite+aiosqlite:///./meep_local.db"
    
    # Redis Configuration
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Security Configuration
    secret_key: str = os.getenv("SECRET_KEY", "development-secret-key-change-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Performance Settings
    db_pool_size: int = 20 if os.getenv("NODE_ENV") == "production" else 5
    db_max_overflow: int = 40 if os.getenv("NODE_ENV") == "production" else 10
    db_pool_recycle: int = 3600
    cache_ttl: int = 300
    
    # Email Configuration (opcional)
    email_host: str = os.getenv("EMAIL_HOST", "smtp.gmail.com")
    email_port: int = int(os.getenv("EMAIL_PORT", "587"))
    email_user: str = os.getenv("EMAIL_USER", "")
    email_password: str = os.getenv("EMAIL_PASSWORD", "")
    email_from: str = os.getenv("EMAIL_FROM", "")
    email_from_name: str = os.getenv("EMAIL_FROM_NAME", "MEEP System")
    
    class Config:
        env_file = ".env"
        extra = "ignore"

# Instanciar settings
settings = Settings()

print(f"🔧 Ambiente: {settings.node_env}")
print(f"🗄️ Database URL: {settings.database_url[:30]}...")

# Configurar engine baseado no ambiente
if settings.is_production:
    # Produção: PostgreSQL com pool otimizado
    engine = create_async_engine(
        settings.database_url,
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        pool_pre_ping=True,
        pool_recycle=settings.db_pool_recycle,
        echo=False,  # Sem logs em produção
        connect_args={
            "server_settings": {
                "application_name": "meep_backend",
                "jit": "off"
            },
            "command_timeout": 60,
            "timeout": 30
        } if "postgresql" in settings.database_url else {}
    )
else:
    # Desenvolvimento: SQLite ou PostgreSQL local
    engine = create_async_engine(
        settings.database_url,
        echo=True,  # Logs habilitados em dev
        pool_pre_ping=True,
        connect_args={
            "check_same_thread": False,
            "timeout": 30
        } if "sqlite" in settings.database_url else {}
    )

# Session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Base para modelos
Base = declarative_base()

# Dependency para FastAPI
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency para obter sessão do banco de dados.
    Uso em FastAPI:
    
    @app.get("/users")
    async def get_users(db: AsyncSession = Depends(get_db)):
        result = await db.execute(select(User))
        return result.scalars().all()
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# Função para criar tabelas
async def create_tables():
    """Criar todas as tabelas no banco de dados"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Tabelas criadas com sucesso!")

# Função para testar conexão
async def test_connection():
    """Testar conexão com o banco de dados"""
    try:
        async with engine.connect() as conn:
            # PostgreSQL
            if "postgresql" in settings.database_url:
                result = await conn.execute("SELECT version()")
                version = result.scalar()
                print(f"✅ PostgreSQL conectado: {version}")
            # SQLite
            else:
                result = await conn.execute("SELECT sqlite_version()")
                version = result.scalar()
                print(f"✅ SQLite conectado: {version}")
        return True
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return False

# Redis client (opcional)
try:
    import redis.asyncio as redis
    redis_client = redis.from_url(
        settings.redis_url,
        encoding="utf-8",
        decode_responses=True
    )
    print("✅ Redis configurado")
except:
    redis_client = None
    print("⚠️ Redis não disponível")

# Exportar tudo necessário
__all__ = [
    "engine",
    "AsyncSessionLocal", 
    "get_db",
    "Base",
    "settings",
    "create_tables",
    "test_connection",
    "redis_client"
]