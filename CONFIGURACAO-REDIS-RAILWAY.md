# CONFIGURAÇÃO REDIS PARA RAILWAY

## 1️⃣ ADICIONAR REDIS NO RAILWAY

### Via Dashboard:
1. Acesse seu projeto no Railway
2. Clique em **"New"** → **"Database"** → **"Add Redis"**
3. Redis será provisionado automaticamente
4. Railway fornecerá as variáveis automaticamente

### Via CLI:
```bash
railway add redis
railway variables
```

## 2️⃣ VARIÁVEIS AUTOMÁTICAS DO REDIS

Railway fornece automaticamente:
```bash
REDIS_URL=redis://default:SENHA@CONTAINER.railway.internal:6379
REDISHOST=CONTAINER.railway.internal
REDISPASSWORD=SENHA_GERADA
REDISPORT=6379
REDISUSER=default
```

## 3️⃣ ARQUIVO redis_config.py

Crie `backend/app/redis_config.py`:

```python
"""
Configuração do Redis para cache e sessões.
Suporta Railway (produção) e local (desenvolvimento).
"""
import os
import json
from typing import Optional, Any
from datetime import timedelta
import redis.asyncio as redis
from redis.asyncio import Redis
from redis.exceptions import RedisError
import logging

logger = logging.getLogger(__name__)

class RedisConfig:
    """Configuração e gerenciamento do Redis"""
    
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.is_production = os.getenv("NODE_ENV") == "production"
        self.client: Optional[Redis] = None
        self.is_connected = False
        
    async def connect(self) -> bool:
        """Conectar ao Redis"""
        try:
            # Criar cliente Redis assíncrono
            self.client = redis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True,
                max_connections=50 if self.is_production else 10,
                socket_keepalive=True,
                socket_keepalive_options={
                    1: 1,  # TCP_KEEPIDLE
                    2: 3,  # TCP_KEEPINTVL  
                    3: 5,  # TCP_KEEPCNT
                } if self.is_production else None
            )
            
            # Testar conexão
            await self.client.ping()
            self.is_connected = True
            logger.info("✅ Redis conectado com sucesso")
            return True
            
        except RedisError as e:
            logger.error(f"❌ Erro ao conectar no Redis: {e}")
            self.is_connected = False
            return False
        except Exception as e:
            logger.error(f"❌ Erro inesperado no Redis: {e}")
            self.is_connected = False
            return False
    
    async def disconnect(self):
        """Desconectar do Redis"""
        if self.client:
            await self.client.close()
            self.is_connected = False
            logger.info("Redis desconectado")
    
    # ============ CACHE METHODS ============
    
    async def set_cache(
        self, 
        key: str, 
        value: Any, 
        expire: int = 300  # 5 minutos padrão
    ) -> bool:
        """Armazenar valor no cache"""
        if not self.is_connected:
            return False
            
        try:
            # Serializar valor para JSON
            json_value = json.dumps(value)
            await self.client.setex(
                name=f"cache:{key}",
                time=expire,
                value=json_value
            )
            return True
        except Exception as e:
            logger.error(f"Erro ao salvar cache: {e}")
            return False
    
    async def get_cache(self, key: str) -> Optional[Any]:
        """Recuperar valor do cache"""
        if not self.is_connected:
            return None
            
        try:
            value = await self.client.get(f"cache:{key}")
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Erro ao ler cache: {e}")
            return None
    
    async def delete_cache(self, key: str) -> bool:
        """Deletar item do cache"""
        if not self.is_connected:
            return False
            
        try:
            result = await self.client.delete(f"cache:{key}")
            return bool(result)
        except Exception as e:
            logger.error(f"Erro ao deletar cache: {e}")
            return False
    
    async def clear_cache_pattern(self, pattern: str) -> int:
        """Limpar cache por padrão"""
        if not self.is_connected:
            return 0
            
        try:
            keys = []
            async for key in self.client.scan_iter(f"cache:{pattern}*"):
                keys.append(key)
            
            if keys:
                return await self.client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Erro ao limpar cache: {e}")
            return 0
    
    # ============ SESSION METHODS ============
    
    async def set_session(
        self, 
        session_id: str, 
        data: dict, 
        expire: int = 1800  # 30 minutos
    ) -> bool:
        """Armazenar sessão do usuário"""
        if not self.is_connected:
            return False
            
        try:
            await self.client.setex(
                name=f"session:{session_id}",
                time=expire,
                value=json.dumps(data)
            )
            return True
        except Exception as e:
            logger.error(f"Erro ao salvar sessão: {e}")
            return False
    
    async def get_session(self, session_id: str) -> Optional[dict]:
        """Recuperar sessão do usuário"""
        if not self.is_connected:
            return None
            
        try:
            data = await self.client.get(f"session:{session_id}")
            if data:
                # Renovar TTL ao acessar
                await self.client.expire(f"session:{session_id}", 1800)
                return json.loads(data)
            return None
        except Exception as e:
            logger.error(f"Erro ao ler sessão: {e}")
            return None
    
    async def delete_session(self, session_id: str) -> bool:
        """Deletar sessão (logout)"""
        if not self.is_connected:
            return False
            
        try:
            result = await self.client.delete(f"session:{session_id}")
            return bool(result)
        except Exception as e:
            logger.error(f"Erro ao deletar sessão: {e}")
            return False
    
    # ============ RATE LIMITING ============
    
    async def check_rate_limit(
        self, 
        identifier: str, 
        max_requests: int = 100,
        window: int = 60  # 1 minuto
    ) -> tuple[bool, int]:
        """
        Verificar rate limit
        Retorna: (permitido, requests_restantes)
        """
        if not self.is_connected:
            return True, max_requests  # Permitir se Redis não disponível
            
        try:
            key = f"rate:{identifier}"
            
            # Incrementar contador
            current = await self.client.incr(key)
            
            # Definir expiração na primeira request
            if current == 1:
                await self.client.expire(key, window)
            
            # Verificar limite
            remaining = max(0, max_requests - current)
            allowed = current <= max_requests
            
            return allowed, remaining
            
        except Exception as e:
            logger.error(f"Erro no rate limiting: {e}")
            return True, max_requests
    
    # ============ QUEUE METHODS ============
    
    async def enqueue(self, queue_name: str, task: dict) -> bool:
        """Adicionar tarefa na fila"""
        if not self.is_connected:
            return False
            
        try:
            await self.client.lpush(
                f"queue:{queue_name}",
                json.dumps(task)
            )
            return True
        except Exception as e:
            logger.error(f"Erro ao enfileirar: {e}")
            return False
    
    async def dequeue(self, queue_name: str) -> Optional[dict]:
        """Pegar próxima tarefa da fila"""
        if not self.is_connected:
            return None
            
        try:
            data = await self.client.rpop(f"queue:{queue_name}")
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            logger.error(f"Erro ao desenfileirar: {e}")
            return None
    
    # ============ PUBSUB METHODS ============
    
    async def publish(self, channel: str, message: dict) -> bool:
        """Publicar mensagem em canal"""
        if not self.is_connected:
            return False
            
        try:
            await self.client.publish(
                channel,
                json.dumps(message)
            )
            return True
        except Exception as e:
            logger.error(f"Erro ao publicar: {e}")
            return False
    
    async def subscribe(self, channel: str):
        """Subscrever em canal (retorna PubSub object)"""
        if not self.is_connected:
            return None
            
        try:
            pubsub = self.client.pubsub()
            await pubsub.subscribe(channel)
            return pubsub
        except Exception as e:
            logger.error(f"Erro ao subscrever: {e}")
            return None

# Instância global
redis_manager = RedisConfig()

# Função para FastAPI startup
async def init_redis():
    """Inicializar Redis na startup do FastAPI"""
    success = await redis_manager.connect()
    if success:
        print("✅ Redis inicializado")
        # Testar operações básicas
        await redis_manager.set_cache("test", {"status": "ok"}, 60)
        test = await redis_manager.get_cache("test")
        if test:
            print(f"✅ Redis teste: {test}")
    else:
        print("⚠️ Redis não disponível - usando fallback")
    return redis_manager

# Função para FastAPI shutdown
async def close_redis():
    """Fechar Redis no shutdown do FastAPI"""
    await redis_manager.disconnect()
```

## 4️⃣ INTEGRAÇÃO NO FASTAPI

Adicione no `backend/app/main.py`:

```python
from fastapi import FastAPI, Depends
from contextlib import asynccontextmanager
from app.redis_config import init_redis, close_redis, redis_manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_redis()
    yield
    # Shutdown
    await close_redis()

app = FastAPI(lifespan=lifespan)

# Exemplo de uso em endpoint
@app.get("/api/cached-data")
async def get_cached_data(key: str):
    # Tentar pegar do cache
    cached = await redis_manager.get_cache(key)
    if cached:
        return {"source": "cache", "data": cached}
    
    # Se não tem cache, buscar do banco
    data = {"example": "data", "timestamp": datetime.now().isoformat()}
    
    # Salvar no cache para próximas requests
    await redis_manager.set_cache(key, data, expire=300)
    
    return {"source": "database", "data": data}

# Rate limiting exemplo
@app.post("/api/limited-action")
async def limited_action(user_id: str):
    allowed, remaining = await redis_manager.check_rate_limit(
        f"user:{user_id}",
        max_requests=10,
        window=60
    )
    
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded",
            headers={"X-RateLimit-Remaining": str(remaining)}
        )
    
    return {
        "message": "Action allowed",
        "remaining_requests": remaining
    }
```

## 5️⃣ REQUIREMENTS.TXT

Adicione ao `requirements.txt`:

```txt
# Redis
redis==5.0.1
hiredis==2.2.3  # Performance boost (opcional)
```

## 6️⃣ FALLBACK SEM REDIS

Para funcionar mesmo sem Redis:

```python
class CacheFallback:
    """Cache em memória quando Redis não disponível"""
    
    def __init__(self):
        self.cache = {}
        self.timestamps = {}
    
    async def set_cache(self, key: str, value: Any, expire: int = 300):
        self.cache[key] = value
        self.timestamps[key] = time.time() + expire
        return True
    
    async def get_cache(self, key: str):
        if key in self.cache:
            if time.time() < self.timestamps.get(key, 0):
                return self.cache[key]
            else:
                # Expirado
                del self.cache[key]
                del self.timestamps[key]
        return None

# Usar fallback se Redis não conectar
if not redis_manager.is_connected:
    cache = CacheFallback()
else:
    cache = redis_manager
```

## 7️⃣ DOCKER COMPOSE LOCAL

Para testar localmente com Redis:

```yaml
# docker-compose.yml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

Executar:
```bash
docker-compose up -d redis
```

## 8️⃣ TESTAR CONEXÃO REDIS

```python
# backend/test_redis.py
import asyncio
from app.redis_config import redis_manager

async def test_redis():
    # Conectar
    connected = await redis_manager.connect()
    print(f"Conectado: {connected}")
    
    if connected:
        # Testar cache
        await redis_manager.set_cache("test_key", {"hello": "world"}, 60)
        value = await redis_manager.get_cache("test_key")
        print(f"Cache test: {value}")
        
        # Testar sessão
        await redis_manager.set_session("session123", {"user": "test"})
        session = await redis_manager.get_session("session123")
        print(f"Session test: {session}")
        
        # Testar rate limit
        for i in range(5):
            allowed, remaining = await redis_manager.check_rate_limit(
                "test_user", max_requests=3
            )
            print(f"Request {i+1}: Allowed={allowed}, Remaining={remaining}")
        
        # Desconectar
        await redis_manager.disconnect()

if __name__ == "__main__":
    asyncio.run(test_redis())
```

## 9️⃣ VARIÁVEIS NO RAILWAY

```bash
# Automáticas (Railway fornece quando adiciona Redis):
REDIS_URL=redis://default:SENHA@CONTAINER.railway.internal:6379
REDISHOST=CONTAINER.railway.internal
REDISPASSWORD=SENHA_GERADA
REDISPORT=6379
REDISUSER=default

# Você não precisa configurar nada! Railway faz tudo.
```

## 🎯 USO PRÁTICO DO REDIS

### 1. Cache de Queries
```python
# Cache resultado de query pesada
cache_key = f"products:page:{page}:size:{size}"
products = await redis_manager.get_cache(cache_key)

if not products:
    products = await db.query(Product).limit(size).offset(page*size).all()
    await redis_manager.set_cache(cache_key, products, expire=600)
```

### 2. Sessões de Usuário
```python
# Login
session_data = {
    "user_id": user.id,
    "username": user.username,
    "role": user.role,
    "login_time": datetime.now().isoformat()
}
await redis_manager.set_session(session_id, session_data)

# Verificar sessão
session = await redis_manager.get_session(session_id)
if not session:
    raise HTTPException(401, "Session expired")
```

### 3. Rate Limiting
```python
# Limitar API calls
allowed, remaining = await redis_manager.check_rate_limit(
    f"api:{client_ip}",
    max_requests=100,
    window=60
)
```

### 4. Filas de Tarefas
```python
# Adicionar tarefa
await redis_manager.enqueue("emails", {
    "to": user.email,
    "subject": "Welcome",
    "template": "welcome.html"
})

# Processar tarefas (worker)
while True:
    task = await redis_manager.dequeue("emails")
    if task:
        await send_email(task)
    await asyncio.sleep(1)
```

## ✅ CHECKLIST REDIS

- [ ] Redis adicionado no Railway
- [ ] REDIS_URL disponível nas variáveis
- [ ] redis_config.py criado
- [ ] Integrado no FastAPI
- [ ] Fallback implementado
- [ ] Testes executados

Com essas configurações, o Redis estará totalmente funcional no Railway!