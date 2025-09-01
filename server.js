// server.js - GitMcp com conexão aos bancos Railway
const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
const PORT = process.env.PORT || 3000; // Backend na porta 3000

// Configurar conexão PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Configurar conexão Redis (opcional)
let redisClient = null;
if (process.env.REDIS_URL) {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL
  });
  
  redisClient.on('error', (err) => console.log('Redis Client Error:', err.message));
  redisClient.connect().catch(err => {
    console.log('Redis connection failed:', err.message);
    redisClient = null;
  });
}

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/', async (req, res) => {
  let pgStatus = 'Not configured';
  let redisStatus = 'Not configured';
  
  // Testar PostgreSQL
  if (process.env.DATABASE_URL) {
    try {
      const pgResult = await pool.query('SELECT NOW()');
      pgStatus = pgResult.rows[0] ? 'Connected' : 'Failed';
    } catch (error) {
      pgStatus = 'Failed: ' + error.message;
    }
  }
  
  // Testar Redis
  if (redisClient) {
    try {
      await redisClient.set('health_check', 'ok');
      const redisResult = await redisClient.get('health_check');
      redisStatus = redisResult === 'ok' ? 'Connected' : 'Failed';
    } catch (error) {
      redisStatus = 'Failed: ' + error.message;
    }
  }
  
  res.json({
    status: 'GitMcp Server Running',
    timestamp: new Date().toISOString(),
    database: {
      postgres: pgStatus,
      redis: redisStatus
    },
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// MCP endpoint básico
app.get('/mcp/status', async (req, res) => {
  res.json({
    name: 'GitMcp Server',
    version: '1.0.0',
    capabilities: ['git_operations', 'repository_management'],
    connected_services: {
      database: !!process.env.DATABASE_URL,
      cache: !!process.env.REDIS_URL
    }
  });
});

// Git operations endpoint placeholder
app.post('/mcp/git/:operation', async (req, res) => {
  const { operation } = req.params;
  
  res.json({
    operation,
    status: 'success',
    message: `Git ${operation} executed successfully`,
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`GitMcp Server running on port ${PORT}`);
  console.log(`PostgreSQL: ${process.env.DATABASE_URL ? 'Configured' : 'Missing'}`);
  console.log(`Redis: ${process.env.REDIS_URL ? 'Configured' : 'Missing'}`);
});