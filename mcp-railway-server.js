#!/usr/bin/env node
/**
 * MCP Server para Railway - Integração com Claude Code
 * Permite monitoramento em tempo real do Railway
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Token e configurações do Railway
const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN || 'b7666038-be55-471e-aff1-5d436dd0dd52';
const PROJECT_ID = process.env.RAILWAY_PROJECT_ID || 'eb872692-f19b-4546-8a92-164401d6b32';

class RailwayMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'railway-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // Lista de ferramentas disponíveis
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'railway_status',
          description: 'Obter status atual do projeto Railway',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'railway_logs',
          description: 'Obter logs do Railway',
          inputSchema: {
            type: 'object',
            properties: {
              lines: {
                type: 'number',
                description: 'Número de linhas de log',
                default: 50,
              },
            },
          },
        },
        {
          name: 'railway_deploy',
          description: 'Fazer deploy no Railway',
          inputSchema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'Mensagem do commit',
              },
            },
          },
        },
        {
          name: 'railway_variables',
          description: 'Listar variáveis de ambiente',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'railway_restart',
          description: 'Reiniciar serviço no Railway',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    // Executar ferramentas
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'railway_status':
          return await this.getStatus();
        
        case 'railway_logs':
          return await this.getLogs(args.lines || 50);
        
        case 'railway_deploy':
          return await this.deploy(args.message);
        
        case 'railway_variables':
          return await this.getVariables();
        
        case 'railway_restart':
          return await this.restart();
        
        default:
          throw new Error(`Ferramenta desconhecida: ${name}`);
      }
    });
  }

  async getStatus() {
    try {
      const { stdout } = await execAsync('railway status');
      return {
        content: [
          {
            type: 'text',
            text: `Status do Railway:\n${stdout}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Erro ao obter status: ${error.message}`,
          },
        ],
      };
    }
  }

  async getLogs(lines) {
    try {
      const { stdout } = await execAsync(`railway logs`);
      const logLines = stdout.split('\n').slice(-lines).join('\n');
      return {
        content: [
          {
            type: 'text',
            text: `Últimos ${lines} logs:\n${logLines}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Erro ao obter logs: ${error.message}`,
          },
        ],
      };
    }
  }

  async deploy(message) {
    try {
      // Git add, commit e push
      await execAsync('git add -A');
      await execAsync(`git commit -m "${message || 'Deploy via MCP'}"`);
      await execAsync('git push origin production-deploy-v1');
      
      // Railway deploy
      const { stdout } = await execAsync('railway up');
      
      return {
        content: [
          {
            type: 'text',
            text: `Deploy iniciado com sucesso:\n${stdout}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Erro no deploy: ${error.message}`,
          },
        ],
      };
    }
  }

  async getVariables() {
    try {
      const { stdout } = await execAsync('railway variables');
      return {
        content: [
          {
            type: 'text',
            text: `Variáveis de ambiente:\n${stdout}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Erro ao obter variáveis: ${error.message}`,
          },
        ],
      };
    }
  }

  async restart() {
    try {
      const { stdout } = await execAsync('railway restart');
      return {
        content: [
          {
            type: 'text',
            text: `Serviço reiniciado:\n${stdout}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Erro ao reiniciar: ${error.message}`,
          },
        ],
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Railway MCP Server iniciado');
  }
}

// Iniciar servidor
if (require.main === module) {
  const server = new RailwayMCPServer();
  server.run().catch(console.error);
}

module.exports = RailwayMCPServer;