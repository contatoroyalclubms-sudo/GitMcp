# Deploy GitMcp no Railway - Guia Completo

## 1. Preparação dos Arquivos de Configuração

### railway.json (Configuração do Railway)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Procfile (Para especificar comando de inicialização)
```
web: npm start
```

### package.json (Seção scripts necessária)
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "npm install",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## 2. Variáveis de Ambiente Necessárias

### Variáveis Principais:
- `PORT`: Será definida automaticamente pelo Railway
- `NODE_ENV`: production
- `DATABASE_URL`: Será fornecida pelo PostgreSQL addon
- `REDIS_URL`: Será fornecida pelo Redis addon

### Variáveis Customizadas (ajuste conforme seu projeto):
- `JWT_SECRET`: Sua chave secreta
- `API_KEY`: Suas chaves de API
- `FRONTEND_URL`: URL do frontend (se aplicável)

## 3. Passo a Passo do Deploy

### Passo 1: Preparar o Repositório
1. Commit e push de todas as alterações para a branch `production-deploy-v1`
2. Verificar se todos os arquivos de configuração estão no repositório

### Passo 2: Criar Projeto no Railway
1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em "New Project"
4. Selecione "Deploy from GitHub repo"
5. Escolha o repositório `contatoroyalclubms-sudo/GitMcp`
6. Selecione a branch `production-deploy-v1`

### Passo 3: Configurar Serviços de Banco de Dados
1. No dashboard do projeto, clique em "New Service"
2. Adicione PostgreSQL:
   - Clique em "Database"
   - Selecione "PostgreSQL"
   - Aguarde a criação
3. Adicione Redis:
   - Clique em "New Service" novamente
   - Selecione "Database"
   - Escolha "Redis"

### Passo 4: Configurar Variáveis de Ambiente
1. Clique no serviço da sua aplicação
2. Vá para a aba "Variables"
3. Adicione as variáveis necessárias:
   ```
   NODE_ENV=production
   JWT_SECRET=sua_chave_secreta_aqui
   PORT=3000
   ```

### Passo 5: Deploy
1. O Railway detectará automaticamente e iniciará o build
2. Acompanhe o progresso na aba "Deployments"
3. Após o deploy bem-sucedido, sua aplicação estará disponível

## 4. Comandos Úteis para Preparação Local

### Verificar se o projeto está pronto:
```bash
# Testar localmente
npm install
npm start

# Verificar se conecta na porta 3000
curl http://localhost:3000

# Verificar dependências
npm audit
```

### Git commands para preparar deploy:
```bash
# Adicionar arquivos de configuração
git add railway.json Procfile
git commit -m "Add Railway configuration files"
git push origin production-deploy-v1
```

## 5. Monitoramento e Troubleshooting

### Logs em Tempo Real:
- Acesse a aba "Deployments" no Railway
- Clique no deployment ativo
- Visualize logs em tempo real

### Health Checks:
- Railway automaticamente verifica se a aplicação responde na porta especificada
- Certifique-se que sua aplicação aceita conexões em 0.0.0.0:PORT

### Comandos de Debug:
```bash
# Se usando Railway CLI
railway login
railway link [project-id]
railway logs
```

## 6. Configurações de Produção Recomendadas

### Otimizações:
1. Configure variável `NODE_ENV=production`
2. Use cache Redis para sessões
3. Configure CORS adequadamente
4. Implemente rate limiting
5. Configure logs estruturados

### Segurança:
1. Use HTTPS (Railway fornece automaticamente)
2. Configure headers de segurança
3. Valide todas as entradas
4. Use variáveis de ambiente para secrets

## 7. URLs e Endpoints Finais

Após o deploy:
- URL da aplicação: `https://[project-name].up.railway.app`
- PostgreSQL: Conectado via DATABASE_URL
- Redis: Conectado via REDIS_URL

## 8. Rollback e Versionamento

### Para fazer rollback:
1. Acesse "Deployments" no Railway
2. Clique no deployment anterior desejado
3. Selecione "Redeploy"

### Para updates:
1. Push para a branch conectada
2. Railway redeploy automaticamente
3. Monitore logs durante o processo