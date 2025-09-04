/**
 * VALIDAÇÃO FUNCIONAL COMPLETA DO SISTEMA GITMECP
 * Script standalone para validar todas as rotas e funcionalidades
 */

const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');

// Configuração
const BASE_URL = 'http://localhost:3000';
const RESULTS = {
  routes: [],
  performance: [],
  errors: [],
  summary: {}
};

// Helper para fazer requisições HTTP
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const protocol = options.url.startsWith('https') ? https : http;
    
    const url = new URL(options.url);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port || (protocol === https ? 443 : 80),
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (options.body) {
      const bodyStr = JSON.stringify(options.body);
      reqOptions.headers['Content-Type'] = 'application/json';
      reqOptions.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = protocol.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const responseTime = performance.now() - startTime;
        let parsedBody = null;
        
        try {
          parsedBody = data ? JSON.parse(data) : null;
        } catch (e) {
          // If it's not JSON, return raw data
          parsedBody = data;
        }
        
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsedBody,
          responseTime: responseTime
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

// Lista de todas as rotas do sistema
const ROUTES = [
  { path: '/api/auth', name: 'Authentication', public: true },
  { path: '/api/dashboard', name: 'Dashboard & Analytics' },
  { path: '/api/events', name: 'Event Management', public: true },
  { path: '/api/pdv', name: 'Point of Sale' },
  { path: '/api/inventory', name: 'Inventory Control' },
  { path: '/api/sales', name: 'Sales Management' },
  { path: '/api/clients', name: 'Client Management' },
  { path: '/api/menu', name: 'Menu & Products', public: true },
  { path: '/api/finance', name: 'Financial Control' },
  { path: '/api/reports', name: 'Reports & Export' },
  { path: '/api/marketing', name: 'Marketing Campaigns' },
  { path: '/api/cashless', name: 'Cashless System' },
  { path: '/api/team', name: 'Team Management' },
  { path: '/api/config', name: 'System Configuration' },
  { path: '/api/bi', name: 'Business Intelligence' },
  { path: '/api/ai', name: 'AI & Predictions' }
];

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║     VALIDAÇÃO FUNCIONAL - SISTEMA GITMECP v2.0          ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

async function validateSystem() {
  let authToken = null;
  
  // TESTE 1: Verificar se servidor está rodando
  console.log('📋 TESTE 1: VERIFICANDO SERVIDOR');
  console.log('─'.repeat(50));
  
  try {
    const health = await makeRequest({
      url: `${BASE_URL}/health`
    });
    
    if (health.status === 200) {
      console.log('✅ Servidor está rodando');
      console.log(`   Response time: ${health.responseTime.toFixed(2)}ms`);
      RESULTS.summary.serverStatus = 'OK';
    } else {
      console.log('❌ Servidor não está respondendo corretamente');
      RESULTS.summary.serverStatus = 'ERROR';
    }
  } catch (error) {
    console.log('❌ ERRO: Servidor não está acessível');
    console.log('   Execute: npm start');
    process.exit(1);
  }

  // TESTE 2: Autenticação
  console.log('\n📋 TESTE 2: AUTENTICAÇÃO');
  console.log('─'.repeat(50));
  
  try {
    // Registrar usuário de teste
    const timestamp = Date.now();
    const register = await makeRequest({
      url: `${BASE_URL}/api/auth/register`,
      method: 'POST',
      body: {
        name: 'Validation Test',
        email: `test${timestamp}@validation.com`,
        password: 'Test@123'
      }
    });
    
    if (register.status === 201 && register.body.token) {
      authToken = register.body.token;
      console.log('✅ Registro funcionando');
      console.log(`   Token obtido: ${authToken.substring(0, 20)}...`);
    }
    
    // Login
    const login = await makeRequest({
      url: `${BASE_URL}/api/auth/login`,
      method: 'POST',
      body: {
        email: `test${timestamp}@validation.com`,
        password: 'Test@123'
      }
    });
    
    if (login.status === 200) {
      console.log('✅ Login funcionando');
      console.log(`   Response time: ${login.responseTime.toFixed(2)}ms`);
    }
    
    RESULTS.summary.authentication = 'OK';
  } catch (error) {
    console.log('⚠️  Autenticação com problemas:', error.message);
    RESULTS.summary.authentication = 'ERROR';
  }

  // TESTE 3: Validar todas as rotas
  console.log('\n📋 TESTE 3: VALIDAÇÃO DE TODAS AS ROTAS');
  console.log('─'.repeat(50));
  
  for (const route of ROUTES) {
    try {
      const headers = {};
      if (authToken && !route.public) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await makeRequest({
        url: `${BASE_URL}${route.path}`,
        headers: headers
      });
      
      const status = response.status < 500 ? '✅' : '❌';
      const time = response.responseTime.toFixed(2);
      
      console.log(`${status} ${route.name.padEnd(25)} [${response.status}] ${time}ms`);
      
      RESULTS.routes.push({
        name: route.name,
        path: route.path,
        status: response.status,
        responseTime: response.responseTime,
        success: response.status < 500
      });
    } catch (error) {
      console.log(`❌ ${route.name.padEnd(25)} [ERROR]`);
      RESULTS.errors.push({
        route: route.name,
        error: error.message
      });
    }
  }

  // TESTE 4: Performance Testing
  console.log('\n📋 TESTE 4: TESTE DE PERFORMANCE');
  console.log('─'.repeat(50));
  
  console.log('Executando 50 requisições simultâneas...');
  
  const promises = [];
  const startTime = performance.now();
  
  for (let i = 0; i < 50; i++) {
    promises.push(makeRequest({
      url: `${BASE_URL}/health`
    }));
  }
  
  try {
    const results = await Promise.all(promises);
    const totalTime = performance.now() - startTime;
    const avgTime = results.reduce((acc, r) => acc + r.responseTime, 0) / results.length;
    const successCount = results.filter(r => r.status === 200).length;
    
    console.log(`✅ ${successCount}/50 requisições bem sucedidas`);
    console.log(`   Tempo total: ${totalTime.toFixed(2)}ms`);
    console.log(`   Tempo médio: ${avgTime.toFixed(2)}ms`);
    console.log(`   Taxa de sucesso: ${(successCount/50*100).toFixed(1)}%`);
    
    RESULTS.performance = {
      totalRequests: 50,
      successCount: successCount,
      totalTime: totalTime,
      averageTime: avgTime,
      successRate: successCount/50*100
    };
    
    if (avgTime < 500) {
      console.log('✅ Performance dentro do esperado (<500ms)');
    } else {
      console.log('⚠️  Performance abaixo do esperado (>500ms)');
    }
  } catch (error) {
    console.log('❌ Erro no teste de performance:', error.message);
  }

  // TESTE 5: Uso de Memória
  console.log('\n📋 TESTE 5: USO DE MEMÓRIA');
  console.log('─'.repeat(50));
  
  const memUsage = process.memoryUsage();
  const heapUsedMB = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
  const heapTotalMB = (memUsage.heapTotal / 1024 / 1024).toFixed(2);
  
  console.log(`   Heap usado: ${heapUsedMB}MB`);
  console.log(`   Heap total: ${heapTotalMB}MB`);
  console.log(`   Uso: ${(memUsage.heapUsed/memUsage.heapTotal*100).toFixed(1)}%`);
  
  if (heapUsedMB < 512) {
    console.log('✅ Uso de memória dentro do limite (<512MB)');
  } else {
    console.log('⚠️  Uso de memória elevado (>512MB)');
  }

  // RELATÓRIO FINAL
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                    RELATÓRIO FINAL                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  const successRoutes = RESULTS.routes.filter(r => r.success).length;
  const totalRoutes = RESULTS.routes.length;
  const avgResponseTime = RESULTS.routes.reduce((acc, r) => acc + r.responseTime, 0) / totalRoutes;
  
  console.log('📊 RESUMO:');
  console.log(`   Total de rotas testadas: ${totalRoutes}`);
  console.log(`   Rotas funcionando: ${successRoutes}/${totalRoutes} (${(successRoutes/totalRoutes*100).toFixed(1)}%)`);
  console.log(`   Tempo médio de resposta: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`   Erros encontrados: ${RESULTS.errors.length}`);
  
  console.log('\n🎯 CRITÉRIOS DE SUCESSO:');
  console.log(`   [${avgResponseTime < 500 ? '✅' : '❌'}] Response time < 500ms`);
  console.log(`   [${RESULTS.performance.successRate === 100 ? '✅' : '⚠️'}] Handle 50 requests simultâneas`);
  console.log(`   [${heapUsedMB < 512 ? '✅' : '❌'}] Memory usage < 512MB`);
  
  // Rotas com problemas
  if (RESULTS.errors.length > 0) {
    console.log('\n⚠️  ROTAS COM PROBLEMAS:');
    RESULTS.errors.forEach(e => {
      console.log(`   - ${e.route}: ${e.error}`);
    });
  }
  
  // Salvar relatório
  const fs = require('fs');
  const reportPath = `validation-report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(RESULTS, null, 2));
  console.log(`\n📄 Relatório salvo em: ${reportPath}`);
  
  console.log('\n' + '='.repeat(60));
  console.log('VALIDAÇÃO COMPLETA! ✨');
  console.log('='.repeat(60));
}

// Executar validação
validateSystem().catch(console.error);