const express = require('express');
const router = express.Router();
const { Event, Sale, Client, Product, Transaction } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const cache = require('../config/cache');

router.get('/metrics', async (req, res) => {
    try {
        const cacheKey = 'dashboard:metrics';
        const cached = await cache.get(cacheKey);
        
        if (cached) {
            return res.json(cached);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const [
            totalRevenue,
            todayRevenue,
            activeEvents,
            totalClients,
            totalSales,
            topProducts
        ] = await Promise.all([
            Sale.sum('total', { where: { status: 'completed' } }),
            Sale.sum('total', { 
                where: { 
                    status: 'completed',
                    createdAt: { [Op.gte]: today }
                } 
            }),
            Event.count({ where: { status: 'active' } }),
            Client.count(),
            Sale.count({ where: { status: 'completed' } }),
            // Simplified top products query
            Product.findAll({
                limit: 5,
                order: [['price', 'DESC']]
            })
        ]);

        const metrics = {
            totalRevenue: totalRevenue || 0,
            todayRevenue: todayRevenue || 0,
            activeEvents,
            totalClients,
            totalSales,
            topProducts,
            averageTicket: totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : 0,
            timestamp: new Date()
        };

        await cache.set(cacheKey, metrics, 300);
        res.json(metrics);
    } catch (error) {
        console.error('Dashboard metrics error:', error);
        res.status(500).json({ error: 'Failed to load dashboard metrics' });
    }
});

router.get('/kpi', async (req, res) => {
    try {
        const { period = '7d' } = req.query;
        
        let dateFilter;
        const now = new Date();
        
        switch(period) {
            case '24h':
                dateFilter = new Date(now - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                dateFilter = new Date(now - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                dateFilter = new Date(now - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                dateFilter = new Date(now - 7 * 24 * 60 * 60 * 1000);
        }

        const kpis = await Sale.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('SUM', sequelize.col('total')), 'revenue'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'sales']
            ],
            where: {
                createdAt: { [Op.gte]: dateFilter },
                status: 'completed'
            },
            group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        });

        res.json(kpis);
    } catch (error) {
        console.error('KPI error:', error);
        res.status(500).json({ error: 'Failed to load KPIs' });
    }
});

router.get('/favorites', async (req, res) => {
    try {
        const favorites = {
            revenue: {
                label: 'Receita Total',
                value: await Sale.sum('total', { where: { status: 'completed' } }) || 0,
                trend: '+12.5%',
                icon: 'money'
            },
            events: {
                label: 'Eventos Ativos',
                value: await Event.count({ where: { status: 'active' } }),
                trend: '+2',
                icon: 'calendar'
            },
            satisfaction: {
                label: 'Satisfação',
                value: '4.8/5',
                trend: '+0.3',
                icon: 'star'
            },
            conversion: {
                label: 'Taxa Conversão',
                value: '68%',
                trend: '+5%',
                icon: 'chart'
            }
        };

        res.json(favorites);
    } catch (error) {
        console.error('Favorites error:', error);
        res.status(500).json({ error: 'Failed to load favorites' });
    }
});

router.get('/cash-flow', async (req, res) => {
    try {
        const { eventId } = req.query;
        
        const whereClause = eventId ? { eventId } : {};
        
        const cashFlow = await Transaction.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: 100
        });

        const summary = {
            income: cashFlow.filter(t => t.type === 'income').reduce((acc, t) => acc + parseFloat(t.amount), 0),
            expense: cashFlow.filter(t => t.type === 'expense').reduce((acc, t) => acc + parseFloat(t.amount), 0),
            balance: 0
        };
        
        summary.balance = summary.income - summary.expense;

        res.json({
            transactions: cashFlow,
            summary
        });
    } catch (error) {
        console.error('Cash flow error:', error);
        res.status(500).json({ error: 'Failed to load cash flow' });
    }
});

router.get('/real-time', async (req, res) => {
    try {
        const realTimeData = {
            currentSales: Math.floor(Math.random() * 50) + 10,
            queueSize: Math.floor(Math.random() * 20),
            averageWaitTime: Math.floor(Math.random() * 10) + 2,
            activeTerminals: Math.floor(Math.random() * 15) + 5,
            timestamp: new Date()
        };

        res.json(realTimeData);
    } catch (error) {
        console.error('Real-time data error:', error);
        res.status(500).json({ error: 'Failed to load real-time data' });
    }
});

module.exports = router;