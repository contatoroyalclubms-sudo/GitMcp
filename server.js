const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
require('dotenv').config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const dashboardRoutes = require('./routes/dashboard');
const clientRoutes = require('./routes/clients');
const teamRoutes = require('./routes/team');
const salesRoutes = require('./routes/sales');
const reportsRoutes = require('./routes/reports');
const inventoryRoutes = require('./routes/inventory');
const pdvRoutes = require('./routes/pdv');
const financeRoutes = require('./routes/finance');
const marketingRoutes = require('./routes/marketing');
const biRoutes = require('./routes/business-intelligence');
const authRoutes = require('./routes/auth');
const configRoutes = require('./routes/config');
const cashlessRoutes = require('./routes/cashless');
const aiRoutes = require('./routes/ai');
const eventsRoutes = require('./routes/events');
const menuRoutes = require('./routes/menu');

const db = require('./config/database');
const cache = require('./config/cache');
const { authenticateToken } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { loggerMiddleware } = require('./middleware/logger');

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined'));
app.use(loggerMiddleware);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Muitas requisições, tente novamente mais tarde'
});

app.use('/api/', limiter);

// Health check endpoints
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        database: 'connected',
        uptime: process.uptime()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);  // Events route doesn't require auth for public listing
app.use('/api/menu', menuRoutes);  // Menu route doesn't require auth for public viewing
app.use('/api/config', authenticateToken, configRoutes);
app.use('/api/cashless', authenticateToken, cashlessRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/clients', authenticateToken, clientRoutes);
app.use('/api/team', authenticateToken, teamRoutes);
app.use('/api/sales', authenticateToken, salesRoutes);
app.use('/api/reports', authenticateToken, reportsRoutes);
app.use('/api/inventory', authenticateToken, inventoryRoutes);
app.use('/api/pdv', authenticateToken, pdvRoutes);
app.use('/api/finance', authenticateToken, financeRoutes);
app.use('/api/marketing', authenticateToken, marketingRoutes);
app.use('/api/bi', authenticateToken, biRoutes);
app.use('/api/business-intelligence', authenticateToken, biRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const connectedClients = new Map();

wss.on('connection', (ws, req) => {
    const clientId = req.headers['x-client-id'] || require('uuid').v4();
    connectedClients.set(clientId, ws);

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            handleWebSocketMessage(clientId, data, ws);
        } catch (error) {
            ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
    });

    ws.on('close', () => {
        connectedClients.delete(clientId);
    });

    ws.send(JSON.stringify({ 
        type: 'connected', 
        clientId, 
        timestamp: new Date() 
    }));
});

async function handleWebSocketMessage(clientId, data, ws) {
    const { type, payload } = data;
    
    switch(type) {
        case 'subscribe_dashboard':
            subscribeToDashboard(clientId, ws);
            break;
        case 'real_time_sales':
            subscribeToRealTimeSales(clientId, ws);
            break;
        case 'inventory_update':
            handleInventoryUpdate(clientId, payload, ws);
            break;
        case 'cashless_transaction':
            handleCashlessTransaction(clientId, payload, ws);
            break;
        default:
            ws.send(JSON.stringify({ error: 'Unknown message type' }));
    }
}

function subscribeToDashboard(clientId, ws) {
    setInterval(() => {
        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
                type: 'dashboard_update',
                data: generateDashboardMetrics()
            }));
        }
    }, 5000);
}

function subscribeToRealTimeSales(clientId, ws) {
    setInterval(() => {
        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
                type: 'sales_update',
                data: generateSalesMetrics()
            }));
        }
    }, 3000);
}

function generateDashboardMetrics() {
    return {
        totalRevenue: Math.floor(Math.random() * 100000) + 50000,
        activeEvents: Math.floor(Math.random() * 10) + 1,
        totalCustomers: Math.floor(Math.random() * 5000) + 1000,
        satisfaction: (Math.random() * 2 + 3).toFixed(1),
        timestamp: new Date()
    };
}

function generateSalesMetrics() {
    return {
        currentSales: Math.floor(Math.random() * 10000) + 1000,
        transactionsPerMinute: Math.floor(Math.random() * 50) + 10,
        averageTicket: Math.floor(Math.random() * 200) + 50,
        topProducts: [
            { name: 'Bebida Premium', sales: Math.floor(Math.random() * 100) + 50 },
            { name: 'Combo VIP', sales: Math.floor(Math.random() * 80) + 30 },
            { name: 'Ingresso Gold', sales: Math.floor(Math.random() * 60) + 20 }
        ],
        timestamp: new Date()
    };
}

async function handleInventoryUpdate(clientId, payload, ws) {
    ws.send(JSON.stringify({
        type: 'inventory_updated',
        success: true,
        data: payload
    }));
}

async function handleCashlessTransaction(clientId, payload, ws) {
    const transactionId = require('uuid').v4();
    ws.send(JSON.stringify({
        type: 'cashless_processed',
        transactionId,
        success: true,
        data: payload
    }));
}

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await db.authenticate();
        console.log('✅ Database connected successfully');
        
        // Sync database (create tables if they don't exist)
        await db.sync({ force: false });
        console.log('✅ Database synchronized');
        
        await cache.connect();
        console.log('✅ Cache system connected');
        
        // Run seeders to create initial data
        const seedDatabase = require('./seeders/run');
        await seedDatabase();
        
        server.listen(PORT, () => {
            console.log(`🚀 MEEP Enterprise System running on port ${PORT}`);
            console.log(`📊 Dashboard: http://localhost:${PORT}`);
            console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
            console.log('\n📧 Login credentials:');
            console.log('   Admin: admin@meep.com / admin123');
            console.log('   Operator: operator@meep.com / operator123\n');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Only start server if this file is run directly
if (require.main === module) {
    startServer();
}

process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
    });
    await db.close();
    await cache.disconnect();
    process.exit(0);
});

module.exports = app;