/**
 * Exemplo Simples de Uso do MCP Puppeteer
 * Demonstra como usar o servidor MCP para automação básica
 */

import { writeFileSync } from 'fs';

// Simulação de uso do MCP Puppeteer (sem conexão real)
class SimpleMCPExample {
  constructor() {
    this.examples = [];
  }

  /**
   * Exemplo 1: Captura de Screenshots
   */
  async screenshotExample() {
    console.log('📸 Exemplo: Captura de Screenshots');
    
    const example = {
      name: 'Captura de Screenshot',
      description: 'Capturar screenshot de uma página web',
      mcpCommand: 'take_screenshot',
      parameters: {
        path: './screenshots/exemplo.png',
        fullPage: true
      },
      usage: `
// Via MCP
await mcpClient.call('take_screenshot', {
  path: './screenshots/exemplo.png',
  fullPage: true
});
      `
    };
    
    this.examples.push(example);
    return example;
  }

  /**
   * Exemplo 2: Automação de Formulários
   */
  async formAutomationExample() {
    console.log('📝 Exemplo: Automação de Formulários');
    
    const example = {
      name: 'Automação de Formulário',
      description: 'Preencher e submeter formulários automaticamente',
      mcpCommand: 'form_fill',
      parameters: {
        fields: [
          {
            selector: '#username',
            value: 'usuario@exemplo.com',
            type: 'text'
          },
          {
            selector: '#password',
            value: 'minhasenha123',
            type: 'password'
          },
          {
            selector: '#country',
            value: 'BR',
            type: 'select'
          }
        ]
      },
      usage: `
// Via MCP
await mcpClient.call('form_fill', {
  fields: [
    {
      selector: '#username',
      value: 'usuario@exemplo.com',
      type: 'text'
    }
  ]
});
      `
    };
    
    this.examples.push(example);
    return example;
  }

  /**
   * Exemplo 3: Navegação e Interação
   */
  async navigationExample() {
    console.log('🌐 Exemplo: Navegação e Interação');
    
    const example = {
      name: 'Navegação e Cliques',
      description: 'Navegar entre páginas e interagir com elementos',
      mcpCommands: [
        {
          command: 'navigate_to',
          parameters: { url: 'https://exemplo.com' }
        },
        {
          command: 'wait_for_element',
          parameters: { selector: '#botao-login', timeout: 5000 }
        },
        {
          command: 'click_element',
          parameters: { selector: '#botao-login' }
        }
      ],
      usage: `
// Sequência de comandos MCP
await mcpClient.call('navigate_to', { url: 'https://exemplo.com' });
await mcpClient.call('wait_for_element', { selector: '#botao-login' });
await mcpClient.call('click_element', { selector: '#botao-login' });
      `
    };
    
    this.examples.push(example);
    return example;
  }

  /**
   * Exemplo 4: Extração de Dados
   */
  async dataExtractionExample() {
    console.log('📊 Exemplo: Extração de Dados');
    
    const example = {
      name: 'Extração de Dados',
      description: 'Extrair informações de páginas web',
      mcpCommands: [
        {
          command: 'get_text',
          parameters: { selector: 'h1' }
        },
        {
          command: 'execute_script',
          parameters: {
            script: `
              return Array.from(document.querySelectorAll('.produto')).map(el => ({
                nome: el.querySelector('.nome').textContent,
                preco: el.querySelector('.preco').textContent
              }));
            `
          }
        }
      ],
      usage: `
// Extrair texto
const titulo = await mcpClient.call('get_text', { selector: 'h1' });

// Executar script customizado
const produtos = await mcpClient.call('execute_script', {
  script: \`
    return Array.from(document.querySelectorAll('.produto')).map(el => ({
      nome: el.querySelector('.nome').textContent,
      preco: el.querySelector('.preco').textContent
    }));
  \`
});
      `
    };
    
    this.examples.push(example);
    return example;
  }

  /**
   * Exemplo 5: Integração com Sistema MEEP
   */
  async meepIntegrationExample() {
    console.log('🎯 Exemplo: Integração com Sistema MEEP');
    
    const example = {
      name: 'Teste Automatizado MEEP',
      description: 'Automatizar testes do sistema MEEP',
      workflow: [
        'Iniciar navegador',
        'Navegar para API docs',
        'Testar endpoints',
        'Capturar screenshots',
        'Gerar relatório'
      ],
      mcpSequence: `
// 1. Iniciar browser
await mcpClient.call('launch_browser', {
  headless: false,
  viewport: { width: 1920, height: 1080 }
});

// 2. Navegar para sistema
await mcpClient.call('navigate_to', {
  url: 'http://localhost:8000/docs'
});

// 3. Aguardar carregamento
await mcpClient.call('wait_for_element', {
  selector: '.swagger-ui'
});

// 4. Capturar evidência
await mcpClient.call('take_screenshot', {
  path: 'evidencia-teste.png'
});

// 5. Testar funcionalidades
await mcpClient.call('click_element', {
  selector: '[data-testid="auth-btn"]'
});
      `
    };
    
    this.examples.push(example);
    return example;
  }

  /**
   * Gerar documentação dos exemplos
   */
  async generateDocumentation() {
    console.log('📚 Gerando documentação dos exemplos...');
    
    // Executar todos os exemplos
    await this.screenshotExample();
    await this.formAutomationExample();
    await this.navigationExample();
    await this.dataExtractionExample();
    await this.meepIntegrationExample();
    
    // Gerar markdown da documentação
    const docs = this.generateMarkdownDocs();
    
    // Salvar arquivo
    writeFileSync('c:\\Users\\User\\.claude\\agents\\PUPPETEER-MCP-EXAMPLES.md', docs);
    console.log('✅ Documentação salva em PUPPETEER-MCP-EXAMPLES.md');
    
    return this.examples;
  }

  /**
   * Gerar documentação em Markdown
   */
  generateMarkdownDocs() {
    let markdown = `# Exemplos de Uso - MCP Puppeteer

Este documento contém exemplos práticos de como usar o servidor MCP Puppeteer para automação de navegador.

## Configuração Inicial

### 1. Instalar dependências
\`\`\`bash
cd mcp-puppeteer
npm install
\`\`\`

### 2. Iniciar servidor MCP
\`\`\`bash
cd mcp-puppeteer/src
node server.js
\`\`\`

## Exemplos de Uso

`;

    this.examples.forEach((example, index) => {
      markdown += `### ${index + 1}. ${example.name}

**Descrição:** ${example.description}

`;

      if (example.mcpCommand) {
        markdown += `**Comando MCP:** \`${example.mcpCommand}\`

**Parâmetros:**
\`\`\`json
${JSON.stringify(example.parameters, null, 2)}
\`\`\`

`;
      }

      if (example.mcpCommands) {
        markdown += `**Sequência de Comandos:**
`;
        example.mcpCommands.forEach(cmd => {
          markdown += `- \`${cmd.command}\`: ${JSON.stringify(cmd.parameters)}\n`;
        });
        markdown += '\n';
      }

      if (example.workflow) {
        markdown += `**Fluxo de Trabalho:**
`;
        example.workflow.forEach(step => {
          markdown += `1. ${step}\n`;
        });
        markdown += '\n';
      }

      if (example.usage) {
        markdown += `**Exemplo de Código:**
\`\`\`javascript${example.usage}
\`\`\`

`;
      }

      if (example.mcpSequence) {
        markdown += `**Sequência Completa:**
\`\`\`javascript${example.mcpSequence}
\`\`\`

`;
      }

      markdown += '---\n\n';
    });

    markdown += `## Ferramentas Disponíveis

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

## Dicas e Boas Práticas

1. **Use seletores específicos** para evitar elementos errados
2. **Aguarde carregamento** com \`wait_for_element\`
3. **Capture screenshots** para evidências
4. **Trate erros** adequadamente
5. **Feche o navegador** ao finalizar

## Suporte

Para dúvidas ou problemas, consulte:
- README.md do projeto
- Logs em mcp-puppeteer.log
- Documentação do Puppeteer
`;

    return markdown;
  }
}

// Executar exemplo
async function main() {
  console.log('🚀 Iniciando exemplos do MCP Puppeteer...');
  
  const examples = new SimpleMCPExample();
  await examples.generateDocumentation();
  
  console.log('✅ Exemplos concluídos! Verifique o arquivo PUPPETEER-MCP-EXAMPLES.md');
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { SimpleMCPExample };
