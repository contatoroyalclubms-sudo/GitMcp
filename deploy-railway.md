# 🚀 Deploy Sistema MEEP no Railway

## ✅ Status do Deploy
- **Repositório GitHub**: https://github.com/contatoroyalclubms-sudo/GitMcp/tree/supremaaaddmeep01
- **Projeto Railway**: https://railway.com/project/41555273-319a-4fd5-af0e-b743861c29fa
- **Branch**: `supremaaaddmeep01`
- **Status**: ✅ Código atualizado e enviado para o GitHub

## 📋 Próximos Passos no Railway

### 1. Conectar ao GitHub no Railway
1. Acesse seu projeto Railway
2. Clique em **"New Service"**
3. Escolha **"Deploy from GitHub repo"**
4. Selecione o repositório: `contatoroyalclubms-sudo/GitMcp`
5. Selecione a branch: `supremaaaddmeep01`

### 2. Configurar Variáveis de Ambiente
No painel do Railway, adicione estas variáveis:

```env
# Essenciais
DATABASE_URL=postgresql://${{PGUSER}}:${{PGPASSWORD}}@${{PGHOST}}:${{PGPORT}}/${{PGDATABASE}}
SECRET_KEY=sua-chave-secreta-muito-segura-aqui
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=30

# CORS e URLs
CORS_ULTRA_PERMISSIVE=false
FRONTEND_URL=https://seu-frontend.railway.app
BACKEND_URL=https://seu-backend.railway.app

# Python/FastAPI
PYTHONUNBUFFERED=1
PORT=8000

# Opcional - WhatsApp
TWILIO_ACCOUNT_SID=seu-sid-aqui
TWILIO_AUTH_TOKEN=seu-token-aqui
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Opcional - Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-app
```

### 3. Adicionar Serviço PostgreSQL
1. No Railway, clique em **"New"**
2. Selecione **"Database"** → **"Add PostgreSQL"**
3. O Railway criará automaticamente as variáveis:
   - `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
   - `DATABASE_URL` será preenchido automaticamente

### 4. Configurar Build e Deploy

#### Opção A: Configuração Automática
O Railway detectará automaticamente:
- **Backend Python**: `requirements.txt` e `Procfile`
- **Frontend**: `package.json`

#### Opção B: Configuração Manual
Se necessário, configure no Railway:

**Build Command:**
```bash
cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt
```

**Start Command:**
```bash
cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4
```

### 5. Deploy do Frontend Separado (Recomendado)

Para melhor performance, crie um serviço separado para o frontend:

1. **Novo Serviço** no Railway
2. Mesmo repositório e branch
3. **Root Directory**: `/frontend`
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm run preview`
6. **Variável de Ambiente**:
   ```env
   VITE_API_URL=https://seu-backend.railway.app/api
   ```

## 🔧 Comandos Úteis

### Verificar Status Local
```bash
# Ver status do git
git status

# Ver branch atual
git branch

# Ver últimos commits
git log --oneline -5
```

### Atualizar e Enviar Mudanças
```bash
# Adicionar mudanças
git add .

# Commit
git commit -m "Descrição das mudanças"

# Push para GitHub
git push origin supremaaaddmeep01
```

### Railway CLI (Opcional)
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link ao projeto
railway link

# Deploy direto
railway up
```

## 📊 Monitoramento

### Endpoints de Health Check
- Backend: `https://seu-backend.railway.app/healthz`
- API Health: `https://seu-backend.railway.app/api/health`
- CORS Test: `https://seu-backend.railway.app/api/cors-test`

### Logs no Railway
1. Acesse o serviço no Railway
2. Clique na aba **"Logs"**
3. Monitore erros e avisos

## 🚨 Troubleshooting

### Erro de Build
- Verifique `requirements.txt` e `package.json`
- Confirme versões do Python (3.11+) e Node (18+)

### Erro de Conexão com Banco
- Verifique se PostgreSQL está rodando
- Confirme variáveis `DATABASE_URL`

### Erro de CORS
- Adicione URL do frontend em `FRONTEND_URL`
- Temporariamente, pode usar `CORS_ULTRA_PERMISSIVE=true`

### WebSocket não Conecta
- Verifique se Railway suporta WebSocket (geralmente sim)
- Use `wss://` em produção (não `ws://`)

## ✅ Checklist Final

- [ ] Código enviado para GitHub
- [ ] Serviço conectado ao repositório no Railway
- [ ] PostgreSQL adicionado e conectado
- [ ] Variáveis de ambiente configuradas
- [ ] Build bem-sucedido
- [ ] Deploy ativo e rodando
- [ ] Health checks respondendo
- [ ] Frontend acessível
- [ ] Login funcionando
- [ ] WebSockets conectando

## 🎉 Pronto!

Seu sistema MEEP estará disponível em:
- **Backend**: `https://[seu-projeto].railway.app`
- **Frontend**: `https://[seu-frontend].railway.app`
- **Docs API**: `https://[seu-backend].railway.app/docs`

---

**Última Atualização**: Sistema preparado e código enviado para o branch `supremaaaddmeep01`