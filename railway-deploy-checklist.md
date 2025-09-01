# Railway Deploy Checklist - GitMcp

## ✅ Checklist Pré-Deploy

### 📋 Verificações de Código
- [ ] Todos os commits estão na branch `production-deploy-v1`
- [ ] Aplicação roda localmente na porta 3000
- [ ] Testes passando (`npm test` se aplicável)
- [ ] Dependências atualizadas (`npm audit` sem vulnerabilidades críticas)
- [ ] Variáveis de ambiente locais funcionando

### 📁 Arquivos de Configuração
- [ ] `railway.json` presente no root do projeto
- [ ] `Procfile` presente no root do projeto  
- [ ] `package.json` com script "start" configurado
- [ ] `package.json` com engines Node.js >= 18.0.0
- [ ] `.gitignore` configurado (não commitando `.env`, `node_modules`, etc.)

### 🔧 Configuração da Aplicação
- [ ] Aplicação aceita conexões em `0.0.0.0:PORT`
- [ ] Variável `PORT` lida de `process.env.PORT`
- [ ] Database URL dinâmico (`process.env.DATABASE_URL`)
- [ ] Redis URL dinâmico (`process.env.REDIS_URL`)
- [ ] CORS configurado para produção
- [ ] Headers de segurança implementados

### 🚀 Configuração Railway
- [ ] Conta Railway criada e conectada ao GitHub
- [ ] Repositório `contatoroyalclubms-sudo/GitMcp` acessível
- [ ] Branch `production-deploy-v1` selecionada
- [ ] PostgreSQL addon adicionado ao projeto
- [ ] Redis addon adicionado ao projeto

### 🔐 Variáveis de Ambiente
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` configurado (mínimo 32 caracteres)
- [ ] `PORT=3000` (opcional, Railway define automaticamente)
- [ ] Secrets de APIs terceirizadas configurados
- [ ] URLs de CORS configuradas
- [ ] `DATABASE_URL` verificada (fornecida pelo PostgreSQL addon)
- [ ] `REDIS_URL` verificada (fornecida pelo Redis addon)

---

## 🎯 Processo de Deploy Passo a Passo

### Fase 1: Preparação Local
```bash
# 1. Navegar para o projeto
cd /caminho/para/GitMcp

# 2. Copiar arquivos de configuração
cp /c/Users/User/.claude/agents/railway.json ./
cp /c/Users/User/.claude/agents/Procfile ./

# 3. Testar localmente
npm install
npm start
# Verificar: http://localhost:3000

# 4. Commit configurações
git add railway.json Procfile
git commit -m "Add Railway configuration for deploy"
git push origin production-deploy-v1
```

### Fase 2: Configuração Railway
1. **Acessar Railway**: https://railway.app
2. **Login**: Conectar com GitHub
3. **Novo Projeto**: "Deploy from GitHub repo"
4. **Selecionar Repo**: `contatoroyalclubms-sudo/GitMcp`
5. **Selecionar Branch**: `production-deploy-v1`

### Fase 3: Adicionar Serviços de Database
1. **PostgreSQL**:
   - Clicar "New Service" → "Database" → "PostgreSQL"
   - Aguardar criação (1-2 minutos)
   - `DATABASE_URL` será gerada automaticamente

2. **Redis**:
   - Clicar "New Service" → "Database" → "Redis"  
   - Aguardar criação (1-2 minutos)
   - `REDIS_URL` será gerada automaticamente

### Fase 4: Configurar Variáveis de Ambiente
No serviço principal da aplicação:
1. Ir para aba "Variables"
2. Adicionar variáveis essenciais:
   ```
   NODE_ENV=production
   JWT_SECRET=sua_chave_secreta_aqui
   ```
3. Adicionar variáveis específicas do projeto conforme necessário

### Fase 5: Deploy e Monitoramento
1. **Deploy Automático**: Railway detecta mudanças e inicia build
2. **Acompanhar Logs**: Aba "Deployments" → Ver logs em tempo real
3. **Verificar Saúde**: Aguardar status "Running"
4. **Testar URL**: Acessar URL fornecida pelo Railway

---

## 🔍 Troubleshooting Comum

### ❌ Build Falha
- Verificar logs de build na aba "Deployments"
- Confirmar se `package.json` tem todas as dependências
- Verificar se script "start" está correto

### ❌ Aplicação não Inicia
- Verificar se aplicação aceita conexões em `0.0.0.0:PORT`
- Confirmar se `PORT` é lida de `process.env.PORT`
- Verificar logs de runtime

### ❌ Database Connection Error
- Confirmar se PostgreSQL addon foi criado
- Verificar se `DATABASE_URL` está sendo usada na aplicação
- Testar conexão local com as credenciais

### ❌ Redis Connection Error  
- Confirmar se Redis addon foi criado
- Verificar se `REDIS_URL` está sendo usada na aplicação
- Verificar configuração de cliente Redis

---

## 📊 Pós-Deploy

### ✅ Validação Final
- [ ] URL da aplicação acessível: `https://[projeto].up.railway.app`
- [ ] Endpoints principais respondem corretamente
- [ ] Database conectado e funcional
- [ ] Redis conectado e funcional
- [ ] Logs sem erros críticos
- [ ] Performance aceitável (< 2s response time)

### 📈 Monitoramento Contínuo
- [ ] Configurar alertas no Railway (se disponível)
- [ ] Monitorar métricas de CPU e memória
- [ ] Acompanhar logs de erro
- [ ] Verificar uptime regularmente

### 🔄 Processo de Update
Para atualizações futuras:
1. Push para branch `production-deploy-v1`
2. Railway redeploy automaticamente
3. Monitorar logs durante deploy
4. Validar funcionamento

---

## 📞 Suporte e Recursos

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Status Page**: https://status.railway.app
- **CLI Tool**: `npm install -g @railway/cli`