const axios = require('axios');
const chalk = require('chalk');

const BASE_URL = 'http://localhost:3000';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Cores para o console
const success = chalk.green;
const error = chalk.red;
const warning = chalk.yellow;
const info = chalk.cyan;
const bold = chalk.bold;

async function validateSystem() {
    console.log(bold('\n🚀 VALIDAÇÃO COMPLETA DO SISTEMA MEEP\n'));
    console.log('=' . repeat(50));
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    const results = [];
    
    // Token de autenticação
    let authToken = '';
    
    try {
        // 1. TESTE DE SAÚDE DO SISTEMA
        console.log(bold('\n📋 1. VERIFICANDO SAÚDE DO SISTEMA'));
        console.log('-'.repeat(40));
        
        try {
            const health = await axios.get(`${BASE_URL}/health`);
            if (health.data.status === 'healthy') {
                console.log(success('✅ Sistema está saudável'));
                console.log(info(`   Versão: ${health.data.version}`));
                console.log(info(`   Uptime: ${health.data.uptime}s`));
                console.log(info(`   Módulos: ${health.data.modules}`));
                passedTests++;
            }
            totalTests++;
        } catch (err) {
            console.log(error('❌ Falha no health check'));
            failedTests++;
            totalTests++;
        }
        
        // 2. TESTE DE AUTENTICAÇÃO
        console.log(bold('\n📋 2. TESTANDO AUTENTICAÇÃO'));
        console.log('-'.repeat(40));
        
        try {
            const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
                email: 'admin@meep.com',
                password: 'admin123'
            });
            
            if (loginResponse.data.token) {
                authToken = loginResponse.data.token;
                console.log(success('✅ Login realizado com sucesso'));
                console.log(info(`   Usuário: ${loginResponse.data.user.name}`));
                console.log(info(`   Role: ${loginResponse.data.user.role}`));
                passedTests++;
            }
            totalTests++;
        } catch (err) {
            console.log(error('❌ Falha no login'));
            console.log(error(`   Erro: ${err.response?.data?.message || err.message}`));
            failedTests++;
            totalTests++;
        }
        
        // Configurar headers com token
        const authHeaders = {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        };
        
        // 3. TESTE DAS ROTAS PRINCIPAIS
        console.log(bold('\n📋 3. TESTANDO ROTAS PRINCIPAIS'));
        console.log('-'.repeat(40));
        
        const routes = [
            { name: 'Dashboard', url: '/api/dashboard/stats', method: 'GET' },
            { name: 'Eventos', url: '/api/events', method: 'GET' },
            { name: 'Produtos', url: '/api/products', method: 'GET' },
            { name: 'Vendas', url: '/api/sales', method: 'GET' },
            { name: 'Clientes', url: '/api/clients', method: 'GET' },
            { name: 'Usuários', url: '/api/users', method: 'GET' },
            { name: 'Cashless', url: '/api/cashless/cards', method: 'GET' },
            { name: 'PDV', url: '/api/pdv/status', method: 'GET' },
            { name: 'Financeiro', url: '/api/finance/transactions', method: 'GET' },
            { name: 'Estoque', url: '/api/inventory', method: 'GET' },
            { name: 'Relatórios', url: '/api/reports/sales', method: 'GET' },
            { name: 'BI Dashboard', url: '/api/bi/dashboard', method: 'GET' },
            { name: 'AI Insights', url: '/api/ai/insights', method: 'GET' }
        ];
        
        for (const route of routes) {
            totalTests++;
            try {
                const response = await axios({
                    method: route.method,
                    url: `${BASE_URL}${route.url}`,
                    ...authHeaders
                });
                
                if (response.status === 200) {
                    console.log(success(`✅ ${route.name}: OK`));
                    passedTests++;
                }
            } catch (err) {
                const status = err.response?.status;
                if (status === 404) {
                    console.log(warning(`⚠️  ${route.name}: Rota não encontrada (404)`));
                } else if (status === 401) {
                    console.log(error(`❌ ${route.name}: Não autorizado (401)`));
                } else if (status === 500) {
                    console.log(error(`❌ ${route.name}: Erro interno (500)`));
                } else {
                    console.log(error(`❌ ${route.name}: Erro ${status || 'desconhecido'}`));
                }
                failedTests++;
            }
            await delay(100); // Pequeno delay entre requisições
        }
        
        // 4. TESTE DE FUNCIONALIDADES CRÍTICAS
        console.log(bold('\n📋 4. TESTANDO FUNCIONALIDADES CRÍTICAS'));
        console.log('-'.repeat(40));
        
        // Teste de criação de produto
        totalTests++;
        try {
            const newProduct = await axios.post(`${BASE_URL}/api/products`, {
                name: 'Produto Teste',
                category: 'Teste',
                price: 10.00,
                cost: 5.00,
                stock: 100
            }, authHeaders);
            
            if (newProduct.data.id) {
                console.log(success('✅ Criação de produto: OK'));
                passedTests++;
                
                // Deletar produto de teste
                await axios.delete(`${BASE_URL}/api/products/${newProduct.data.id}`, authHeaders);
            }
        } catch (err) {
            console.log(error('❌ Falha ao criar produto'));
            failedTests++;
        }
        
        // Teste de busca de eventos
        totalTests++;
        try {
            const events = await axios.get(`${BASE_URL}/api/events`, authHeaders);
            if (Array.isArray(events.data)) {
                console.log(success(`✅ Listagem de eventos: OK (${events.data.length} eventos)`));
                passedTests++;
            }
        } catch (err) {
            console.log(error('❌ Falha ao listar eventos'));
            failedTests++;
        }
        
        // Teste de dashboard analytics
        totalTests++;
        try {
            const analytics = await axios.get(`${BASE_URL}/api/dashboard/analytics`, authHeaders);
            if (analytics.data) {
                console.log(success('✅ Dashboard Analytics: OK'));
                passedTests++;
            }
        } catch (err) {
            console.log(warning('⚠️  Dashboard Analytics: Não disponível'));
            failedTests++;
        }
        
        // 5. TESTE DE INTEGRAÇÕES AI
        console.log(bold('\n📋 5. TESTANDO INTEGRAÇÕES AI'));
        console.log('-'.repeat(40));
        
        totalTests++;
        try {
            const aiPrediction = await axios.post(`${BASE_URL}/api/ai/predict-sales`, {
                eventId: '1',
                period: 'next_7_days'
            }, authHeaders);
            
            if (aiPrediction.data) {
                console.log(success('✅ AI Sales Prediction: OK'));
                passedTests++;
            }
        } catch (err) {
            console.log(warning('⚠️  AI Sales Prediction: Não disponível'));
            failedTests++;
        }
        
        // 6. TESTE DE WEBSOCKET
        console.log(bold('\n📋 6. TESTANDO WEBSOCKET'));
        console.log('-'.repeat(40));
        console.log(info('ℹ️  WebSocket: Teste manual necessário'));
        
        // RELATÓRIO FINAL
        console.log(bold('\n' + '='.repeat(50)));
        console.log(bold('📊 RELATÓRIO FINAL'));
        console.log('='.repeat(50));
        
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);
        
        console.log(info(`\n📈 Total de testes: ${totalTests}`));
        console.log(success(`✅ Testes aprovados: ${passedTests}`));
        console.log(error(`❌ Testes falhados: ${failedTests}`));
        console.log(bold(`\n🎯 Taxa de sucesso: ${successRate}%`));
        
        if (successRate >= 80) {
            console.log(success(bold('\n✨ SISTEMA APROVADO PARA PRODUÇÃO!')));
            console.log(success('O sistema está funcionando corretamente e pronto para uso.'));
        } else if (successRate >= 60) {
            console.log(warning(bold('\n⚠️  SISTEMA PARCIALMENTE FUNCIONAL')));
            console.log(warning('Algumas funcionalidades precisam de ajustes.'));
        } else {
            console.log(error(bold('\n❌ SISTEMA PRECISA DE CORREÇÕES')));
            console.log(error('Muitas funcionalidades estão com problemas.'));
        }
        
        // Informações adicionais
        console.log(bold('\n📝 PRÓXIMOS PASSOS:'));
        console.log('1. Acesse o sistema em: http://localhost:3000');
        console.log('2. Documentação da API: http://localhost:3000/api-docs');
        console.log('3. Health Check: http://localhost:3000/health');
        console.log('\n' + '='.repeat(50) + '\n');
        
        return {
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            successRate: parseFloat(successRate)
        };
        
    } catch (error) {
        console.error(error('\n❌ Erro crítico durante validação:'), error.message);
        return null;
    }
}

// Executar validação
if (require.main === module) {
    validateSystem().then(results => {
        if (results && results.successRate >= 60) {
            process.exit(0);
        } else {
            process.exit(1);
        }
    });
}

module.exports = validateSystem;