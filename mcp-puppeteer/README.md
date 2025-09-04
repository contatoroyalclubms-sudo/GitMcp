# MCP Puppeteer Server

Um servidor MCP (Model Context Protocol) para automação de navegador usando Puppeteer.

## Recursos

- 🚀 **Launch Browser**: Iniciar navegador com opções configuráveis
- 🌐 **Navigate**: Navegar para URLs específicas
- 🖱️ **Click**: Clicar em elementos usando seletores CSS
- ⌨️ **Type**: Digitar texto em campos de entrada
- 📄 **Extract Text**: Extrair texto de elementos
- 📸 **Screenshots**: Capturar screenshots da página
- 🔧 **Execute Scripts**: Executar JavaScript na página
- ⏳ **Wait**: Aguardar elementos aparecerem
- 📋 **Form Fill**: Preencher formulários automaticamente
- 📜 **Scroll**: Controlar rolagem da página

## Instalação

```bash
cd mcp-puppeteer
npm install
```

## Uso

### Como Servidor MCP Standalone

```bash
npm start
```

### Integração com Claude Desktop

Adicione ao seu arquivo de configuração do Claude:

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "node",
      "args": ["src/server.js"],
      "cwd": "./mcp-puppeteer"
    }
  }
}
```

## Exemplos de Uso

### Iniciar Navegador

```javascript
// Iniciar navegador em modo visível
launch_browser({
  headless: false,
  viewport: {
    width: 1920,
    height: 1080,
  },
});
```

### Navegar e Interagir

```javascript
// Navegar para uma página
navigate_to({ url: "https://example.com" });

// Clicar em um botão
click_element({ selector: "#submit-button" });

// Preencher um campo
type_text({
  selector: "#username",
  text: "meu-usuario",
});
```

### Preencher Formulário

```javascript
form_fill({
  fields: [
    {
      selector: "#email",
      value: "user@example.com",
      type: "text",
    },
    {
      selector: "#password",
      value: "minhasenha",
      type: "text",
    },
    {
      selector: "#country",
      value: "BR",
      type: "select",
    },
  ],
});
```

### Capturar Screenshot

```javascript
take_screenshot({
  path: "./screenshot.png",
  fullPage: true,
});
```

## Integração com Sistema MEEP

Este MCP pode ser integrado ao sistema MEEP Enterprise para:

- **Testes Automatizados**: Validar funcionalidades do frontend
- **Web Scraping**: Extrair dados de sites externos
- **Monitoramento**: Verificar status de serviços
- **Automação de Tarefas**: Executar fluxos de trabalho repetitivos

## Plugins Incluídos

- **Stealth Plugin**: Evita detecção como bot
- **Adblocker Plugin**: Bloqueia anúncios e trackers
- **Logger**: Sistema de logs estruturado

## Configurações de Segurança

O servidor inclui configurações otimizadas para execução em diferentes ambientes:

- Modo sandbox desabilitado para containers
- Configurações de memória otimizadas
- User-agent configurável
- Timeout configurável

## Logs

Os logs são salvos em `mcp-puppeteer.log` e incluem:

- Timestamp de cada operação
- Detalhes de erros
- Métricas de performance

## Requisitos

- Node.js 18+
- Sistema operacional: Windows, macOS, Linux
- Puppeteer (instalado automaticamente)

## Contribuição

Este MCP foi desenvolvido para o sistema MEEP Enterprise e pode ser estendido conforme necessário.
