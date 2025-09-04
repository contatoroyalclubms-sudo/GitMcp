# 🚀 GUIA DE INÍCIO RÁPIDO - SISTEMA MEEP

## ✅ SISTEMA FUNCIONANDO!

O sistema está rodando em: **http://localhost:3000**

---

## 📋 COMO USAR O SISTEMA

### 1️⃣ CRIAR PRIMEIRO USUÁRIO ADMIN
```bash
# Via API (use Postman ou curl):
POST http://localhost:3000/api/auth/register
{
  "name": "Admin",
  "email": "admin@meep.com",
  "password": "senha123",
  "role": "admin"
}
```

### 2️⃣ FAZER LOGIN
```bash
POST http://localhost:3000/api/auth/login
{
  "email": "admin@meep.com",
  "password": "senha123"
}

# Resposta: { "token": "jwt_token_aqui" }
```

### 3️⃣ CRIAR PRIMEIRO EVENTO
```bash
POST http://localhost:3000/api/events
Headers: Authorization: Bearer {token}
{
  "name": "Meu Primeiro Evento",
  "date": "2025-03-15",
  "location": "Centro de Convenções",
  "capacity": 1000
}
```

---

## 🔧 PRINCIPAIS FUNCIONALIDADES

### MÓDULOS DISPONÍVEIS:
- ✅ **Autenticação** (`/api/auth`)
- ✅ **Eventos** (`/api/events`)
- ✅ **PDV** (`/api/pdv`)
- ✅ **Cashless** (`/api/cashless`)
- ✅ **Dashboard** (`/api/dashboard`)
- ✅ **Relatórios** (`/api/reports`)
- ✅ **IA Mock** (`/api/ai`)
- ✅ **Business Intelligence** (`/api/business-intelligence`)

### ENDPOINTS MAIS ÚTEIS:
```javascript
// Dashboard em tempo real
GET /api/dashboard/stats

// Relatório de vendas
GET /api/reports/sales

// Criar venda no PDV
POST /api/pdv/sales

// Análise de IA (mock)
POST /api/ai/analyze/customer
```

---

## 📊 ACESSAR DOCUMENTAÇÃO SWAGGER

**http://localhost:3000/api-docs**

Lá você encontra todos os 80+ endpoints documentados!

---

## 🔍 MONITORAMENTO

### STATUS DO SISTEMA:
```bash
GET http://localhost:3000/api/health
```

### MÉTRICAS DO SISTEMA:
```bash
GET http://localhost:3000/api/dashboard/metrics
```

### STATUS DA IA:
```bash
GET http://localhost:3000/api/ai/status
```

---

## ⚙️ CONFIGURAÇÕES IMPORTANTES

### VARIÁVEIS DE AMBIENTE (.env):
```env
PORT=3000
NODE_ENV=production
JWT_SECRET=your_secret_key
DATABASE_URL=sqlite://./database.sqlite

# Para ativar IA real (opcional):
# ANTHROPIC_API_KEY=sua_chave_aqui
# AI_MODE=real
```

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

### IMEDIATO:
1. ✅ Criar usuário admin
2. ✅ Criar primeiro evento teste
3. ✅ Testar venda no PDV
4. ✅ Verificar dashboard

### ESSA SEMANA:
1. 📝 Configurar dados reais
2. 📝 Personalizar para seu negócio
3. 📝 Treinar equipe
4. 📝 Fazer backup inicial

### PRÓXIMO MÊS:
1. 🚀 Deploy em produção
2. 🚀 Primeiro evento real
3. 🚀 Coletar feedback
4. 🚀 Ajustes finos

---

## 🆘 TROUBLESHOOTING

### PROBLEMA: Porta 3000 ocupada
```bash
# Windows:
netstat -ano | findstr :3000
taskkill /PID {PID} /F

# Ou mude a porta no .env:
PORT=3001
```

### PROBLEMA: Banco não conecta
```bash
# Criar banco novo:
rm database.sqlite
npm start
```

### PROBLEMA: Token inválido
```bash
# Verificar JWT_SECRET no .env
# Fazer login novamente
```

---

## 📞 COMANDOS ÚTEIS

```bash
# Iniciar sistema
npm start

# Modo desenvolvimento
npm run dev

# Rodar testes
npm test

# Validar sistema
npm run validate

# Ver logs
tail -f logs/combined.log
```

---

## 🎉 PARABÉNS!

Seu sistema MEEP está pronto e funcionando!
Acesse: **http://localhost:3000**

---

## 💡 DICA IMPORTANTE

O sistema está usando IA Mock (simulada) que não tem custo.
Quando quiser IA real, adicione a chave da Anthropic no .env.

---

**Última atualização:** 2025-09-03
**Versão:** 3.0.0 PRODUÇÃO