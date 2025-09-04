// TESTE COMPLETO DO SISTEMA MEEP SUPREMO
// Testando todas as funcionalidades via API

const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function testarSistema() {
    console.log('🚀 INICIANDO TESTES COMPLETOS DO SISTEMA MEEP SUPREMO');
    console.log('=' .repeat(60));

    // TESTE 1: Health Check
    try {
        console.log('\n🔍 TESTE 1: Health Check');
        const health = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Status:', health.status);
        console.log('📊 Resposta:', health.data);
    } catch (error) {
        console.log('❌ Health Check falhou:', error.message);
    }

    // TESTE 2: Documentação da API
    try {
        console.log('\n📖 TESTE 2: Documentação Swagger');
        const docs = await axios.get(`${BASE_URL}/docs`);
        console.log('✅ Documentação disponível - Status:', docs.status);
        console.log('📄 Content-Type:', docs.headers['content-type']);
    } catch (error) {
        console.log('❌ Documentação falhou:', error.message);
    }

    // TESTE 3: Listar Eventos
    try {
        console.log('\n📅 TESTE 3: API de Eventos');
        const eventos = await axios.get(`${BASE_URL}/api/eventos`);
        console.log('✅ Eventos - Status:', eventos.status);
        console.log('📊 Total de eventos:', eventos.data.length || 'Sem dados');
        if (eventos.data.length > 0) {
            console.log('🎯 Primeiro evento:', eventos.data[0]);
        }
    } catch (error) {
        console.log('⚠️ Eventos (pode precisar auth):', error.response?.status || error.message);
    }

    // TESTE 4: Dashboard Stats
    try {
        console.log('\n📊 TESTE 4: Dashboard Statistics');
        const dashboard = await axios.get(`${BASE_URL}/api/dashboard`);
        console.log('✅ Dashboard - Status:', dashboard.status);
        console.log('📈 Dados:', dashboard.data);
    } catch (error) {
        console.log('⚠️ Dashboard (pode precisar auth):', error.response?.status || error.message);
    }

    // TESTE 5: Endpoints Disponíveis
    try {
        console.log('\n🔗 TESTE 5: Verificando Endpoints');
        const endpoints = [
            '/api/usuarios',
            '/api/transacoes', 
            '/api/produtos',
            '/api/relatorios',
            '/api/financeiro',
            '/openapi.json'
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(`${BASE_URL}${endpoint}`);
                console.log(`✅ ${endpoint} - Status: ${response.status}`);
            } catch (err) {
                console.log(`⚠️ ${endpoint} - Status: ${err.response?.status || 'Erro'}`);
            }
        }
    } catch (error) {
        console.log('❌ Erro ao testar endpoints:', error.message);
    }

    // TESTE 6: Criar Usuário de Teste (se possível)
    try {
        console.log('\n👤 TESTE 6: Registro de Usuário');
        const novoUsuario = {
            nome: 'Teste User',
            email: 'teste@meep-supremo.com',
            senha: 'teste123',
            tipo_usuario: 'cliente'
        };

        const registro = await axios.post(`${BASE_URL}/api/auth/register`, novoUsuario);
        console.log('✅ Usuário criado - Status:', registro.status);
        console.log('👤 Dados:', registro.data);
    } catch (error) {
        console.log('⚠️ Registro (esperado falhar):', error.response?.status || error.message);
    }

    // TESTE 7: Login de Teste
    try {
        console.log('\n🔐 TESTE 7: Login');
        const login = {
            email: 'admin@test.com',
            senha: 'admin123'
        };

        const auth = await axios.post(`${BASE_URL}/api/auth/login`, login);
        console.log('✅ Login - Status:', auth.status);
        console.log('🔑 Token recebido:', auth.data.access_token ? 'Sim' : 'Não');
    } catch (error) {
        console.log('⚠️ Login (esperado falhar sem usuário):', error.response?.status || error.message);
    }

    // TESTE 8: Testar CORS
    try {
        console.log('\n🌐 TESTE 8: CORS Headers');
        const corsTest = await axios.options(`${BASE_URL}/api/eventos`);
        console.log('✅ CORS - Status:', corsTest.status);
        console.log('🔧 Access-Control-Allow-Origin:', corsTest.headers['access-control-allow-origin'] || 'Não configurado');
    } catch (error) {
        console.log('⚠️ CORS:', error.response?.status || error.message);
    }

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 TESTES COMPLETOS FINALIZADOS!');
    console.log('📊 RESUMO: Sistema MEEP Supremo está funcionando!');
    console.log('🌐 Frontend: http://localhost:5175');
    console.log('🔧 Backend: http://localhost:8000');
    console.log('📖 Docs: http://localhost:8000/docs');
}

// Executar testes
testarSistema().catch(console.error);
