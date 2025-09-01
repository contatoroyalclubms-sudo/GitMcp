#!/usr/bin/env node
/**
 * Railway API Integration
 * Usa o token da API para gerenciar o deploy
 */

const https = require('https');
const fs = require('fs');
require('dotenv').config();

// Configurações da API
const RAILWAY_API_URL = 'https://backboard.railway.app/graphql/v2';
const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN || 'b7666038-be55-471e-aff1-5d436dd0dd52';
const PROJECT_ID = process.env.RAILWAY_PROJECT_ID || 'eb872692-f19b-4546-8a92-164401d6b32';

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Função para fazer requisições GraphQL
function railwayQuery(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables });
    
    const options = {
      hostname: 'backboard.railway.app',
      path: '/graphql/v2',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RAILWAY_TOKEN}`,
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          if (json.errors) {
            reject(new Error(JSON.stringify(json.errors)));
          } else {
            resolve(json.data);
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Queries GraphQL
const queries = {
  // Obter informações do projeto
  getProject: `
    query GetProject($projectId: String!) {
      project(id: $projectId) {
        id
        name
        description
        createdAt
        services {
          edges {
            node {
              id
              name
              source {
                repo
                branch
              }
            }
          }
        }
        environments {
          edges {
            node {
              id
              name
              deployments {
                edges {
                  node {
                    id
                    status
                    createdAt
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  
  // Obter deployments
  getDeployments: `
    query GetDeployments($projectId: String!) {
      project(id: $projectId) {
        deployments {
          edges {
            node {
              id
              status
              createdAt
              meta
              staticUrl
            }
          }
        }
      }
    }
  `,
  
  // Obter variáveis
  getVariables: `
    query GetVariables($projectId: String!) {
      project(id: $projectId) {
        variables {
          edges {
            node {
              name
              value
            }
          }
        }
      }
    }
  `,
  
  // Obter logs
  getLogs: `
    query GetLogs($deploymentId: String!) {
      deployment(id: $deploymentId) {
        logs {
          text
          timestamp
        }
      }
    }
  `
};

// Funções principais
async function getProjectInfo() {
  console.log(`${colors.cyan}📊 Obtendo informações do projeto...${colors.reset}\n`);
  
  try {
    const data = await railwayQuery(queries.getProject, { projectId: PROJECT_ID });
    const project = data.project;
    
    console.log(`${colors.green}✅ Projeto: ${project.name}${colors.reset}`);
    console.log(`   ID: ${project.id}`);
    console.log(`   Criado em: ${new Date(project.createdAt).toLocaleString()}`);
    
    if (project.services?.edges?.length > 0) {
      console.log('\n📦 Serviços:');
      project.services.edges.forEach(({ node }) => {
        console.log(`   - ${node.name}`);
        if (node.source) {
          console.log(`     Repo: ${node.source.repo}`);
          console.log(`     Branch: ${node.source.branch}`);
        }
      });
    }
    
    if (project.environments?.edges?.length > 0) {
      console.log('\n🌍 Ambientes:');
      project.environments.edges.forEach(({ node }) => {
        console.log(`   - ${node.name}`);
        const deployments = node.deployments?.edges || [];
        if (deployments.length > 0) {
          const lastDeploy = deployments[0].node;
          console.log(`     Último deploy: ${lastDeploy.status}`);
        }
      });
    }
    
    return project;
  } catch (error) {
    console.error(`${colors.red}❌ Erro: ${error.message}${colors.reset}`);
    return null;
  }
}

async function getDeploymentStatus() {
  console.log(`${colors.cyan}🚀 Verificando status dos deployments...${colors.reset}\n`);
  
  try {
    const data = await railwayQuery(queries.getDeployments, { projectId: PROJECT_ID });
    const deployments = data.project?.deployments?.edges || [];
    
    if (deployments.length === 0) {
      console.log('Nenhum deployment encontrado');
      return;
    }
    
    console.log('📋 Últimos deployments:');
    deployments.slice(0, 5).forEach(({ node }, index) => {
      const status = node.status;
      const statusColor = status === 'SUCCESS' ? colors.green : 
                         status === 'FAILED' ? colors.red : 
                         colors.yellow;
      
      console.log(`\n${index + 1}. ${statusColor}${status}${colors.reset}`);
      console.log(`   ID: ${node.id}`);
      console.log(`   Data: ${new Date(node.createdAt).toLocaleString()}`);
      if (node.staticUrl) {
        console.log(`   URL: ${node.staticUrl}`);
      }
    });
    
    return deployments;
  } catch (error) {
    console.error(`${colors.red}❌ Erro: ${error.message}${colors.reset}`);
    return [];
  }
}

async function getEnvironmentVariables() {
  console.log(`${colors.cyan}⚙️ Obtendo variáveis de ambiente...${colors.reset}\n`);
  
  try {
    const data = await railwayQuery(queries.getVariables, { projectId: PROJECT_ID });
    const variables = data.project?.variables?.edges || [];
    
    if (variables.length === 0) {
      console.log('Nenhuma variável configurada');
      return;
    }
    
    console.log('📝 Variáveis configuradas:');
    variables.forEach(({ node }) => {
      const value = node.value.length > 20 ? 
                   node.value.substring(0, 20) + '...' : 
                   node.value;
      console.log(`   ${node.name} = ${value}`);
    });
    
    return variables;
  } catch (error) {
    console.error(`${colors.red}❌ Erro: ${error.message}${colors.reset}`);
    return [];
  }
}

async function triggerDeploy() {
  console.log(`${colors.cyan}🚂 Iniciando novo deploy...${colors.reset}\n`);
  
  // Mutation para trigger deploy
  const mutation = `
    mutation TriggerDeploy($projectId: String!, $environmentId: String!) {
      deploymentTrigger(projectId: $projectId, environmentId: $environmentId) {
        id
        status
      }
    }
  `;
  
  try {
    // Primeiro pegar o environment ID
    const projectData = await railwayQuery(queries.getProject, { projectId: PROJECT_ID });
    const environmentId = projectData.project?.environments?.edges[0]?.node?.id;
    
    if (!environmentId) {
      throw new Error('Environment ID não encontrado');
    }
    
    const data = await railwayQuery(mutation, { 
      projectId: PROJECT_ID,
      environmentId: environmentId 
    });
    
    console.log(`${colors.green}✅ Deploy iniciado com sucesso!${colors.reset}`);
    console.log(`   ID: ${data.deploymentTrigger.id}`);
    console.log(`   Status: ${data.deploymentTrigger.status}`);
    
    return data.deploymentTrigger;
  } catch (error) {
    console.error(`${colors.red}❌ Erro ao iniciar deploy: ${error.message}${colors.reset}`);
    return null;
  }
}

// Menu principal
async function main() {
  console.log(colors.magenta + '='.repeat(60));
  console.log('🚂 RAILWAY API MANAGER');
  console.log('='.repeat(60) + colors.reset);
  console.log(`Token: ${RAILWAY_TOKEN.substring(0, 10)}...`);
  console.log(`Project: ${PROJECT_ID}\n`);
  
  // Executar todas as funções
  await getProjectInfo();
  console.log('\n' + '='.repeat(60) + '\n');
  
  await getDeploymentStatus();
  console.log('\n' + '='.repeat(60) + '\n');
  
  await getEnvironmentVariables();
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Perguntar se quer fazer deploy
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\n🚀 Deseja iniciar um novo deploy? (s/n): ', async (answer) => {
    if (answer.toLowerCase() === 's') {
      await triggerDeploy();
    }
    
    console.log(`\n${colors.green}✅ Concluído!${colors.reset}`);
    console.log('Acesse o dashboard: https://railway.app');
    rl.close();
  });
}

// Exportar funções para uso em outros scripts
module.exports = {
  railwayQuery,
  getProjectInfo,
  getDeploymentStatus,
  getEnvironmentVariables,
  triggerDeploy
};

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}