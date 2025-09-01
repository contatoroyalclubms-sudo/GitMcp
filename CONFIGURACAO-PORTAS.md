# ⚙️ CONFIGURAÇÃO DE PORTAS - SISTEMA MEEP

## 🔧 PORTAS DEFINIDAS

### BACKEND (API/Server)
```
PORT: 3000
```
- Servidor Node.js/Express
- API REST
- Conexões com bancos de dados
- Arquivo: `server.js`

### FRONTEND (Interface)
```
PORT: 3001
```
- Interface web
- Cliente da aplicação
- Consome a API do backend

## 📋 CONFIGURAÇÃO NO RAILWAY

### Variáveis de Ambiente:
```bash
# Backend
PORT=3000
NODE_ENV=production
DATABASE_URL=[fornecido automaticamente]
REDIS_URL=[fornecido automaticamente]

# Segurança
JWT_SECRET=a7f3c9e1b8d2f4a6c8e0b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9
```

## 🌐 URLs DE ACESSO

### Desenvolvimento Local:
- **Backend:** http://localhost:3000
- **Frontend:** http://localhost:3001

### Produção (Railway):
- **Backend:** https://[seu-projeto].up.railway.app
- **Frontend:** https://[seu-projeto-front].up.railway.app

## 🔗 CONFIGURAÇÃO CORS

O backend está configurado para aceitar requisições de qualquer origem:
```javascript
app.use(cors({
  origin: '*', // Em produção, especificar o domínio do frontend
  credentials: true
}));
```

## 📝 ARQUIVO .env LOCAL

Crie um arquivo `.env` na raiz do projeto:

```env
# Backend
PORT=3000
NODE_ENV=development

# Frontend (se aplicável)
FRONTEND_PORT=3001
REACT_APP_API_URL=http://localhost:3000

# Banco de Dados (local)
DATABASE_URL=postgresql://user:password@localhost:5432/meep
REDIS_URL=redis://localhost:6379

# Segurança
JWT_SECRET=desenvolvimento_secret_key_local
```

## 🚀 COMANDOS PARA RODAR

### Backend (porta 3000):
```bash
cd backend
npm install
npm start
# ou
PORT=3000 node server.js
```

### Frontend (porta 3001):
```bash
cd frontend
npm install
PORT=3001 npm start
```

## 🔍 TESTAR CONEXÃO

### Testar Backend:
```bash
curl http://localhost:3000
# ou
curl http://localhost:3000/health
```

### Testar Frontend:
```bash
curl http://localhost:3001
```

## ⚠️ IMPORTANTE

- **NÃO CONFUNDIR AS PORTAS!**
- Backend SEMPRE na 3000
- Frontend SEMPRE na 3001
- No Railway, use a variável PORT para o backend
- O Railway atribui portas automaticamente em produção

## 📊 VERIFICAÇÃO DE STATUS

Execute o health check:
```bash
node health-check.js
```

Isso verificará:
- ✅ Backend rodando na porta 3000
- ✅ Conexões com bancos de dados
- ✅ Status geral do sistema

---

**CONFIGURAÇÃO ATUAL: BACKEND:3000 | FRONTEND:3001**