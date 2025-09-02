# 🧠 CONFIGURAÇÃO DA IA REAL - MEEP SUPREME

## Como Configurar a IA do Claude/Anthropic

### 1️⃣ Obtenha sua API Key

1. Acesse: https://console.anthropic.com/
2. Faça login ou crie uma conta
3. Vá em "API Keys" 
4. Crie uma nova chave ou use uma existente

### 2️⃣ Configure o arquivo .env

Crie um arquivo `.env` na raiz do projeto com:

```env
# CONFIGURAÇÃO ESSENCIAL DA IA
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxx

# Modelo do Claude (opcional - usa o mais recente por padrão)
CLAUDE_MODEL=claude-3-opus-20240229

# Outras configurações
PORT=3000
JWT_SECRET=meep-supreme-secret-key-2025
```

### 3️⃣ Instale as dependências da IA

```bash
npm install @anthropic-ai/sdk
npm install @tensorflow/tfjs-node
npm install natural
npm install brain.js
```

### 4️⃣ Teste a IA

Acesse: http://localhost:3000/ai-dashboard.html

### 📊 Funcionalidades da IA Real

Com a API configurada, você terá:

✅ **Previsão de Vendas Inteligente**
- Análise preditiva baseada em dados históricos
- Previsões horárias, diárias e semanais
- Recomendações de ações

✅ **Análise de Clientes**
- Segmentação automática
- Previsão de churn
- Lifetime value
- Recomendações personalizadas

✅ **Detecção de Fraudes**
- Análise em tempo real
- Score de risco
- Bloqueio automático

✅ **Otimização de Preços**
- Preço ótimo por produto
- Elasticidade de demanda
- Maximização de lucro

✅ **Chat com IA**
- Respostas inteligentes
- Análise de sentimento
- Suporte 24/7

✅ **Decisões Automatizadas**
- Gestão de estoque
- Campanhas de marketing
- Ajustes operacionais

### 🚀 APIs Disponíveis

```javascript
// Previsão de vendas
POST /api/ai/predict/sales

// Análise de cliente
POST /api/ai/analyze/customer

// Detecção de fraude
POST /api/ai/detect/fraud

// Otimização de preço
POST /api/ai/optimize/price

// Chat com IA
POST /api/ai/chat

// Analytics em tempo real
POST /api/ai/analytics/realtime
```

### 💡 Dicas

1. **Limite de Tokens**: Configure com cuidado para controlar custos
2. **Cache**: Use cache para respostas frequentes
3. **Fallback**: Sistema funciona mesmo sem API (modo mock)
4. **Monitoramento**: Acompanhe uso no dashboard da Anthropic

### 🔒 Segurança

- NUNCA commite o arquivo .env
- Use variáveis de ambiente em produção
- Rotacione as chaves periodicamente
- Configure rate limiting

### 📞 Suporte

Problemas? O sistema detecta automaticamente se a API está configurada.
Sem API? Funciona em modo simulado com respostas inteligentes pré-programadas.

---

**MEEP SUPREME AI** - Inteligência Artificial de Verdade! 🚀