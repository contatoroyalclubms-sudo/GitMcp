const axios = require('axios');

async function testeRapido() {
    console.log('🔍 TESTE RÁPIDO - VERIFICANDO SE ESTÁ FUNCIONANDO');
    console.log('=================================================');
    
    const testes = [
        { nome: 'Backend Health', url: 'http://localhost:8000/health' },
        { nome: 'Backend Root', url: 'http://localhost:8000/' },
        { nome: 'Frontend 5173', url: 'http://localhost:5173' },
        { nome: 'Frontend 5174', url: 'http://localhost:5174' }
    ];
    
    for (const teste of testes) {
        try {
            console.log(`\n🧪 Testando: ${teste.nome}`);
            const response = await axios.get(teste.url, { timeout: 3000 });
            console.log(`✅ Status: ${response.status} - FUNCIONANDO!`);
        } catch (error) {
            console.log(`❌ ERRO: ${error.message}`);
        }
    }
    
    console.log('\n🎯 TESTE CONCLUÍDO!');
}

testeRapido().catch(console.error);
