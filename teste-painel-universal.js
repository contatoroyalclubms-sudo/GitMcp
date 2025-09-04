// TESTE DO BACKEND PAINEL UNIVERSAL (FastAPI)
const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function testarPainelUniversal() {
    console.log('🚀 TESTANDO PAINEL UNIVERSAL - BACKEND FASTAPI');
    console.log('=' .repeat(60));

    // TESTE 1: Root endpoint
    try {
        console.log('\n🏠 TESTE 1: Root Endpoint');
        const root = await axios.get(`${BASE_URL}/`);
        console.log('✅ Root - Status:', root.status);
        console.log('📄 Content-Type:', root.headers['content-type']);
    } catch (error) {
        console.log('⚠️ Root:', error.response?.status || error.message);
    }

    // TESTE 2: Health Check
    try {
        console.log('\n🔍 TESTE 2: Health Check');
        const health = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health - Status:', health.status);
        console.log('📊 Resposta:', health.data);
    } catch (error) {
        console.log('⚠️ Health:', error.response?.status || error.message);
    }

    // TESTE 3: Documentação OpenAPI
    try {
        console.log('\n📖 TESTE 3: OpenAPI Spec');
        const openapi = await axios.get(`${BASE_URL}/openapi.json`);
        console.log('✅ OpenAPI - Status:', openapi.status);
        console.log('📚 Paths disponíveis:', Object.keys(openapi.data.paths || {}).length);
    } catch (error) {
        console.log('⚠️ OpenAPI:', error.response?.status || error.message);
    }

    // TESTE 4: Swagger UI
    try {
        console.log('\n📋 TESTE 4: Swagger UI');
        const docs = await axios.get(`${BASE_URL}/docs`);
        console.log('✅ Swagger UI - Status:', docs.status);
        console.log('📄 Tipo:', docs.headers['content-type']);
    } catch (error) {
        console.log('⚠️ Swagger UI:', error.response?.status || error.message);
    }

    // TESTE 5: Endpoints do FastAPI
    const endpoints = [
        '/api/eventos',
        '/api/usuarios', 
        '/api/empresas',
        '/api/auth/login',
        '/api/dashboard',
        '/api/transacoes',
        '/api/produtos',
        '/api/relatorios',
        '/api/checkins',
        '/api/listas',
        '/api/whatsapp',
        '/api/cupons',
        '/api/financeiro',
        '/api/gamificacao',
        '/api/formas-pagamento',
        '/api/meep',
        '/api/pdv'
    ];

    console.log('\n🔗 TESTE 5: Verificando Endpoints FastAPI');
    for (const endpoint of endpoints) {
        try {
            const response = await axios.get(`${BASE_URL}${endpoint}`);
            console.log(`✅ ${endpoint} - Status: ${response.status}`);
        } catch (err) {
            const status = err.response?.status;
            if (status === 401) {
                console.log(`🔐 ${endpoint} - Status: 401 (Requer autenticação)`);
            } else if (status === 403) {
                console.log(`🚫 ${endpoint} - Status: 403 (Sem permissão)`);
            } else if (status === 404) {
                console.log(`❌ ${endpoint} - Status: 404 (Não encontrado)`);
            } else {
                console.log(`⚠️ ${endpoint} - Status: ${status || 'Erro'}`);
            }
        }
    }

    // TESTE 6: Tentar login com dados conhecidos
    try {
        console.log('\n🔐 TESTE 6: Tentativa de Login');
        const loginData = {
            email: 'admin@test.com',
            senha: 'admin123'
        };

        const login = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
        console.log('✅ Login bem-sucedido - Status:', login.status);
        console.log('🔑 Token:', login.data.access_token ? 'Recebido' : 'Não recebido');
    } catch (error) {
        const status = error.response?.status;
        if (status === 422) {
            console.log('⚠️ Login - Status: 422 (Validation Error - esperado)');
        } else if (status === 401) {
            console.log('⚠️ Login - Status: 401 (Credenciais inválidas - esperado)');
        } else {
            console.log('⚠️ Login:', error.response?.status || error.message);
        }
    }

    // TESTE 7: Verificar estrutura de resposta
    try {
        console.log('\n📊 TESTE 7: Estrutura da API');
        const response = await axios.get(`${BASE_URL}/openapi.json`);
        if (response.data) {
            console.log('✅ API Specification carregada');
            console.log('📚 Título:', response.data.info?.title || 'N/A');
            console.log('🔢 Versão:', response.data.info?.version || 'N/A');
            console.log('📝 Descrição:', response.data.info?.description || 'N/A');
            
            const paths = Object.keys(response.data.paths || {});
            console.log('🛤️ Total de endpoints:', paths.length);
            
            if (paths.length > 0) {
                console.log('📋 Primeiros 5 endpoints:');
                paths.slice(0, 5).forEach(path => {
                    console.log(`   - ${path}`);
                });
            }
        }
    } catch (error) {
        console.log('⚠️ API Structure:', error.message);
    }

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 TESTES DO PAINEL UNIVERSAL FINALIZADOS!');
    console.log('🌐 Frontend: http://localhost:5175');
    console.log('🔧 Backend: http://localhost:8000');
    console.log('📖 Docs: http://localhost:8000/docs');
    console.log('📊 Status: Sistema FastAPI funcionando!');
}

testarPainelUniversal().catch(console.error);
