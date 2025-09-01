# 🔌 INTEGRAÇÃO MCP RAILWAY + CLAUDE CODE

## 🎯 O QUE É MCP?
MCP (Model Context Protocol) permite que Claude Code se conecte diretamente com serviços externos como Railway, fornecendo monitoramento e controle em tempo real.

## 📋 CONFIGURAÇÃO RÁPIDA

### 1️⃣ INSTALAR DEPENDÊNCIAS MCP
```bash
cd C:\Users\User\sistema-meep-deploy\GitMcp
npm install @modelcontextprotocol/sdk
```

### 2️⃣ CONFIGURAR CLAUDE CODE
Copie o arquivo `claude_code_config.json` para:
```
Windows: %APPDATA%\Claude\
Mac: ~/Library/Application Support/Claude/
Linux: ~/.config/Claude/
```

### 3️⃣ CONFIGURAR RAILWAY CLI
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Fazer login
railway login

# Conectar ao projeto
railway link eb872692-f19b-4546-8a92-164401d6b32
```

### 4️⃣ TESTAR MCP SERVER
```bash
# Testar servidor MCP localmente
node mcp-railway-server.js
```

## 🚀 COMO USAR NO CLAUDE CODE

Após configurar, você poderá usar comandos como:

```
"Me mostre os logs do Railway"
"Qual o status do deploy?"
"Faça deploy das mudanças"
"Mostre as variáveis de ambiente"
"Reinicie o servidor no Railway"
```

## 📡 FERRAMENTAS DISPONÍVEIS VIA MCP

### railway_status
Obtém status atual do projeto
```javascript
// Retorna: status do projeto, serviços, deployments
```

### railway_logs
Obtém logs em tempo real
```javascript
// Parâmetros: lines (número de linhas)
// Retorna: últimos logs do servidor
```

### railway_deploy
Faz deploy automático
```javascript
// Parâmetros: message (mensagem do commit)
// Retorna: status do deploy
```

### railway_variables
Lista variáveis de ambiente
```javascript
// Retorna: todas as variáveis configuradas
```

### railway_restart
Reinicia o serviço
```javascript
// Retorna: confirmação de restart
```

## 🔧 ARQUIVO DE CONFIGURAÇÃO

### claude_code_config.json
```json
{
  "mcpServers": {
    "railway": {
      "command": "node",
      "args": ["mcp-railway-server.js"],
      "cwd": "C:\\Users\\User\\sistema-meep-deploy\\GitMcp",
      "env": {
        "RAILWAY_TOKEN": "b7666038-be55-471e-aff1-5d436dd0dd52",
        "RAILWAY_PROJECT_ID": "eb872692-f19b-4546-8a92-164401d6b32"
      }
    }
  }
}
```

## 🔍 MONITORAMENTO EM TEMPO REAL

Com MCP configurado, Claude Code pode:
- ✅ Ver logs em tempo real
- ✅ Detectar erros automaticamente
- ✅ Fazer deploy sem comandos manuais
- ✅ Reiniciar serviços quando necessário
- ✅ Monitorar uso de recursos
- ✅ Gerenciar variáveis de ambiente

## 📊 EXEMPLO DE USO

```javascript
// No Claude Code, você pode pedir:
"Verifique se o servidor está rodando no Railway"

// Claude Code executará automaticamente:
railway_status() // Via MCP
// E retornará o status em tempo real
```

## 🆘 TROUBLESHOOTING

### Erro: "MCP server not found"
- Verifique se o arquivo está em %APPDATA%\Claude\
- Reinicie o Claude Code

### Erro: "Railway not linked"
```bash
railway link eb872692-f19b-4546-8a92-164401d6b32
```

### Erro: "Permission denied"
```bash
# Windows (como admin)
npm install -g @railway/cli

# Mac/Linux
sudo npm install -g @railway/cli
```

## 🎉 BENEFÍCIOS DA INTEGRAÇÃO

1. **Monitoramento Automático**: Claude vê erros em tempo real
2. **Deploy Rápido**: Um comando para fazer deploy
3. **Debugging**: Logs integrados no contexto
4. **Automação**: Claude pode corrigir problemas sozinho
5. **Produtividade**: Menos troca de contexto

## 📝 COMANDOS ÚTEIS

```bash
# Ver se MCP está rodando
ps aux | grep mcp-railway

# Testar conexão
railway status

# Ver token
echo %RAILWAY_TOKEN%

# Logs do MCP
node mcp-railway-server.js 2> mcp.log
```

---

**INTEGRAÇÃO MCP CONFIGURADA! 🎯**

Agora Claude Code pode controlar o Railway diretamente!