/**
 * TESTE COMPLETO DO SISTEMA MEEP
 * Verifica todos os módulos e endpoints
 */

const axios = require('axios');
const colors = require('colors');

const BASE_URL = 'http://localhost:3000';
let authToken = null;
let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
};

// Função auxiliar para fazer requisições
async function makeRequest(method, path, data = null, useAuth = true) {
    const config = {
        method,
        url: `${BASE_URL}${path}`,
        headers: {}
    };

    if (useAuth && authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (data) {
        config.data = data;
    }

    try {
        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data || error.message,
            status: error.response?.status || 0 
        };
    }
}

// Testa um endpoint
async function testEndpoint(name, method, path, data = null, useAuth = true, expectedStatus = 200) {
    testResults.total++;
    console.log(`\nTestando: ${name}...`);
    
    const result = await makeRequest(method, path, data, useAuth);
    
    if (result.success && result.status === expectedStatus) {
        testResults.passed++;
        console.log(`✅ ${name} - PASSOU`.green);
        return result.data;
    } else if (!result.success && result.status === expectedStatus) {
        testResults.passed++;
        console.log(`✅ ${name} - PASSOU (erro esperado)`.green);
        return result.error;
    } else {
        testResults.failed++;
        testResults.errors.push({
            test: name,
            expected: expectedStatus,
            received: result.status,
            error: result.error
        });
        console.log(`❌ ${name} - FALHOU`.red);
        console.log(`   Esperado: ${expectedStatus}, Recebido: ${result.status}`);
        if (result.error) console.log(`   Erro: ${JSON.stringify(result.error)}`.yellow);
        return null;
    }
}

// INÍCIO DOS TESTES
async function runAllTests() {
    console.log('═══════════════════════════════════════════════════════════'.cyan);
    console.log('         TESTE COMPLETO DO SISTEMA MEEP v3.0.0'.cyan);
    console.log('═══════════════════════════════════════════════════════════'.cyan);

    // ===== 1. TESTES SEM AUTENTICAÇÃO =====
    console.log('\n📋 MÓDULO: Sistema Base'.yellow);
    await testEndpoint('Health Check', 'GET', '/api/health', null, false, 200);

    // ===== 2. AUTENTICAÇÃO =====
    console.log('\n📋 MÓDULO: Autenticação'.yellow);
    
    // Registrar usuário admin
    const adminUser = {
        name: 'Admin Test',
        email: `admin.${Date.now()}@meep.com`,
        password: 'senha123',
        role: 'admin'
    };
    
    const registered = await testEndpoint(
        'Registrar Admin', 
        'POST', 
        '/api/auth/register', 
        adminUser, 
        false, 
        201
    );

    // Login
    if (registered) {
        const loginData = await testEndpoint(
            'Login Admin', 
            'POST', 
            '/api/auth/login',
            { email: adminUser.email, password: adminUser.password },
            false,
            200
        );
        
        if (loginData && loginData.token) {
            authToken = loginData.token;
            console.log('   Token obtido com sucesso!'.gray);
        }
    }

    // ===== 3. EVENTOS =====
    console.log('\n📋 MÓDULO: Gestão de Eventos'.yellow);
    
    const eventData = {
        name: 'Festival de Teste',
        description: 'Evento para teste do sistema',
        date: '2025-12-31',
        location: 'Centro de Convenções',
        capacity: 5000,
        status: 'active'
    };
    
    const event = await testEndpoint('Criar Evento', 'POST', '/api/events', eventData);
    if (event) {
        await testEndpoint('Listar Eventos', 'GET', '/api/events');
        await testEndpoint('Buscar Evento', 'GET', `/api/events/${event.id || 1}`);
    }

    // ===== 4. CLIENTES =====
    console.log('\n📋 MÓDULO: Gestão de Clientes'.yellow);
    
    const clientData = {
        name: 'Cliente Teste',
        email: `cliente${Date.now()}@teste.com`,
        phone: '11999999999',
        document: '12345678901'
    };
    
    const client = await testEndpoint('Criar Cliente', 'POST', '/api/clients', clientData);
    await testEndpoint('Listar Clientes', 'GET', '/api/clients');

    // ===== 5. PRODUTOS/MENU =====
    console.log('\n📋 MÓDULO: Menu/Produtos'.yellow);
    
    const productData = {
        name: 'Produto Teste',
        description: 'Descrição do produto',
        price: 29.90,
        category: 'Bebidas',
        stock: 100,
        active: true
    };
    
    const product = await testEndpoint('Criar Produto', 'POST', '/api/menu', productData);
    await testEndpoint('Listar Menu', 'GET', '/api/menu');

    // ===== 6. PDV (Ponto de Venda) =====
    console.log('\n📋 MÓDULO: PDV - Ponto de Venda'.yellow);
    
    const saleData = {
        items: [
            { productId: 1, quantity: 2, price: 29.90 }
        ],
        total: 59.80,
        paymentMethod: 'cash',
        clientId: client?.id || 1
    };
    
    const sale = await testEndpoint('Criar Venda', 'POST', '/api/pdv/sales', saleData);
    await testEndpoint('Listar Vendas PDV', 'GET', '/api/pdv/sales');

    // ===== 7. CASHLESS =====
    console.log('\n📋 MÓDULO: Sistema Cashless'.yellow);
    
    const cardData = {
        cardNumber: `CARD${Date.now()}`,
        balance: 100.00,
        clientId: client?.id || 1,
        status: 'active'
    };
    
    const card = await testEndpoint('Criar Cartão Cashless', 'POST', '/api/cashless/cards', cardData);
    await testEndpoint('Listar Cartões', 'GET', '/api/cashless/cards');
    
    if (card) {
        const rechargeData = {
            cardId: card.id || 1,
            amount: 50.00,
            paymentMethod: 'credit_card'
        };
        await testEndpoint('Recarregar Cartão', 'POST', '/api/cashless/recharge', rechargeData);
    }

    // ===== 8. INVENTÁRIO =====
    console.log('\n📋 MÓDULO: Inventário'.yellow);
    
    await testEndpoint('Listar Inventário', 'GET', '/api/inventory');
    
    const inventoryData = {
        productId: product?.id || 1,
        quantity: 50,
        type: 'entrada',
        reason: 'Reposição de estoque'
    };
    
    await testEndpoint('Movimentação de Estoque', 'POST', '/api/inventory/movement', inventoryData);

    // ===== 9. FINANÇAS =====
    console.log('\n📋 MÓDULO: Finanças'.yellow);
    
    await testEndpoint('Dashboard Financeiro', 'GET', '/api/finance/dashboard');
    await testEndpoint('Relatório de Receitas', 'GET', '/api/finance/revenues');
    await testEndpoint('Relatório de Despesas', 'GET', '/api/finance/expenses');

    // ===== 10. EQUIPE =====
    console.log('\n📋 MÓDULO: Gestão de Equipe'.yellow);
    
    const teamMemberData = {
        name: 'Funcionário Teste',
        email: `func${Date.now()}@meep.com`,
        role: 'vendedor',
        department: 'Vendas'
    };
    
    await testEndpoint('Adicionar Membro', 'POST', '/api/team/members', teamMemberData);
    await testEndpoint('Listar Equipe', 'GET', '/api/team');

    // ===== 11. MARKETING =====
    console.log('\n📋 MÓDULO: Marketing'.yellow);
    
    const campaignData = {
        name: 'Campanha de Teste',
        description: 'Teste de campanha',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        budget: 5000.00,
        status: 'active'
    };
    
    await testEndpoint('Criar Campanha', 'POST', '/api/marketing/campaigns', campaignData);
    await testEndpoint('Listar Campanhas', 'GET', '/api/marketing/campaigns');

    // ===== 12. RELATÓRIOS =====
    console.log('\n📋 MÓDULO: Relatórios'.yellow);
    
    await testEndpoint('Relatório de Vendas', 'GET', '/api/reports/sales');
    await testEndpoint('Relatório de Eventos', 'GET', '/api/reports/events');
    await testEndpoint('Relatório de Clientes', 'GET', '/api/reports/clients');
    await testEndpoint('Relatório Financeiro', 'GET', '/api/reports/financial');

    // ===== 13. DASHBOARD =====
    console.log('\n📋 MÓDULO: Dashboard'.yellow);
    
    await testEndpoint('Dashboard Stats', 'GET', '/api/dashboard/stats');
    await testEndpoint('Dashboard Metrics', 'GET', '/api/dashboard/metrics');
    await testEndpoint('Dashboard KPIs', 'GET', '/api/dashboard/kpis');

    // ===== 14. IA/AI =====
    console.log('\n📋 MÓDULO: Inteligência Artificial'.yellow);
    
    await testEndpoint('AI Status', 'GET', '/api/ai/status');
    
    const predictionData = {
        type: 'sales',
        period: 7,
        productId: 1
    };
    
    await testEndpoint('Previsão de Vendas', 'POST', '/api/ai/predict/sales', predictionData);
    
    const analysisData = {
        customerId: client?.id || 1,
        period: 30
    };
    
    await testEndpoint('Análise de Cliente', 'POST', '/api/ai/analyze/customer', analysisData);

    // ===== 15. BUSINESS INTELLIGENCE =====
    console.log('\n📋 MÓDULO: Business Intelligence'.yellow);
    
    await testEndpoint('BI Dashboard', 'GET', '/api/business-intelligence/dashboard');
    await testEndpoint('BI Analytics', 'GET', '/api/business-intelligence/analytics');
    await testEndpoint('BI Insights', 'GET', '/api/business-intelligence/insights');
    
    const forecastData = {
        metric: 'revenue',
        period: 30
    };
    
    await testEndpoint('BI Forecast', 'POST', '/api/business-intelligence/forecast', forecastData);

    // ===== 16. VENDAS =====
    console.log('\n📋 MÓDULO: Vendas'.yellow);
    
    await testEndpoint('Listar Vendas', 'GET', '/api/sales');
    await testEndpoint('Dashboard de Vendas', 'GET', '/api/sales/dashboard');
    await testEndpoint('Top Produtos', 'GET', '/api/sales/top-products');

    // ===== 17. CONFIGURAÇÕES =====
    console.log('\n📋 MÓDULO: Configurações'.yellow);
    
    await testEndpoint('Listar Configurações', 'GET', '/api/config');
    
    const configData = {
        key: 'test_config',
        value: 'test_value',
        description: 'Configuração de teste'
    };
    
    await testEndpoint('Criar Configuração', 'POST', '/api/config', configData);

    // ===== RESULTADOS FINAIS =====
    console.log('\n═══════════════════════════════════════════════════════════'.cyan);
    console.log('                    RESULTADOS FINAIS'.cyan);
    console.log('═══════════════════════════════════════════════════════════'.cyan);
    
    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
    
    console.log(`\n📊 Total de Testes: ${testResults.total}`);
    console.log(`✅ Passou: ${testResults.passed}`.green);
    console.log(`❌ Falhou: ${testResults.failed}`.red);
    console.log(`📈 Taxa de Sucesso: ${successRate}%`);
    
    if (testResults.errors.length > 0) {
        console.log('\n❌ ERROS ENCONTRADOS:'.red);
        testResults.errors.forEach((error, index) => {
            console.log(`\n${index + 1}. ${error.test}:`);
            console.log(`   Status esperado: ${error.expected}, Recebido: ${error.received}`);
            if (error.error) {
                console.log(`   Erro: ${JSON.stringify(error.error)}`.gray);
            }
        });
    }
    
    if (successRate >= 80) {
        console.log('\n✅ SISTEMA APROVADO PARA PRODUÇÃO!'.green.bold);
    } else if (successRate >= 60) {
        console.log('\n⚠️ SISTEMA PARCIALMENTE FUNCIONAL - CORREÇÕES NECESSÁRIAS'.yellow.bold);
    } else {
        console.log('\n❌ SISTEMA COM PROBLEMAS CRÍTICOS - REVISÃO URGENTE'.red.bold);
    }
    
    console.log('\n═══════════════════════════════════════════════════════════'.cyan);
    
    // Salvar relatório
    const fs = require('fs');
    const report = {
        timestamp: new Date().toISOString(),
        results: testResults,
        successRate: successRate + '%'
    };
    
    fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Relatório salvo em: test-report.json');
}

// Executar testes
runAllTests().catch(error => {
    console.error('\n❌ ERRO FATAL NOS TESTES:'.red, error);
    process.exit(1);
});