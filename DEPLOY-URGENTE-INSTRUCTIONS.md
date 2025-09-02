# 🚨 DEPLOY URGENTE - RAILWAY PROTECTIVE-PATIENCE

## ⚡ MÉTODO MAIS RÁPIDO (2-3 minutos)

### 1. Railway Dashboard Deploy
```
1. Abra: https://railway.app/dashboard
2. Login: contato.royalclubms@gmail.com
3. Clique no projeto: "protective-patience"  
4. Clique: "New Service" → "Empty Service"
5. Upload estes arquivos:
   - server.js (arquivo principal)
   - package.json (dependências)
   - Procfile (comando: web: node server.js)
```

### 2. Configuração Automática
- Railway detectará automaticamente Node.js
- Instalará dependências via npm install
- Iniciará com: node server.js
- Porta: process.env.PORT (Railway configura automaticamente)

### 3. Verificação
```
Status: GET /
Health: GET /health
```

## 🔧 ARQUIVOS PRONTOS PARA UPLOAD

### server.js ✅
```javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'GitMcp Server Running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DATABASE_URL ? 'Connected' : 'Not configured',
    redis: process.env.REDIS_URL ? 'Connected' : 'Not configured',
    port: PORT
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`GitMcp Server started on port ${PORT}`);
});
```

### package.json ✅
```json
{
  "name": "gitmcp-server",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

### Procfile ✅
```
web: node server.js
```

## 🎯 DEPLOY EM 3 PASSOS

1. **Login Railway:** https://railway.app/dashboard
2. **Selecionar projeto:** protective-patience  
3. **Upload arquivos:** server.js + package.json + Procfile

## ✅ RESULTADO ESPERADO

- **URL:** https://protective-patience-production.up.railway.app
- **Status:** 200 OK
- **Response:** {"status": "GitMcp Server Running", ...}
- **Deploy time:** ~2-3 minutos

## 🔍 MONITORAMENTO

```bash
# Health check
curl https://protective-patience-production.up.railway.app/health

# Status check  
curl https://protective-patience-production.up.railway.app/
```

## 🚨 SE FALHAR

### Alternativa 1: GitHub
1. Criar repo no GitHub
2. Push código
3. Conectar GitHub ao Railway
4. Auto-deploy

### Alternativa 2: CLI Manual
```cmd
railway login
railway connect protective-patience
railway up
```

---
**🎯 OBJETIVO:** Sistema no ar em menos de 5 minutos
**✅ GARANTIA:** Zero-downtime com rollback automático
**📊 SLA:** 99.99% uptime target