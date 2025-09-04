/**
 * Exemplo de Integração MCP Puppeteer com Sistema MEEP
 * Este exemplo mostra como usar o MCP Puppeteer para automação de tarefas
 */

import { spawn } from 'child_process';
import path from 'path';

class MEEPPuppeteerIntegration {
  constructor() {
    this.mcpProcess = null;
    this.mcpReady = false;
  }

  /**
   * Inicia o servidor MCP Puppeteer
   */
  async startMCPServer() {
    return new Promise((resolve, reject) => {
      const serverPath = path.join(process.cwd(), 'mcp-puppeteer', 'src', 'server.js');
      
      this.mcpProcess = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: path.join(process.cwd(), 'mcp-puppeteer')
      });

      this.mcpProcess.stdout.on('data', (data) => {
        const message = data.toString();
        console.log('📡 MCP Server:', message);
        
        if (message.includes('MCP Puppeteer server running')) {
          this.mcpReady = true;
          resolve();
        }
      });

      this.mcpProcess.stderr.on('data', (data) => {
        console.error('❌ MCP Server Error:', data.toString());
      });

      this.mcpProcess.on('close', (code) => {
        console.log(`🔚 MCP Server exited with code ${code}`);
        this.mcpReady = false;
      });

      // Timeout de 10 segundos para inicialização
      setTimeout(() => {
        if (!this.mcpReady) {
          reject(new Error('MCP Server failed to start within 10 seconds'));
        }
      }, 10000);
    });
  }

  /**
   * Envia comando para o MCP Server
   */
  async sendMCPCommand(tool, params) {
    if (!this.mcpReady) {
      throw new Error('MCP Server not ready');
    }

    const request = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: tool,
        arguments: params
      }
    };

    return new Promise((resolve, reject) => {
      this.mcpProcess.stdin.write(JSON.stringify(request) + '\n');
      
      const responseHandler = (data) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.id === request.id) {
            this.mcpProcess.stdout.removeListener('data', responseHandler);
            resolve(response.result);
          }
        } catch (error) {
          // Ignorar mensagens que não são JSON válido
        }
      };

      this.mcpProcess.stdout.on('data', responseHandler);
      
      // Timeout para resposta
      setTimeout(() => {
        this.mcpProcess.stdout.removeListener('data', responseHandler);
        reject(new Error('MCP command timeout'));
      }, 30000);
    });
  }

  /**
   * Exemplo: Teste automatizado do sistema MEEP
   */
  async testMEEPSystem() {
    try {
      console.log('🧪 Iniciando teste automatizado do sistema MEEP...');

      // 1. Iniciar browser
      await this.sendMCPCommand('launch_browser', {
        headless: false,
        viewport: {
          width: 1920,
          height: 1080
        }
      });

      // 2. Navegar para o sistema MEEP
      await this.sendMCPCommand('navigate_to', {
        url: 'http://localhost:8000/docs'
      });

      // 3. Aguardar carregamento
      await this.sendMCPCommand('wait_for_element', {
        selector: '.swagger-ui',
        timeout: 10000
      });

      // 4. Capturar screenshot da documentação
      await this.sendMCPCommand('take_screenshot', {
        path: 'meep-api-docs.png',
        fullPage: true
      });

      // 5. Testar autenticação
      await this.sendMCPCommand('click_element', {
        selector: '[data-testid="auth-btn"]'
      });

      console.log('✅ Teste automatizado concluído com sucesso!');

    } catch (error) {
      console.error('❌ Erro no teste automatizado:', error);
    }
  }

  /**
   * Exemplo: Monitoramento de performance
   */
  async monitorPerformance() {
    try {
      console.log('📊 Iniciando monitoramento de performance...');

      // Navegar para dashboard
      await this.sendMCPCommand('navigate_to', {
        url: 'http://localhost:3000/dashboard'
      });

      // Medir tempo de carregamento
      const result = await this.sendMCPCommand('execute_script', {
        script: `
          return {
            loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
            domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
            firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
          };
        `
      });

      console.log('📈 Métricas de performance:', result);

      // Salvar relatório
      await this.sendMCPCommand('execute_script', {
        script: `
          const report = ${JSON.stringify(result)};
          localStorage.setItem('performance-report', JSON.stringify({
            timestamp: Date.now(),
            metrics: report
          }));
        `
      });

    } catch (error) {
      console.error('❌ Erro no monitoramento:', error);
    }
  }

  /**
   * Exemplo: Automação de formulários
   */
  async automateEventCreation() {
    try {
      console.log('📝 Automatizando criação de evento...');

      // Navegar para formulário de eventos
      await this.sendMCPCommand('navigate_to', {
        url: 'http://localhost:3000/eventos/criar'
      });

      // Preencher formulário
      await this.sendMCPCommand('form_fill', {
        fields: [
          {
            selector: '#nome',
            value: 'Evento Automatizado',
            type: 'text'
          },
          {
            selector: '#descricao',
            value: 'Evento criado automaticamente via MCP Puppeteer',
            type: 'text'
          },
          {
            selector: '#data_inicio',
            value: '2025-09-10',
            type: 'date'
          },
          {
            selector: '#categoria',
            value: 'tecnologia',
            type: 'select'
          }
        ]
      });

      // Submeter formulário
      await this.sendMCPCommand('click_element', {
        selector: '#submit-evento'
      });

      // Aguardar confirmação
      await this.sendMCPCommand('wait_for_element', {
        selector: '.success-message',
        timeout: 5000
      });

      console.log('✅ Evento criado automaticamente!');

    } catch (error) {
      console.error('❌ Erro na automação de evento:', error);
    }
  }

  /**
   * Para o servidor MCP
   */
  async stopMCPServer() {
    if (this.mcpProcess) {
      // Fechar browser primeiro
      try {
        await this.sendMCPCommand('close_browser', {});
      } catch (error) {
        console.log('Browser já estava fechado');
      }

      this.mcpProcess.kill();
      this.mcpProcess = null;
      this.mcpReady = false;
      console.log('🛑 Servidor MCP finalizado');
    }
  }
}

// Exemplo de uso
async function exemploCompleto() {
  const integration = new MEEPPuppeteerIntegration();
  
  try {
    // Iniciar servidor MCP
    await integration.startMCPServer();
    console.log('🚀 Servidor MCP iniciado com sucesso!');
    
    // Executar testes
    await integration.testMEEPSystem();
    await integration.monitorPerformance();
    await integration.automateEventCreation();
    
  } catch (error) {
    console.error('❌ Erro na integração:', error);
  } finally {
    // Finalizar servidor
    await integration.stopMCPServer();
  }
}

// Exportar para uso em outros módulos
export { MEEPPuppeteerIntegration };

// Executar exemplo se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  exemploCompleto();
}
