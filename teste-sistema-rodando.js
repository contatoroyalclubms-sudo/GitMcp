const axios = require('axios');

async function testSystemComplete() {
    console.log('🚀 TESTE COMPLETO DO SISTEMA PAINEL UNIVERSAL');
    console.log('===============================================');
    
    const baseURL = 'http://localhost:8000';
    const frontendURL = 'http://localhost:5175';
    
    const tests = [
        {
            name: 'Health Check',
            url: `${baseURL}/health`,
            method: 'GET'
        },
        {
            name: 'API Root',
            url: `${baseURL}/`,
            method: 'GET'
        },
        {
            name: 'Documentation',
            url: `${baseURL}/docs`,
            method: 'GET'
        },
        {
            name: 'OpenAPI Schema',
            url: `${baseURL}/openapi.json`,
            method: 'GET'
        },
        {
            name: 'Frontend',
            url: frontendURL,
            method: 'GET'
        }
    ];
    
    for (const test of tests) {
        try {
            console.log(`\n🧪 Testando: ${test.name}`);
            console.log(`📡 URL: ${test.url}`);
            
            const response = await axios({
                method: test.method,
                url: test.url,
                timeout: 5000,
                validateStatus: function (status) {
                    return status < 500; // Aceita qualquer status < 500
                }
            });
            
            console.log(`✅ Status: ${response.status}`);
            console.log(`📊 Content-Type: ${response.headers['content-type']}`);
            
            if (response.data && typeof response.data === 'object') {
                console.log(`📋 Data: ${JSON.stringify(response.data, null, 2)}`);
            } else if (response.data && typeof response.data === 'string') {
                const preview = response.data.substring(0, 100);
                console.log(`📄 Preview: ${preview}...`);
            }
            
        } catch (error) {
            console.log(`❌ ERRO: ${error.message}`);
            if (error.response) {
                console.log(`📊 Status: ${error.response.status}`);
                console.log(`📋 Data: ${error.response.data}`);
            }
        }
    }
    
    console.log('\n🎯 TESTE CONCLUÍDO!');
}

testSystemComplete().catch(console.error);
