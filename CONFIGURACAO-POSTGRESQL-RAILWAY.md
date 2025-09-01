# CONFIGURAÇÃO POSTGRESQL PARA RAILWAY

## 1️⃣ VARIÁVEIS DE AMBIENTE NO RAILWAY

### AUTOMÁTICAS (Railway fornece)
```bash
DATABASE_URL=postgresql://postgres:SENHA_GERADA@CONTAINER.railway.internal:5432/railway
PGDATABASE=railway
PGHOST=CONTAINER.railway.internal
PGPASSWORD=SENHA_GERADA
PGPORT=5432
PGUSER=postgres
```

### MANUAIS (Você deve adicionar)
```bash
# No Railway Dashboard > Variables, adicione:

NODE_ENV=production
PORT=8000
PYTHONPATH=/app/backend

# Segurança
SECRET_KEY=gerar-chave-segura-aqui-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis (se usar)
REDIS_URL=${{Redis.REDIS_URL}}

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=senha-app-especifica
EMAIL_FROM=seu-email@gmail.com
```

## 2️⃣ ARQUIVO .env.production (GitMcp)

Crie/edite o arquivo `backend/.env.production`:

```env
# Database - Railway fornece automaticamente
DATABASE_URL=${{DATABASE_URL}}

# Ou use formato explícito se preferir
# DATABASE_URL=postgresql+asyncpg://postgres:password@host:5432/railway

# Redis
REDIS_URL=${{Redis.REDIS_URL}}

# Security
SECRET_KEY=sua-chave-secreta-producao-min-32-caracteres
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
NODE_ENV=production
DEBUG=False
```

## 3️⃣ ARQUIVO database.py CORRETO

```python
# backend/app/database.py

import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Detectar ambiente
IS_PRODUCTION = os.getenv("NODE_ENV") == "production"

# URL do banco
if IS_PRODUCTION:
    # No Railway, use PostgreSQL assíncrono
    DATABASE_URL = os.getenv("DATABASE_URL", "")
    # Converter postgres:// para postgresql:// se necessário
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    # Adicionar driver asyncpg
    if "postgresql://" in DATABASE_URL and "+asyncpg" not in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
else:
    # Local: usar SQLite síncrono ou PostgreSQL local
    DATABASE_URL = "sqlite+aiosqlite:///./local.db"

# Criar engine
engine = create_async_engine(
    DATABASE_URL,
    echo=not IS_PRODUCTION,  # Logs apenas em dev
    pool_size=20 if IS_PRODUCTION else 5,
    max_overflow=40 if IS_PRODUCTION else 10,
)

# Session maker
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

## 4️⃣ REQUIREMENTS.TXT ESSENCIAIS

```txt
# Backend Core
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0

# Database PostgreSQL
sqlalchemy==2.0.23
asyncpg==0.29.0  # Driver PostgreSQL assíncrono
psycopg2-binary==2.9.9  # Backup driver
alembic==1.12.1

# Para desenvolvimento local
aiosqlite==0.19.0  # SQLite assíncrono

# Redis (opcional)
redis==5.0.1

# Essenciais
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
python-dotenv==1.0.0
```

## 5️⃣ COMANDOS RAILWAY CLI

```bash
# Configurar variáveis via CLI
railway variables set NODE_ENV=production
railway variables set SECRET_KEY=$(openssl rand -hex 32)
railway variables set PYTHONPATH=/app/backend

# Verificar variáveis
railway variables

# Ver URL do PostgreSQL
railway variables get DATABASE_URL
```

## 6️⃣ RAILWAY.TOML CORRETO

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "cd backend && python -m alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
healthcheckPath = "/health"
healthcheckTimeout = 120
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

[services]
  [[services.databases]]
  name = "postgres"
  plugin = "postgresql"
  
  [[services.databases]]
  name = "redis"
  plugin = "redis"
```

## 7️⃣ INICIALIZAÇÃO DO BANCO

Crie `backend/init_db.py`:

```python
import asyncio
from app.database import engine, Base
from app.models import *  # Importar todos os modelos

async def init_database():
    async with engine.begin() as conn:
        # Criar todas as tabelas
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Tabelas criadas com sucesso!")

if __name__ == "__main__":
    asyncio.run(init_database())
```

## 8️⃣ PASSO A PASSO NO RAILWAY

### Via Dashboard:
1. **New Project** → Deploy from GitHub
2. Selecione: `contatoroyalclubms-sudo/GitMcp`
3. Branch: `production-deploy-v1`
4. **Add Database** → PostgreSQL
5. **Add Database** → Redis (opcional)
6. **Settings** → Variables → Adicionar as variáveis manuais
7. **Deploy**

### Via CLI:
```bash
# Na pasta GitMcp
railway login
railway link
railway add postgresql
railway add redis
railway variables set NODE_ENV=production
railway variables set SECRET_KEY=$(openssl rand -hex 32)
railway up
```

## 9️⃣ TESTAR CONEXÃO POSTGRESQL

```python
# backend/test_db.py
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine

async def test_connection():
    DATABASE_URL = os.getenv("DATABASE_URL")
    print(f"Testando: {DATABASE_URL}")
    
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        result = await conn.execute("SELECT version()")
        version = result.scalar()
        print(f"✅ Conectado! PostgreSQL {version}")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_connection())
```

## 🚨 IMPORTANTE

1. **NÃO COMMITAR** senhas ou SECRET_KEY no código
2. **SEMPRE USE** variáveis de ambiente para credenciais
3. **DATABASE_URL** é fornecida automaticamente pelo Railway
4. **Migrações:** Execute com Alembic após deploy
5. **Backup:** Railway faz backup automático diário

## ✅ CHECKLIST FINAL

- [ ] PostgreSQL adicionado no Railway
- [ ] Variáveis de ambiente configuradas
- [ ] DATABASE_URL usando asyncpg
- [ ] requirements.txt com asyncpg
- [ ] railway.toml configurado
- [ ] Migrations prontas para executar
- [ ] Health check endpoint funcionando

Com essas configurações, o PostgreSQL funcionará perfeitamente no Railway!