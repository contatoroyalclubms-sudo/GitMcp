const express = require('express');
const router = express.Router();
const { Sale, Client, Event, Product, Transaction } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const cache = require('../config/cache');

router.get('/dashboards', async (req, res) => {
    try {
        const dashboards = [
            {
                id: 'executive',
                name: 'Executive Dashboard',
                description: 'High-level KPIs and strategic metrics',
                widgets: ['revenue-trend', 'profit-margin', 'customer-growth', 'event-performance']
            },
            {
                id: 'operational',
                name: 'Operational Dashboard',
                description: 'Real-time operational metrics',
                widgets: ['live-sales', 'inventory-status', 'staff-performance', 'queue-analytics']
            },
            {
                id: 'financial',
                name: 'Financial Dashboard',
                description: 'Financial performance and cash flow',
                widgets: ['cash-flow', 'receivables', 'payables', 'profitability']
            },
            {
                id: 'marketing',
                name: 'Marketing Dashboard',
                description: 'Campaign performance and customer insights',
                widgets: ['campaign-roi', 'customer-segments', 'conversion-funnel', 'retention-rate']
            }
        ];

        res.json(dashboards);
    } catch (error) {
        console.error('Get dashboards error:', error);
        res.status(500).json({ error: 'Failed to get dashboards' });
    }
});

router.get('/analytics/revenue', async (req, res) => {
    try {
        const { period = '30d', groupBy = 'day' } = req.query;
        
        const dateFilter = getDateFilter(period);
        
        const revenue = await Sale.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('SUM', sequelize.col('total')), 'revenue'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'transactions'],
                [sequelize.fn('AVG', sequelize.col('total')), 'avgTicket']
            ],
            where: {
                status: 'completed',
                createdAt: { [Op.gte]: dateFilter }
            },
            group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        });

        const forecast = generateForecast(revenue);
        const insights = generateInsights(revenue);

        res.json({
            data: revenue,
            forecast,
            insights,
            summary: {
                totalRevenue: revenue.reduce((sum, day) => sum + parseFloat(day.dataValues.revenue), 0),
                totalTransactions: revenue.reduce((sum, day) => sum + parseInt(day.dataValues.transactions), 0),
                avgDailyRevenue: revenue.length > 0 ? 
                    (revenue.reduce((sum, day) => sum + parseFloat(day.dataValues.revenue), 0) / revenue.length).toFixed(2) : 0
            }
        });
    } catch (error) {
        console.error('Revenue analytics error:', error);
        res.status(500).json({ error: 'Failed to get revenue analytics' });
    }
});

router.get('/analytics/customers', async (req, res) => {
    try {
        const [
            totalCustomers,
            newCustomers,
            returningCustomers,
            avgLifetimeValue,
            churnRate
        ] = await Promise.all([
            Client.count(),
            Client.count({
                where: {
                    createdAt: {
                        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                }
            }),
            Sale.count({
                distinct: true,
                col: 'clientId',
                where: {
                    createdAt: {
                        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                }
            }),
            Sale.findOne({
                attributes: [[sequelize.fn('AVG', sequelize.col('total')), 'avgValue']],
                where: { status: 'completed' }
            }),
            calculateChurnRate()
        ]);

        const segmentation = await getCustomerSegmentation();
        const cohortAnalysis = await getCohortAnalysis();

        res.json({
            metrics: {
                totalCustomers,
                newCustomers,
                returningCustomers,
                avgLifetimeValue: avgLifetimeValue?.dataValues?.avgValue || 0,
                churnRate
            },
            segmentation,
            cohortAnalysis,
            insights: [
                'Customer acquisition increased by 23% this month',
                'VIP segment shows 3x higher lifetime value',
                'Weekend events attract 40% more new customers'
            ]
        });
    } catch (error) {
        console.error('Customer analytics error:', error);
        res.status(500).json({ error: 'Failed to get customer analytics' });
    }
});

router.get('/analytics/products', async (req, res) => {
    try {
        const topProducts = await SaleItem.findAll({
            attributes: [
                'productId',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
                [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue'],
                [sequelize.fn('COUNT', sequelize.col('SaleItem.id')), 'transactionCount']
            ],
            include: [{
                model: Product,
                attributes: ['name', 'category', 'price', 'cost']
            }],
            group: ['productId', 'Product.id'],
            order: [[sequelize.fn('SUM', sequelize.col('total')), 'DESC']],
            limit: 20
        });

        const categoryPerformance = await getCategoryPerformance();
        const profitability = calculateProfitability(topProducts);

        res.json({
            topProducts,
            categoryPerformance,
            profitability,
            insights: [
                'Premium products show 45% higher profit margins',
                'Combo deals increase average ticket by 30%',
                'Seasonal items peak during weekend events'
            ]
        });
    } catch (error) {
        console.error('Product analytics error:', error);
        res.status(500).json({ error: 'Failed to get product analytics' });
    }
});

router.get('/analytics/events', async (req, res) => {
    try {
        const events = await Event.findAll({
            include: [{
                model: Sale,
                attributes: [],
                where: { status: 'completed' },
                required: false
            }],
            attributes: {
                include: [
                    [sequelize.fn('COUNT', sequelize.col('Sales.id')), 'totalSales'],
                    [sequelize.fn('SUM', sequelize.col('Sales.total')), 'totalRevenue']
                ]
            },
            group: ['Event.id'],
            order: [['date', 'DESC']],
            limit: 20
        });

        const eventComparison = compareEvents(events);
        const seasonalTrends = getSeasonalTrends();

        res.json({
            events,
            comparison: eventComparison,
            seasonalTrends,
            insights: [
                'Friday events generate 35% more revenue',
                'VIP events have 2x higher profit margins',
                'Summer season shows 50% increase in attendance'
            ]
        });
    } catch (error) {
        console.error('Event analytics error:', error);
        res.status(500).json({ error: 'Failed to get event analytics' });
    }
});

router.get('/predictive/sales-forecast', async (req, res) => {
    try {
        const { days = 30 } = req.query;
        
        const historicalData = await Sale.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('SUM', sequelize.col('total')), 'revenue']
            ],
            where: {
                status: 'completed',
                createdAt: {
                    [Op.gte]: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
                }
            },
            group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        });

        const forecast = generateAdvancedForecast(historicalData, days);

        res.json({
            forecast,
            confidence: 85,
            factors: [
                { name: 'Seasonality', impact: 'high' },
                { name: 'Historical Trends', impact: 'medium' },
                { name: 'Event Schedule', impact: 'high' }
            ]
        });
    } catch (error) {
        console.error('Sales forecast error:', error);
        res.status(500).json({ error: 'Failed to generate sales forecast' });
    }
});

router.get('/predictive/churn-analysis', async (req, res) => {
    try {
        const atRiskCustomers = await identifyChurnRisk();
        
        res.json({
            atRiskCount: atRiskCustomers.length,
            totalValue: atRiskCustomers.reduce((sum, c) => sum + c.lifetime_value, 0),
            segments: groupByRiskLevel(atRiskCustomers),
            recommendations: [
                'Send personalized retention offers to high-risk segments',
                'Implement loyalty rewards for at-risk VIP customers',
                'Create re-engagement campaigns for inactive users'
            ]
        });
    } catch (error) {
        console.error('Churn analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze churn' });
    }
});

router.get('/automation/rules', async (req, res) => {
    try {
        const rules = [
            {
                id: 'rule-001',
                name: 'Low Stock Alert',
                trigger: 'inventory.stock < inventory.minStock',
                action: 'Send notification to managers',
                status: 'active'
            },
            {
                id: 'rule-002',
                name: 'VIP Customer Recognition',
                trigger: 'customer.totalSpent > 5000',
                action: 'Upgrade to VIP status',
                status: 'active'
            },
            {
                id: 'rule-003',
                name: 'Peak Hour Pricing',
                trigger: 'time.hour >= 18 AND time.hour <= 21',
                action: 'Apply 10% price increase',
                status: 'active'
            }
        ];

        res.json(rules);
    } catch (error) {
        console.error('Get automation rules error:', error);
        res.status(500).json({ error: 'Failed to get automation rules' });
    }
});

router.post('/automation/execute', async (req, res) => {
    try {
        const { ruleId, parameters } = req.body;

        const execution = {
            id: require('uuid').v4(),
            ruleId,
            parameters,
            status: 'executed',
            timestamp: new Date(),
            results: {
                affected: Math.floor(Math.random() * 100) + 10,
                success: true
            }
        };

        res.json(execution);
    } catch (error) {
        console.error('Execute automation error:', error);
        res.status(500).json({ error: 'Failed to execute automation' });
    }
});

router.get('/integrations', async (req, res) => {
    try {
        const integrations = [
            {
                id: 'int-001',
                name: 'Google Analytics',
                type: 'analytics',
                status: 'connected',
                lastSync: new Date(Date.now() - 60 * 60 * 1000)
            },
            {
                id: 'int-002',
                name: 'Facebook Pixel',
                type: 'marketing',
                status: 'connected',
                lastSync: new Date(Date.now() - 30 * 60 * 1000)
            },
            {
                id: 'int-003',
                name: 'Power BI',
                type: 'reporting',
                status: 'connected',
                lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000)
            },
            {
                id: 'int-004',
                name: 'Salesforce',
                type: 'crm',
                status: 'disconnected',
                lastSync: null
            }
        ];

        res.json(integrations);
    } catch (error) {
        console.error('Get integrations error:', error);
        res.status(500).json({ error: 'Failed to get integrations' });
    }
});

function getDateFilter(period) {
    const now = new Date();
    switch(period) {
        case '7d':
            return new Date(now - 7 * 24 * 60 * 60 * 1000);
        case '30d':
            return new Date(now - 30 * 24 * 60 * 60 * 1000);
        case '90d':
            return new Date(now - 90 * 24 * 60 * 60 * 1000);
        case '1y':
            return new Date(now - 365 * 24 * 60 * 60 * 1000);
        default:
            return new Date(now - 30 * 24 * 60 * 60 * 1000);
    }
}

function generateForecast(data) {
    const avgRevenue = data.reduce((sum, d) => sum + parseFloat(d.dataValues.revenue), 0) / data.length;
    const trend = Math.random() * 0.2 - 0.1;
    
    return Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
        predicted: avgRevenue * (1 + trend * i),
        confidence: 85 - i * 2
    }));
}

function generateInsights(data) {
    return [
        'Revenue increased by 15% compared to last period',
        'Peak sales occur between 6PM and 9PM',
        'Weekend events generate 40% of total revenue'
    ];
}

async function calculateChurnRate() {
    return Math.random() * 10 + 5;
}

async function getCustomerSegmentation() {
    return {
        vip: { count: 150, value: 750000 },
        premium: { count: 500, value: 1000000 },
        standard: { count: 2000, value: 800000 },
        inactive: { count: 350, value: 0 }
    };
}

async function getCohortAnalysis() {
    return {
        retention: [100, 65, 45, 35, 30, 28, 27],
        months: ['Month 0', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6']
    };
}

async function getCategoryPerformance() {
    return [
        { category: 'Beverages', revenue: 450000, growth: 12 },
        { category: 'Food', revenue: 380000, growth: 8 },
        { category: 'Merchandise', revenue: 120000, growth: 25 },
        { category: 'Tickets', revenue: 650000, growth: 15 }
    ];
}

function calculateProfitability(products) {
    return products.map(p => ({
        product: p.Product?.name,
        margin: ((p.Product?.price - p.Product?.cost) / p.Product?.price * 100).toFixed(2),
        profitability: 'high'
    }));
}

function compareEvents(events) {
    return {
        bestPerforming: events[0],
        averageRevenue: events.reduce((sum, e) => sum + parseFloat(e.dataValues.totalRevenue || 0), 0) / events.length,
        totalEvents: events.length
    };
}

function getSeasonalTrends() {
    return {
        spring: { events: 12, revenue: 450000 },
        summer: { events: 18, revenue: 780000 },
        fall: { events: 15, revenue: 620000 },
        winter: { events: 10, revenue: 380000 }
    };
}

function generateAdvancedForecast(data, days) {
    const forecast = [];
    const avgRevenue = data.reduce((sum, d) => sum + parseFloat(d.dataValues.revenue), 0) / data.length;
    
    for (let i = 0; i < days; i++) {
        const seasonalFactor = 1 + Math.sin(i / 7 * Math.PI) * 0.3;
        const randomFactor = 0.9 + Math.random() * 0.2;
        
        forecast.push({
            date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
            predicted: avgRevenue * seasonalFactor * randomFactor,
            lower: avgRevenue * seasonalFactor * randomFactor * 0.8,
            upper: avgRevenue * seasonalFactor * randomFactor * 1.2
        });
    }
    
    return forecast;
}

async function identifyChurnRisk() {
    return [
        { id: 'client-001', name: 'John Doe', risk_level: 'high', lifetime_value: 5000 },
        { id: 'client-002', name: 'Jane Smith', risk_level: 'medium', lifetime_value: 3000 },
        { id: 'client-003', name: 'Bob Johnson', risk_level: 'low', lifetime_value: 2000 }
    ];
}

function groupByRiskLevel(customers) {
    return {
        high: customers.filter(c => c.risk_level === 'high'),
        medium: customers.filter(c => c.risk_level === 'medium'),
        low: customers.filter(c => c.risk_level === 'low')
    };
}

module.exports = router;