/**
 * MEEP INTEGRATED SYSTEM
 * Sistema Completo de Gestão de Eventos Empresariais
 * Integração de todos os módulos existentes
 * 
 * Versão: 3.0.0 PRODUÇÃO
 * Data: 2025-09-03
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();

// ================== CONFIGURAÇÃO DO SERVIDOR ==================
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// ================== IMPORTAÇÃO DE TODAS AS ROTAS ==================
const routes = {
    auth: require('./routes/auth'),
    ai: require('./routes/ai'),
    businessIntelligence: require('./routes/business-intelligence'),
    cashless: require('./routes/cashless'),
    clients: require('./routes/clients'),
    config: require('./routes/config'),
    dashboard: require('./routes/dashboard'),
    events: require('./routes/events'),
    finance: require('./routes/finance'),
    health: require('./routes/health'),
    inventory: require('./routes/inventory'),
    marketing: require('./routes/marketing'),
    menu: require('./routes/menu'),
    pdv: require('./routes/pdv'),
    reports: require('./routes/reports'),
    sales: require('./routes/sales'),
    team: require('./routes/team')
};

// ================== CONFIGURAÇÃO E MIDDLEWARE ==================
const db = require('./config/database');
const cache = require('./config/cache');
const { authenticateToken } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { loggerMiddleware } = require('./middleware/logger');
const logger = require('./config/logger');

// ================== AI ENGINE (MOCK VERSION) ==================
const aiEngine = require('./ai-core/meep-ai-engine');

// ================== CONFIGURAÇÕES DE SEGURANÇA ==================
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined'));
app.use(loggerMiddleware);

// ================== RATE LIMITING ==================
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,
    message: 'Muitas requisições, tente novamente mais tarde'
});

app.use('/api/', limiter);

// ================== SISTEMA DE MÉTRICAS ==================
const systemMetrics = {
    startTime: new Date(),
    totalRequests: 0,
    activeConnections: 0,
    totalEvents: 0,
    totalSales: 0,
    systemHealth: 'healthy'
};

// Middleware para contagem de requisições
app.use((req, res, next) => {
    systemMetrics.totalRequests++;
    next();
});

// ================== ROTAS PÚBLICAS ==================

// Health check principal
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: systemMetrics.systemHealth,
        uptime: Math.floor((new Date() - systemMetrics.startTime) / 1000),
        version: '3.0.0',
        modules: Object.keys(routes).length,
        metrics: {
            requests: systemMetrics.totalRequests,
            connections: systemMetrics.activeConnections
        }
    });
});

// Status do sistema
app.get('/api/status', (req, res) => {
    res.json({
        system: 'MEEP Enterprise',
        version: '3.0.0',
        environment: process.env.NODE_ENV || 'production',
        modules: {
            total: Object.keys(routes).length,
            list: Object.keys(routes)
        },
        database: db.config.dialect,
        cache: cache ? 'redis' : 'memory',
        ai: aiEngine ? 'active' : 'inactive',
        uptime: process.uptime()
    });
});

// ================== ROTAS AUTENTICADAS ==================

// Autenticação (não requer token)
app.use('/api/auth', routes.auth);

// Todas as outras rotas requerem autenticação
app.use('/api/ai', authenticateToken, routes.ai);
app.use('/api/bi', authenticateToken, routes.businessIntelligence);
app.use('/api/cashless', authenticateToken, routes.cashless);
app.use('/api/clients', authenticateToken, routes.clients);
app.use('/api/config', authenticateToken, routes.config);
app.use('/api/dashboard', authenticateToken, routes.dashboard);
app.use('/api/events', authenticateToken, routes.events);
app.use('/api/finance', authenticateToken, routes.finance);
app.use('/api/inventory', authenticateToken, routes.inventory);
app.use('/api/marketing', authenticateToken, routes.marketing);
app.use('/api/menu', authenticateToken, routes.menu);
app.use('/api/pdv', authenticateToken, routes.pdv);
app.use('/api/reports', authenticateToken, routes.reports);
app.use('/api/sales', authenticateToken, routes.sales);
app.use('/api/team', authenticateToken, routes.team);

// Health check (sem autenticação para monitoramento)
app.use('/api/health', routes.health);

// ================== ARQUIVOS ESTÁTICOS ==================
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rotas para dashboards específicos
const dashboards = [
    'admin-config',
    'ai-dashboard',
    'business-intelligence-supremo',
    'caixa-supremo',
    'cardapio-supremo',
    'checkin',
    'crm-intelligence-supremo',
    'customer-intelligence-supremo',
    'dashboard-supremo',
    'eventos-supremo',
    'financeiro',
    'inventory-intelligence-supremo',
    'marketing-intelligence-supremo',
    'menu-navigation',
    'operational-intelligence-supremo',
    'pagamentos-supremo',
    'pdv',
    'pdv-intelligence-supremo',
    'relatorios-supremo',
    'supreme-dashboard',
    'test-all'
];

dashboards.forEach(dashboard => {
    app.get(`/${dashboard}`, (req, res) => {
        res.sendFile(path.join(__dirname, 'public', `${dashboard}.html`));
    });
});

// ================== WEBSOCKET MANAGEMENT ==================
const connectedClients = new Map();

wss.on('connection', (ws, req) => {
    const clientId = req.headers['x-client-id'] || require('uuid').v4();
    connectedClients.set(clientId, ws);
    systemMetrics.activeConnections++;
    
    logger.info(`WebSocket client connected: ${clientId}`);
    
    // Enviar mensagem de boas-vindas
    ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to MEEP Enterprise System',
        clientId: clientId,
        timestamp: new Date()
    }));
    
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            await handleWebSocketMessage(clientId, data, ws);
        } catch (error) {
            logger.error('WebSocket message error:', error);
            ws.send(JSON.stringify({ 
                type: 'error',
                error: 'Invalid message format' 
            }));
        }
    });
    
    ws.on('close', () => {
        connectedClients.delete(clientId);
        systemMetrics.activeConnections--;
        logger.info(`WebSocket client disconnected: ${clientId}`);
    });
    
    ws.on('error', (error) => {
        logger.error(`WebSocket error for client ${clientId}:`, error);
    });
});

// Handler para mensagens WebSocket
async function handleWebSocketMessage(clientId, data, ws) {
    const { type, payload } = data;
    
    switch(type) {
        case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date() }));
            break;
            
        case 'subscribe':
            // Subscrever a eventos específicos
            logger.info(`Client ${clientId} subscribed to: ${payload.channel}`);
            break;
            
        case 'realtime_update':
            // Broadcast para outros clientes
            broadcastToClients(data, clientId);
            break;
            
        case 'ai_request':
            // Processar requisição de IA
            const aiResponse = await aiEngine.predict(payload);
            ws.send(JSON.stringify({
                type: 'ai_response',
                data: aiResponse
            }));
            break;
            
        default:
            ws.send(JSON.stringify({ 
                type: 'unknown',
                message: 'Unknown message type' 
            }));
    }
}

// Função para broadcast
function broadcastToClients(data, excludeClientId = null) {
    connectedClients.forEach((ws, clientId) => {
        if (clientId !== excludeClientId && ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify(data));
        }
    });
}

// ================== CRON JOBS ==================

// Limpeza de logs antigas (diariamente às 3h)
cron.schedule('0 3 * * *', async () => {
    logger.info('Starting daily cleanup...');
    // Implementar limpeza de logs antigas
});

// Backup do banco de dados (diariamente às 4h)
cron.schedule('0 4 * * *', async () => {
    logger.info('Starting database backup...');
    // Implementar backup do banco
});

// Atualização de métricas (a cada 5 minutos)
cron.schedule('*/5 * * * *', async () => {
    // Atualizar métricas do sistema
    systemMetrics.systemHealth = await checkSystemHealth();
});

// ================== FUNÇÕES AUXILIARES ==================

async function checkSystemHealth() {
    try {
        // Verificar conexão com banco
        await db.authenticate();
        
        // Verificar memória
        const memUsage = process.memoryUsage();
        const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        
        if (memPercent > 90) return 'critical';
        if (memPercent > 70) return 'warning';
        
        return 'healthy';
    } catch (error) {
        logger.error('Health check error:', error);
        return 'error';
    }
}

// ================== ERROR HANDLING ==================
app.use(errorHandler);

// Captura de rotas não encontradas
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});

// ================== INICIALIZAÇÃO DO SERVIDOR ==================
const PORT = process.env.PORT || 3002;

async function startServer() {
    try {
        // Inicializar banco de dados
        await db.authenticate();
        logger.info('Database connected successfully');
        
        // Sincronizar modelos (apenas em desenvolvimento)
        if (process.env.NODE_ENV === 'development') {
            await db.sync({ alter: true });
            logger.info('Database models synchronized');
        }
        
        // Inicializar AI Engine
        await aiEngine.initialize();
        logger.info('AI Engine initialized');
        
        // Iniciar servidor
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         MEEP ENTERPRISE SYSTEM v3.0.0                    ║
║         Sistema Completo de Gestão de Eventos            ║
║                                                           ║
║         🚀 Server running on port ${PORT}                    ║
║         📊 ${Object.keys(routes).length} modules loaded                          ║
║         🔗 WebSocket server active                        ║
║         🤖 AI Engine: ${aiEngine ? 'Active' : 'Inactive'}                          ║
║         📦 Environment: ${process.env.NODE_ENV || 'production'}                   ║
║                                                           ║
║         Access: http://localhost:${PORT}                     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
            `);
            
            logger.info(`MEEP Enterprise System started on port ${PORT}`);
        });
        
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// ================== GRACEFUL SHUTDOWN ==================
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

async function shutdown() {
    logger.info('Shutting down gracefully...');
    
    // Fechar conexões WebSocket
    connectedClients.forEach((ws) => {
        ws.close(1000, 'Server shutting down');
    });
    
    // Fechar servidor HTTP
    server.close(() => {
        logger.info('HTTP server closed');
    });
    
    // Fechar conexão com banco
    await db.close();
    logger.info('Database connection closed');
    
    process.exit(0);
}

// ================== EXPORT E START ==================
if (require.main === module) {
    startServer();
}

module.exports = { app, server, wss, aiEngine, systemMetrics };