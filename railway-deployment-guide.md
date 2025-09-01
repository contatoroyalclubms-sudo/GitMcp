# 🚀 Guia de Deploy Railway - Sistema GitMcp

## ✅ Status Atual
- **Projeto Railway**: protective-patience (eb872692-f19b-4546-8a92-164401d6b32)
- **PostgreSQL**: ✅ Configurado
- **Redis**: ✅ Configurado
- **Branch**: production-deploy-v1
- **Repositório**: contatoroyalclubms-sudo/GitMcp

## 📋 Próximos Passos no Railway Dashboard

### 1. Conectar Repositório GitHub
1. Acesse seu projeto Railway: https://railway.app/project/eb872692-f19b-4546-8a92-164401d6b32
2. Clique em **"New Service"**
3. Escolha **"Deploy from GitHub repo"**
4. Selecione: `contatoroyalclubms-sudo/GitMcp`
5. Branch: `production-deploy-v1`

### 2. Deploy Backend (FastAPI)
**Configurações do Serviço:**
- **Nome**: backend
- **Root Directory**: `/backend`
- **Build Command**: Automático (usa Dockerfile)
- **Start Command**: `/app/start.sh`

**Variáveis de Ambiente:**
```env
DATABASE_URL=postgresql://postgres:nmdfHqcUzZfdMmCEsWpwbNrwBiTQvZuH@tramway.proxy.rlwy.net:55800/railway
REDIS_URL=redis://padrão:Up1DcErdNjQJUybVoQSQMLWOGKcJinVh@redis.railway.internal:6379
SECRET_KEY=sua-chave-secreta-muito-segura-aqui
JWT_SECRET=sua-chave-jwt-muito-segura-aqui
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=30
PYTHONUNBUFFERED=1
PYTHONPATH=/app
PORT=8000
```

### 3. Deploy Frontend (React/Vite)
**Configurações do Serviço:**
- **Nome**: frontend
- **Root Directory**: `/frontend`
- **Build Command**: Automático (usa Dockerfile)

**Variáveis de Ambiente:**
```env
VITE_API_URL=https://[backend-url]/api
VITE_MEEP_API_URL=https://[meep-service-url]/api
VITE_WS_URL=wss://[backend-url]
```

### 4. Deploy MEEP Service (Node.js)
**Configurações do Serviço:**
- **Nome**: meep-service
- **Root Directory**: `/meep-service`
- **Build Command**: Automático (usa Dockerfile)

**Variáveis de Ambiente:**
```env
DATABASE_URL=postgresql://postgres:nmdfHqcUzZfdMmCEsWpwbNrwBiTQvZuH@tramway.proxy.rlwy.net:55800/railway
REDIS_URL=redis://padrão:Up1DcErdNjQJUybVoQSQLWOGKcJinVh@redis.railway.internal:6379
NODE_ENV=production
PORT=3000
```

## 🔧 Health Checks
- **Backend**: `/healthz`
- **Frontend**: `/health`
- **MEEP Service**: `/health`

## 📊 Monitoramento
Após o deploy, verifique:
1. **Logs** de cada serviço no Railway
2. **Health checks** respondendo
3. **Database migrations** executadas
4. **URLs públicas** acessíveis

## ✅ Checklist Final
- [ ] Backend deployado e rodando
- [ ] Frontend deployado e acessível
- [ ] MEEP Service deployado
- [ ] Variáveis de ambiente configuradas
- [ ] Health checks passando
- [ ] Database conectado
- [ ] Redis funcionando

## 🎉 URLs Finais
Após o deploy, você terá:
- **Backend**: https://[backend-service].railway.app
- **Frontend**: https://[frontend-service].railway.app
- **MEEP Service**: https://[meep-service].railway.app
- **API Docs**: https://[backend-service].railway.app/docs
