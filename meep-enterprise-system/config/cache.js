// Cache manager simplificado para funcionar sem Redis
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.isConnected = true;
    }

    async connect() {
        console.log('Cache Manager initialized (in-memory)');
        return true;
    }

    async get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (item.ttl && Date.now() > item.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    async set(key, value, ttl = 3600) {
        this.cache.set(key, {
            value,
            ttl: ttl ? Date.now() + (ttl * 1000) : null
        });
        return true;
    }

    async del(key) {
        return this.cache.delete(key);
    }

    async flush() {
        this.cache.clear();
        return true;
    }

    async disconnect() {
        this.cache.clear();
        this.isConnected = false;
    }
}

module.exports = new CacheManager();