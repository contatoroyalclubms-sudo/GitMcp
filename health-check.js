#!/usr/bin/env node
/**
 * Health Check Script - Verifica se o servidor está funcionando
 */

const http = require('http');
const https = require('https');

// Configurações
const LOCAL_URL = 'http://localhost:3000';
const RAILWAY_URLS = [
  'https://gitmcp-production.up.railway.app',
  'https://production-deploy-v1.up.railway.app',
  'https://gitmcp.railway.app'
];

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Função para fazer request
function checkUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    console.log(`${colors.cyan}Testando: ${url}${colors.reset}`);
    
    const req = client.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`${colors.green}✅ SUCESSO!${colors.reset}`);
          console.log(`   Status: ${json.status}`);
          console.log(`   PostgreSQL: ${json.database?.postgres || 'N/A'}`);
          console.log(`   Redis: ${json.database?.redis || 'N/A'}`);
          console.log(`   Environment: ${json.environment}`);
          resolve({ url, success: true, data: json });
        } catch (e) {
          console.log(`${colors.yellow}⚠️ Resposta não é JSON${colors.reset}`);
          resolve({ url, success: false, error: 'Invalid JSON' });
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`${colors.red}❌ ERRO: ${err.message}${colors.reset}`);
      resolve({ url, success: false, error: err.message });
    });
    
    req.on('timeout', () => {
      console.log(`${colors.red}❌ TIMEOUT${colors.reset}`);
      req.destroy();
      resolve({ url, success: false, error: 'Timeout' });
    });
  });
}

// Função principal
async function main() {
  console.log('='.repeat(60));
  console.log(`${colors.blue}🔍 HEALTH CHECK - GITMCP SERVER${colors.reset}`);
  console.log('='.repeat(60));
  
  // Testar local
  console.log(`\n${colors.yellow}📍 TESTE LOCAL:${colors.reset}`);
  await checkUrl(LOCAL_URL);
  
  // Testar Railway
  console.log(`\n${colors.yellow}☁️ TESTE RAILWAY:${colors.reset}`);
  let railwayWorking = false;
  
  for (const url of RAILWAY_URLS) {
    const result = await checkUrl(url);
    if (result.success) {
      railwayWorking = true;
      console.log(`\n${colors.green}🎉 SERVIDOR RAILWAY FUNCIONANDO!${colors.reset}`);
      console.log(`${colors.green}URL: ${url}${colors.reset}`);
      break;
    }
  }
  
  if (!railwayWorking) {
    console.log(`\n${colors.red}⚠️ NENHUM SERVIDOR RAILWAY RESPONDENDO${colors.reset}`);
    console.log('Possíveis causas:');
    console.log('1. Deploy ainda em progresso');
    console.log('2. Domínio não configurado');
    console.log('3. Servidor com erro');
    console.log('\nVerifique em: https://railway.app');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Health check completo!');
  console.log('='.repeat(60));
}

// Executar
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkUrl };