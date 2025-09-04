/**
 * HEALTH CHECK ROBUSTO PARA PRODUÇÃO
 * Verifica todos os componentes críticos do sistema
 */

const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const cache = require('../config/cache');
const os = require('os');
const { performance } = require('perf_hooks');

// Health check detalhado
router.get('/', async (req, res) => {
    const startTime = performance.now();
    const checks = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {}
    };

    try {
        // 1. Database Check
        const dbStart = performance.now();
        try {
            await sequelize.authenticate();
            checks.checks.database = {
                status: 'healthy',
                responseTime: performance.now() - dbStart,
                dialect: sequelize.getDialect(),
                connection: 'active'
            };
        } catch (error) {
            checks.checks.database = {
                status: 'unhealthy',
                error: error.message,
                responseTime: performance.now() - dbStart
            };
            checks.status = 'degraded';
        }

        // 2. Cache Check
        const cacheStart = performance.now();
        try {
            const testKey = 'health-check-test';
            cache.set(testKey, 'test-value', 1);
            const testValue = cache.get(testKey);
            checks.checks.cache = {
                status: testValue === 'test-value' ? 'healthy' : 'degraded',
                responseTime: performance.now() - cacheStart,
                type: 'in-memory'
            };
        } catch (error) {
            checks.checks.cache = {
                status: 'unhealthy',
                error: error.message,
                responseTime: performance.now() - cacheStart
            };
            checks.status = 'degraded';
        }

        // 3. Memory Check
        const memUsage = process.memoryUsage();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMemPercent = ((totalMem - freeMem) / totalMem * 100).toFixed(2);
        
        checks.checks.memory = {
            status: usedMemPercent < 90 ? 'healthy' : 'warning',
            heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
            heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
            rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)}MB`,
            external: `${(memUsage.external / 1024 / 1024).toFixed(2)}MB`,
            systemUsedPercent: `${usedMemPercent}%`
        };

        if (usedMemPercent > 90) {
            checks.status = 'degraded';
        }

        // 4. CPU Check
        const cpus = os.cpus();
        const avgLoad = os.loadavg();
        checks.checks.cpu = {
            status: avgLoad[0] < cpus.length ? 'healthy' : 'warning',
            cores: cpus.length,
            loadAverage: {
                '1min': avgLoad[0].toFixed(2),
                '5min': avgLoad[1].toFixed(2),
                '15min': avgLoad[2].toFixed(2)
            }
        };

        // 5. Disk Space Check (simplified)
        checks.checks.disk = {
            status: 'healthy',
            note: 'Detailed disk check requires additional libraries'
        };

        // 6. External Services
        checks.checks.services = {
            redis: cache.isConnected ? 'healthy' : 'not-configured',
            websocket: global.wss ? 'healthy' : 'not-configured',
            ai_engine: global.aiEngine ? 'healthy' : 'not-configured'
        };

        // Calculate total response time
        checks.responseTime = `${(performance.now() - startTime).toFixed(2)}ms`;

        // Determine HTTP status code
        let statusCode = 200;
        if (checks.status === 'unhealthy') statusCode = 503;
        if (checks.status === 'degraded') statusCode = 200; // Still return 200 for degraded

        res.status(statusCode).json(checks);

    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Simple health check (for load balancers)
router.get('/live', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Readiness check
router.get('/ready', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.status(200).json({ ready: true });
    } catch (error) {
        res.status(503).json({ ready: false, error: error.message });
    }
});

// Version endpoint
router.get('/version', (req, res) => {
    res.json({
        name: 'GitMcp Enterprise System',
        version: process.env.npm_package_version || '2.0.0',
        environment: process.env.NODE_ENV,
        node: process.version,
        uptime: process.uptime()
    });
});

module.exports = router;