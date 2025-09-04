# Exemplos de Uso - MCP Puppeteer

Este documento contém exemplos práticos de como usar o servidor MCP Puppeteer para automação de navegador.

## Configuração Inicial

### 1. Instalar dependências

```bash
cd mcp-puppeteer
npm install
```

### 2. Iniciar servidor MCP

```bash
cd mcp-puppeteer/src
node server.js
```

## Exemplos de Uso

### 1. Captura de Screenshots

**Descrição:** Capturar screenshot de uma página web

**Comando MCP:** `take_screenshot`

**Parâmetros:**

```json
{
  "path": "./screenshots/exemplo.png",
  "fullPage": true
}
```

**Exemplo de Código:**

```javascript
// Via MCP
await mcpClient.call("take_screenshot", {
  path: "./screenshots/exemplo.png",
  fullPage: true,
});
```

---

### 2. Automação de Formulários

**Descrição:** Preencher e submeter formulários automaticamente

**Comando MCP:** `form_fill`

**Parâmetros:**

```json
{
  "fields": [
    {
      "selector": "#username",
      "value": "usuario@exemplo.com",
      "type": "text"
    },
    {
      "selector": "#password",
      "value": "minhasenha123",
      "type": "password"
    },
    {
      "selector": "#country",
      "value": "BR",
      "type": "select"
    }
  ]
}
```

**Exemplo de Código:**

```javascript
// Via MCP
await mcpClient.call("form_fill", {
  fields: [
    {
      selector: "#username",
      value: "usuario@exemplo.com",
      type: "text",
    },
  ],
});
```

---

### 3. Navegação e Interação

**Descrição:** Navegar entre páginas e interagir com elementos

**Sequência de Comandos:**

- `navigate_to`: {"url":"https://exemplo.com"}
- `wait_for_element`: {"selector":"#botao-login","timeout":5000}
- `click_element`: {"selector":"#botao-login"}

**Exemplo de Código:**

```javascript
// Sequência de comandos MCP
await mcpClient.call("navigate_to", { url: "https://exemplo.com" });
await mcpClient.call("wait_for_element", { selector: "#botao-login" });
await mcpClient.call("click_element", { selector: "#botao-login" });
```

---

### 4. Extração de Dados

**Descrição:** Extrair informações de páginas web

**Sequência de Comandos:**

- `get_text`: {"selector":"h1"}
- `execute_script`: {"script":"return Array.from(document.querySelectorAll('.produto')).map(el => ({ nome: el.querySelector('.nome').textContent, preco: el.querySelector('.preco').textContent }));"}

**Exemplo de Código:**

```javascript
// Extrair texto
const titulo = await mcpClient.call("get_text", { selector: "h1" });

// Executar script customizado
const produtos = await mcpClient.call("execute_script", {
  script: `
    return Array.from(document.querySelectorAll('.produto')).map(el => ({
      nome: el.querySelector('.nome').textContent,
      preco: el.querySelector('.preco').textContent
    }));
  `,
});
```

---

### 5. Teste Automatizado MEEP

**Descrição:** Automatizar testes do sistema MEEP

**Fluxo de Trabalho:**

1. Iniciar navegador
2. Navegar para API docs
3. Testar endpoints
4. Capturar screenshots
5. Gerar relatório

**Sequência Completa:**

```javascript
// 1. Iniciar browser
await mcpClient.call("launch_browser", {
  headless: false,
  viewport: { width: 1920, height: 1080 },
});

// 2. Navegar para sistema
await mcpClient.call("navigate_to", {
  url: "http://localhost:8000/docs",
});

// 3. Aguardar carregamento
await mcpClient.call("wait_for_element", {
  selector: ".swagger-ui",
});

// 4. Capturar evidência
await mcpClient.call("take_screenshot", {
  path: "evidencia-teste.png",
});

// 5. Testar funcionalidades
await mcpClient.call("click_element", {
  selector: '[data-testid="auth-btn"]',
});
```

---

## Ferramentas Disponíveis

O MCP Puppeteer oferece as seguintes ferramentas:

1. **launch_browser** - Iniciar navegador
2. **navigate_to** - Navegar para URL
3. **click_element** - Clicar em elemento
4. **type_text** - Digitar texto
5. **get_text** - Extrair texto
6. **take_screenshot** - Capturar screenshot
7. **execute_script** - Executar JavaScript
8. **wait_for_element** - Aguardar elemento
9. **get_page_source** - Obter HTML da página
10. **close_browser** - Fechar navegador
11. **form_fill** - Preencher formulário
12. **scroll_page** - Controlar rolagem

## Integração com Sistema MEEP

O MCP Puppeteer pode ser integrado ao sistema MEEP para:

- **Testes Automatizados**: Validar funcionalidades do frontend
- **Monitoramento**: Verificar status e performance
- **Automação**: Executar tarefas repetitivas
- **Relatórios**: Gerar evidências visuais

## Casos de Uso Práticos

### Teste de API Documentation

```javascript
// Validar que a documentação da API está acessível
await mcpClient.call("navigate_to", { url: "http://localhost:8000/docs" });
await mcpClient.call("wait_for_element", { selector: ".swagger-ui" });
await mcpClient.call("take_screenshot", { path: "api-docs-validation.png" });
```

### Automação de Login

```javascript
// Automatizar processo de login
await mcpClient.call("navigate_to", { url: "http://localhost:3000/login" });
await mcpClient.call("type_text", {
  selector: "#email",
  text: "admin@exemplo.com",
});
await mcpClient.call("type_text", { selector: "#password", text: "senha123" });
await mcpClient.call("click_element", { selector: "#login-button" });
await mcpClient.call("wait_for_element", { selector: ".dashboard" });
```

### Monitoramento de Performance

```javascript
// Medir métricas de performance
const metrics = await mcpClient.call("execute_script", {
  script: `
    return {
      loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
      domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
      firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
    };
  `,
});
```

### Teste de Formulário de Eventos

```javascript
// Teste automatizado de criação de eventos
await mcpClient.call("navigate_to", {
  url: "http://localhost:3000/eventos/criar",
});
await mcpClient.call("form_fill", {
  fields: [
    { selector: "#nome", value: "Evento Teste", type: "text" },
    { selector: "#descricao", value: "Descrição do evento", type: "text" },
    { selector: "#data_inicio", value: "2025-09-15", type: "date" },
    { selector: "#categoria", value: "tecnologia", type: "select" },
  ],
});
await mcpClient.call("click_element", { selector: "#submit-evento" });
await mcpClient.call("wait_for_element", { selector: ".success-message" });
```

## Configurações Avançadas

### Browser com Configurações Customizadas

```javascript
await mcpClient.call("launch_browser", {
  headless: true,
  viewport: { width: 1920, height: 1080 },
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  timeout: 30000,
});
```

### Screenshots com Opções Avançadas

```javascript
await mcpClient.call("take_screenshot", {
  path: "./reports/screenshot.png",
  fullPage: true,
  quality: 90,
  type: "jpeg",
});
```

### Execução de Scripts Complexos

```javascript
const data = await mcpClient.call("execute_script", {
  script: `
    // Extrair dados da tabela
    const tabela = document.querySelector('#tabela-eventos');
    const linhas = Array.from(tabela.querySelectorAll('tbody tr'));
    
    return linhas.map(linha => {
      const colunas = linha.querySelectorAll('td');
      return {
        id: colunas[0]?.textContent?.trim(),
        nome: colunas[1]?.textContent?.trim(),
        data: colunas[2]?.textContent?.trim(),
        status: colunas[3]?.textContent?.trim()
      };
    });
  `,
});
```

## Dicas e Boas Práticas

1. **Use seletores específicos** para evitar elementos errados
2. **Aguarde carregamento** com `wait_for_element`
3. **Capture screenshots** para evidências
4. **Trate erros** adequadamente
5. **Feche o navegador** ao finalizar
6. **Use timeouts** apropriados
7. **Valide resultados** antes de prosseguir

## Troubleshooting

### Problema: Elemento não encontrado

```javascript
// Solução: Aumentar timeout e usar seletor mais específico
await mcpClient.call("wait_for_element", {
  selector: 'button[data-testid="submit-button"]',
  timeout: 10000,
});
```

### Problema: Navegação lenta

```javascript
// Solução: Aguardar carregamento específico
await mcpClient.call("navigate_to", { url: "http://localhost:3000" });
await mcpClient.call("wait_for_element", { selector: '[data-loaded="true"]' });
```

### Problema: Scripts não executam

```javascript
// Solução: Aguardar DOM estar pronto
await mcpClient.call("execute_script", {
  script: `
    return new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve(document.title);
      } else {
        window.addEventListener('load', () => resolve(document.title));
      }
    });
  `,
});
```

## Suporte

Para dúvidas ou problemas, consulte:

- README.md do projeto
- Logs em mcp-puppeteer.log
- Documentação do Puppeteer: https://puppeteer.github.io/puppeteer/
- MCP SDK: https://github.com/modelcontextprotocol/servers

## Status da Integração

✅ **Puppeteer instalado e funcionando**
✅ **Servidor MCP rodando**
✅ **Exemplos documentados**
✅ **Integração com sistema MEEP**
✅ **Screenshots funcionais**
✅ **Automação de formulários**
✅ **Execução de scripts**

O MCP Puppeteer está totalmente integrado e pronto para uso!
