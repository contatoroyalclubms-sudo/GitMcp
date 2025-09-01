"""
Configuração do Redis para cache e sessões.
Suporta Railway (produção) e local (desenvolvimento).
"""
import os
import json
import time
from typing import Optional, Any
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

# Tentar importar Redis
try:
    import redis.asyncio as redis
    from redis.asyncio import Redis
    from redis.exceptions import RedisError
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("Redis não instalado - usando cache em memória")

class CacheFallback:
    """Cache em memória quando Redis não disponível"""
    
    def __init__(self):
        self.cache = {}
        self.timestamps = {}
        self.is_connected = True  # Sempre "conectado"
    
    async def connect(self) -> bool:
        return True
    
    async def disconnect(self):
        self.cache.clear()
        self.timestamps.clear()
    
    async def set_cache(self, key: str, value: Any, expire: int = 300):
        self.cache[key] = value
        self.timestamps[key] = time.time() + expire
        # Limpar expirados periodicamente
        self._cleanup_expired()
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
    
    async def delete_cache(self, key: str) -> bool:
        if key in self.cache:
            del self.cache[key]
            del self.timestamps[key]
            return True
        return False
    
    async def clear_cache_pattern(self, pattern: str) -> int:
        count = 0
        keys_to_delete = [k for k in self.cache.keys() if k.startswith(f"cache:{pattern}")]
        for key in keys_to_delete:
            del self.cache[key]
            del self.timestamps[key]
            count += 1
        return count
    
    async def set_session(self, session_id: str, data: dict, expire: int = 1800) -> bool:
        return await self.set_cache(f"session:{session_id}", data, expire)
    
    async def get_session(self, session_id: str) -> Optional[dict]:
        return await self.get_cache(f"session:{session_id}")
    
    async def delete_session(self, session_id: str) -> bool:
        return await self.delete_cache(f"session:{session_id}")
    
    async def check_rate_limit(self, identifier: str, max_requests: int = 100, window: int = 60) -> tuple[bool, int]:
        key = f"rate:{identifier}"
        now = time.time()
        
        # Limpar requests antigas
        if key in self.cache:
            self.cache[key] = [t for t in self.cache[key] if now - t < window]
        else:
            self.cache[key] = []
        
        # Verificar limite
        current_requests = len(self.cache[key])
        if current_requests < max_requests:
            self.cache[key].append(now)
            return True, max_requests - current_requests - 1
        
        return False, 0
    
    def _cleanup_expired(self):
        """Limpar itens expirados (executar periodicamente)"""
        now = time.time()
        expired_keys = [k for k, exp_time in self.timestamps.items() if now > exp_time]
        for key in expired_keys:
            del self.cache[key]
            del self.timestamps[key]

class RedisConfig:
    """Configuração e gerenciamento do Redis"""
    
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.is_production = os.getenv("NODE_ENV") == "production"
        self.client: Optional[Redis] = None
        self.is_connected = False
        
    async def connect(self) -> bool:
        """Conectar ao Redis"""
        if not REDIS_AVAILABLE:
            logger.warning("Redis não disponível - usando fallback")
            return False
            
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
            
        except Exception as e:
            logger.error(f"❌ Erro ao conectar no Redis: {e}")
            self.is_connected = False
            return False
    
    async def disconnect(self):
        """Desconectar do Redis"""
        if self.client:
            await self.client.close()
            self.is_connected = False
            logger.info("Redis desconectado")
    
    # ============ CACHE METHODS ============
    
    async def set_cache(self, key: str, value: Any, expire: int = 300) -> bool:
        """Armazenar valor no cache"""
        if not self.is_connected:
            return False
            
        try:
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
    
    async def set_session(self, session_id: str, data: dict, expire: int = 1800) -> bool:
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
        window: int = 60
    ) -> tuple[bool, int]:
        """
        Verificar rate limit
        Retorna: (permitido, requests_restantes)
        """
        if not self.is_connected:
            return True, max_requests
            
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

# Criar instância apropriada
redis_manager = None
fallback_cache = CacheFallback()

async def init_redis():
    """Inicializar Redis na startup do FastAPI"""
    global redis_manager
    
    # Tentar usar Redis real
    if REDIS_AVAILABLE:
        redis_manager = RedisConfig()
        success = await redis_manager.connect()
        
        if success:
            print("✅ Redis conectado com sucesso")
            # Testar operações básicas
            await redis_manager.set_cache("test", {"status": "ok"}, 60)
            test = await redis_manager.get_cache("test")
            if test:
                print(f"✅ Redis teste: {test}")
            return redis_manager
    
    # Usar fallback se Redis não disponível
    print("⚠️ Usando cache em memória (Redis não disponível)")
    return fallback_cache

async def close_redis():
    """Fechar Redis no shutdown do FastAPI"""
    global redis_manager
    if redis_manager and redis_manager.is_connected:
        await redis_manager.disconnect()

def get_cache_manager():
    """Obter gerenciador de cache (Redis ou Fallback)"""
    if redis_manager and redis_manager.is_connected:
        return redis_manager
    return fallback_cache

# Exportar o que é necessário
__all__ = [
    "init_redis",
    "close_redis",
    "get_cache_manager",
    "redis_manager",
    "fallback_cache"
]