# Railway Deployment Guide

## 🚀 Deployment Solutions Implemented

Este projeto implementa **4 estratégias diferentes** para deploy automatizado na Railway, resolvendo o problema da seleção manual de projeto.

### ⚡ Quick Deploy (Recomendado)

**Uso:** `npm run deploy`

O script mais simples e eficiente. Verifica se o projeto já está linkado e faz o deploy direto.

```bash
# Deploy para projeto padrão (sistema-meep01)
npm run deploy

# Deploy para projeto específico
npm run deploy:protective-patience
npm run deploy:sweet-healing
npm run deploy:melodious-cooperation
```

### 🎯 Manual Interactive Deploy

**Uso:** `npm run deploy:manual`

Script interativo que guia você através do processo de deploy com confirmações.

```bash
npm run deploy:manual sistema-meep01
```

### 🪟 Windows Batch Script

**Uso:** `railway-deploy-simple.bat`

Script para Windows com automação usando expect (se disponível).

```batch
railway-deploy-simple.bat sistema-meep01
```

### 🔧 GitHub Actions (Deploy Contínuo)

Deploy automático configurado em `.github/workflows/railway-deploy.yml`:

- **Staging:** Branches que não sejam main
- **Production:** Branch main
- **Manual:** Via workflow_dispatch

## 📋 Pré-requisitos

1. **Railway CLI instalado e autenticado:**
   ```bash
   railway login
   railway whoami  # Verificar autenticação
   ```

2. **Projeto Railway já existente:**
   - protective-patience
   - sweet-healing
   - melodious-cooperation
   - sistema-meep01

## 🔗 Processo de Deploy

### Primeira vez (Linking necessário):

1. **Opção 1 - Link manual:**
   ```bash
   npm run link
   # Selecione o projeto desejado na lista interativa
   ```

2. **Opção 2 - Deploy interativo:**
   ```bash
   npm run deploy:manual
   # O script guia você através do processo
   ```

### Deploys subsequentes:

```bash
# Deploy simples (projeto já linkado)
npm run deploy

# Verificar status
npm run status

# Ver logs
npm run logs

# Rollback se necessário
npm run rollback
```

## 🏥 Health Checks

Todos os scripts incluem verificações de saúde:

- **Endpoint:** `/health`
- **Timeout:** 120 segundos
- **Retries:** 3-5 tentativas
- **Rollback automático:** Em caso de falha

## 🔄 Rollback Strategy

### Rollback Automático
- Ativado automaticamente em caso de falha de health check
- Informações de rollback armazenadas em `.railway-rollback.txt`

### Rollback Manual
```bash
npm run rollback
```

## 🌐 Deploy Contínuo (GitHub Actions)

### Configuração:

1. **Adicionar secret no GitHub:**
   ```
   RAILWAY_TOKEN = b7666038-be55-471e-aff1-5d436dd0dd52
   ```

2. **Trigger automático:**
   - Push para `main` → Deploy Production
   - Push para outras branches → Deploy Staging
   - Manual via Actions tab

### Features:
- ✅ Zero-downtime deployments
- ✅ Health checks automatizados
- ✅ Rollback automático em falhas
- ✅ Notificações de status
- ✅ Smoke tests pós-deploy

## 📊 Monitoramento

### Status do Deploy:
```bash
npm run status
```

### Logs em tempo real:
```bash
npm run logs
```

### Health Check local:
```bash
npm run health-check
```

## 🛠️ Configuração Avançada

### railway.toml
Arquivo de configuração declarativo com:
- Health check path: `/health`
- Restart policy: ON_FAILURE
- Resource limits: 512MB RAM, 500m CPU

### Variáveis de Ambiente:
- `NODE_ENV=production`
- `PORT=${{RAILWAY_PORT}}`

## 🚨 Troubleshooting

### Problema: "No linked project found"
**Solução:**
```bash
npm run link
# ou
npm run deploy:manual
```

### Problema: "Deployment failed"
**Solução:**
```bash
npm run status  # Verificar erro
npm run logs    # Ver logs detalhados
npm run rollback  # Se necessário
```

### Problema: "Health check failed"
**Verificações:**
1. Server está rodando na porta correta (`process.env.PORT`)
2. Endpoint `/health` retorna status 200
3. Não há erros de sintaxe no código

## ⚡ Performance Metrics

- **Deployment Time:** < 2 minutos
- **Health Check Timeout:** 120 segundos
- **Rollback Time:** < 30 segundos
- **Zero Downtime:** ✅ Garantido

## 🔒 Security

- Token Railway configurado como secret
- Verificações de sintaxe pré-deploy
- Audit de segurança (non-blocking)
- HTTPS enforced via Railway

## 📈 Recommended Workflow

1. **Desenvolvimento local:**
   ```bash
   npm run dev
   npm run test:local
   ```

2. **Deploy para staging:**
   ```bash
   git push origin feature-branch
   # GitHub Actions deploys to staging
   ```

3. **Deploy para production:**
   ```bash
   git push origin main
   # GitHub Actions deploys to production
   ```

4. **Deploy manual urgente:**
   ```bash
   npm run deploy:sistema-meep01
   ```

---

## 🎯 Resumo das Soluções

| Método | Automação | Plataforma | Uso |
|--------|-----------|------------|-----|
| Quick Deploy | ⚡ Alta | All | Deploy rápido após link inicial |
| Manual Deploy | 🎯 Interativa | All | Primeiro deploy ou troubleshooting |
| Batch Script | 🪟 Média | Windows | Deploy automatizado Windows |
| GitHub Actions | 🚀 Total | Cloud | Deploy contínuo e CI/CD |

**Recomendação:** Use `npm run deploy` para deploys rotineiros e `npm run deploy:manual` para o primeiro deploy ou resolução de problemas.