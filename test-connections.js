// test-connections.js - Testar conexões com os bancos
const { Pool } = require('pg');
const redis = require('redis');
require('dotenv').config();

console.log('='.repeat(60));
console.log('TESTE DE CONEXÕES - GitMcp');
console.log('='.repeat(60));

// Função para testar PostgreSQL
async function testPostgreSQL() {
  console.log('\n📊 Testando PostgreSQL...');
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL não configurada');
    return false;
  }
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  try {
    const result = await pool.query('SELECT NOW() as time, version() as version');
    console.log('✅ PostgreSQL conectado!');
    console.log('   Hora do servidor:', result.rows[0].time);
    console.log('   Versão:', result.rows[0].version.split(',')[0]);
    await pool.end();
    return true;
  } catch (error) {
    console.log('❌ Erro ao conectar PostgreSQL:', error.message);
    return false;
  }
}

// Função para testar Redis
async function testRedis() {
  console.log('\n💾 Testando Redis...');
  
  if (!process.env.REDIS_URL) {
    console.log('❌ REDIS_URL não configurada');
    return false;
  }
  
  const client = redis.createClient({
    url: process.env.REDIS_URL
  });
  
  try {
    await client.connect();
    await client.set('test_key', 'test_value');
    const value = await client.get('test_key');
    
    if (value === 'test_value') {
      console.log('✅ Redis conectado e funcionando!');
      const info = await client.info('server');
      const version = info.match(/redis_version:([^\r\n]+)/);
      if (version) {
        console.log('   Versão:', version[1]);
      }
    }
    
    await client.disconnect();
    return true;
  } catch (error) {
    console.log('❌ Erro ao conectar Redis:', error.message);
    return false;
  }
}

// Executar testes
async function runTests() {
  console.log('\n🔍 Variáveis de ambiente detectadas:');
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'não definido');
  console.log('   PORT:', process.env.PORT || '3000');
  console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ Não configurada');
  console.log('   REDIS_URL:', process.env.REDIS_URL ? '✅ Configurada' : '❌ Não configurada');
  
  const pgOk = await testPostgreSQL();
  const redisOk = await testRedis();
  
  console.log('\n' + '='.repeat(60));
  console.log('RESULTADO DOS TESTES:');
  console.log('PostgreSQL:', pgOk ? '✅ OK' : '❌ FALHOU');
  console.log('Redis:', redisOk ? '✅ OK' : '❌ FALHOU');
  console.log('='.repeat(60));
  
  if (pgOk && redisOk) {
    console.log('\n🎉 Todos os serviços estão funcionando!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Alguns serviços não estão disponíveis.');
    console.log('Verifique as configurações no Railway.');
    process.exit(1);
  }
}

runTests().catch(console.error);