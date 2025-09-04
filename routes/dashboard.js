const express = require('express');
const router = express.Router();

// GET dashboard stats
router.get('/stats', (req, res) => {
    res.json({
        success: true,
        stats: {
            totalEvents: 15,
            activeEvents: 5,
            totalClients: 1250,
            totalRevenue: 450000,
            totalSales: 3420,
            averageTicket: 131.58,
            timestamp: new Date()
        }
    });
});

// GET dashboard metrics
router.get('/metrics', (req, res) => {
    res.json({
        success: true,
        metrics: {
            salesGrowth: 0.15,
            customerSatisfaction: 4.7,
            operationalEfficiency: 0.92,
            inventoryTurnover: 8.5,
            cashFlowStatus: 'positive',
            timestamp: new Date()
        }
    });
});

// GET dashboard KPIs
router.get('/kpis', (req, res) => {
    res.json({
        success: true,
        kpis: {
            monthlyRecurringRevenue: 120000,
            customerAcquisitionCost: 45,
            customerLifetimeValue: 2500,
            churnRate: 0.05,
            netPromoterScore: 72,
            timestamp: new Date()
        }
    });
});

// GET real-time data
router.get('/realtime', (req, res) => {
    res.json({
        success: true,
        realtime: {
            currentVisitors: Math.floor(50 + Math.random() * 100),
            activeSessions: Math.floor(30 + Math.random() * 50),
            transactionsInProgress: Math.floor(5 + Math.random() * 15),
            queueLength: Math.floor(Math.random() * 20),
            serverLoad: (Math.random() * 100).toFixed(2) + '%',
            timestamp: new Date()
        }
    });
});

module.exports = router;