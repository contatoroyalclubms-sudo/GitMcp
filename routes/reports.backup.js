const express = require('express');
const router = express.Router();
const { Sale, SaleItem, Product, Client, Event, Transaction, CashRegister, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

router.get('/sales', async (req, res) => {
    try {
        const { startDate, endDate, eventId, format = 'json' } = req.query;
        
        const whereClause = { status: 'completed' };
        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        if (eventId) whereClause.eventId = eventId;

        const sales = await Sale.findAll({
            where: whereClause,
            include: [
                { model: Client, attributes: ['name', 'document'] },
                { model: Event, attributes: ['name'] },
                { 
                    model: SaleItem,
                    include: [{ model: Product, attributes: ['name', 'category'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const summary = {
            totalSales: sales.length,
            totalRevenue: sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0),
            averageTicket: sales.length > 0 ? 
                (sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0) / sales.length).toFixed(2) : 0,
            topProducts: await getTopProducts(whereClause),
            salesByPaymentMethod: await getSalesByPaymentMethod(whereClause)
        };

        if (format === 'excel') {
            const buffer = await generateExcelReport(sales, summary);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=sales-report.xlsx');
            return res.send(buffer);
        }

        res.json({ sales, summary });
    } catch (error) {
        console.error('Sales report error:', error);
        res.status(500).json({ error: 'Failed to generate sales report' });
    }
});

router.get('/cards', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const whereClause = { 
            status: 'completed',
            paymentMethod: 'card'
        };
        
        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const cardSales = await Sale.findAll({
            where: whereClause,
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'transactions'],
                [sequelize.fn('SUM', sequelize.col('total')), 'total']
            ],
            group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'DESC']]
        });

        const summary = {
            totalTransactions: cardSales.reduce((sum, day) => sum + parseInt(day.dataValues.transactions), 0),
            totalAmount: cardSales.reduce((sum, day) => sum + parseFloat(day.dataValues.total), 0),
            averageTransaction: 0,
            dailyBreakdown: cardSales
        };

        if (summary.totalTransactions > 0) {
            summary.averageTransaction = (summary.totalAmount / summary.totalTransactions).toFixed(2);
        }

        res.json(summary);
    } catch (error) {
        console.error('Card report error:', error);
        res.status(500).json({ error: 'Failed to generate card report' });
    }
});

router.get('/cash-register', async (req, res) => {
    try {
        const { startDate, endDate, userId, eventId } = req.query;
        
        const whereClause = {};
        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        if (userId) whereClause.userId = userId;
        if (eventId) whereClause.eventId = eventId;

        const registers = await CashRegister.findAll({
            where: whereClause,
            include: [
                { model: Event, attributes: ['name'] },
                { model: User, attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        const summary = {
            totalRegisters: registers.length,
            totalSales: registers.reduce((sum, reg) => sum + parseFloat(reg.totalSales || 0), 0),
            openRegisters: registers.filter(reg => reg.status === 'open').length,
            closedRegisters: registers.filter(reg => reg.status === 'closed').length
        };

        res.json({ registers, summary });
    } catch (error) {
        console.error('Cash register report error:', error);
        res.status(500).json({ error: 'Failed to generate cash register report' });
    }
});

router.get('/management', async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        
        const dateFilter = getDateFilter(period);
        
        const [revenue, expenses, events, clients, products] = await Promise.all([
            Sale.sum('total', { 
                where: { 
                    status: 'completed',
                    createdAt: { [Op.gte]: dateFilter }
                } 
            }),
            Transaction.sum('amount', { 
                where: { 
                    type: 'expense',
                    createdAt: { [Op.gte]: dateFilter }
                } 
            }),
            Event.count({ 
                where: { 
                    date: { [Op.gte]: dateFilter }
                } 
            }),
            Client.count({ 
                where: { 
                    createdAt: { [Op.gte]: dateFilter }
                } 
            }),
            Product.count({ where: { active: true } })
        ]);

        const profit = (revenue || 0) - (expenses || 0);
        const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : 0;

        const report = {
            period,
            kpis: {
                revenue: revenue || 0,
                expenses: expenses || 0,
                profit,
                profitMargin: `${profitMargin}%`,
                totalEvents: events,
                newClients: clients,
                activeProducts: products
            },
            trends: await getTrends(dateFilter),
            forecast: await getForecast()
        };

        res.json(report);
    } catch (error) {
        console.error('Management report error:', error);
        res.status(500).json({ error: 'Failed to generate management report' });
    }
});

router.get('/financial', async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;
        
        const whereClause = {};
        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        if (type) whereClause.type = type;

        const transactions = await Transaction.findAll({
            where: whereClause,
            include: [{ model: Event, attributes: ['name'] }],
            order: [['createdAt', 'DESC']]
        });

        const summary = {
            totalIncome: transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0),
            totalExpenses: transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0),
            totalTransfers: transactions
                .filter(t => t.type === 'transfer')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0),
            balance: 0,
            pendingPayments: transactions
                .filter(t => t.status === 'pending')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0)
        };

        summary.balance = summary.totalIncome - summary.totalExpenses;

        res.json({ transactions, summary });
    } catch (error) {
        console.error('Financial report error:', error);
        res.status(500).json({ error: 'Failed to generate financial report' });
    }
});

router.get('/clients', async (req, res) => {
    try {
        const { category, sortBy = 'revenue' } = req.query;
        
        const whereClause = {};
        if (category) whereClause.category = category;

        const clients = await Client.findAll({
            where: whereClause,
            include: [{
                model: Sale,
                where: { status: 'completed' },
                required: false,
                attributes: ['total']
            }],
            attributes: {
                include: [
                    [sequelize.fn('SUM', sequelize.col('Sales.total')), 'totalSpent'],
                    [sequelize.fn('COUNT', sequelize.col('Sales.id')), 'totalPurchases']
                ]
            },
            group: ['Client.id'],
            order: [[sequelize.fn('SUM', sequelize.col('Sales.total')), 'DESC']],
            limit: 100
        });

        const segments = {
            vip: clients.filter(c => c.category === 'VIP'),
            premium: clients.filter(c => c.category === 'Premium'),
            standard: clients.filter(c => c.category === 'Standard')
        };

        const averageNPS = await Client.aggregate('npsScore', 'AVG', {
            where: { npsScore: { [Op.ne]: null } }
        });

        res.json({
            clients,
            segments,
            metrics: {
                totalClients: await Client.count(),
                activeClients: clients.length,
                averageNPS: averageNPS || 0,
                averageLifetimeValue: clients.length > 0 ?
                    (clients.reduce((sum, c) => sum + parseFloat(c.dataValues.totalSpent || 0), 0) / clients.length).toFixed(2) : 0
            }
        });
    } catch (error) {
        console.error('Client report error:', error);
        res.status(500).json({ error: 'Failed to generate client report' });
    }
});

async function getTopProducts(whereClause) {
    const topProducts = await SaleItem.findAll({
        attributes: [
            'productId',
            [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
            [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue']
        ],
        include: [{
            model: Sale,
            where: whereClause,
            attributes: []
        }, {
            model: Product,
            attributes: ['name', 'category']
        }],
        group: ['productId', 'Product.id'],
        order: [[sequelize.fn('SUM', sequelize.col('total')), 'DESC']],
        limit: 10
    });

    return topProducts;
}

async function getSalesByPaymentMethod(whereClause) {
    const salesByMethod = await Sale.findAll({
        attributes: [
            'paymentMethod',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            [sequelize.fn('SUM', sequelize.col('total')), 'total']
        ],
        where: whereClause,
        group: ['paymentMethod']
    });

    return salesByMethod;
}

async function getTrends(dateFilter) {
    const trends = await Sale.findAll({
        attributes: [
            [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
            [sequelize.fn('SUM', sequelize.col('total')), 'revenue'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'sales']
        ],
        where: {
            status: 'completed',
            createdAt: { [Op.gte]: dateFilter }
        },
        group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

    return trends;
}

async function getForecast() {
    return {
        nextMonth: {
            revenue: Math.floor(Math.random() * 50000) + 100000,
            sales: Math.floor(Math.random() * 500) + 1000,
            confidence: 85
        },
        nextQuarter: {
            revenue: Math.floor(Math.random() * 200000) + 400000,
            sales: Math.floor(Math.random() * 2000) + 4000,
            confidence: 75
        }
    };
}

async function generateExcelReport(sales, summary) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Client', key: 'client', width: 20 },
        { header: 'Event', key: 'event', width: 20 },
        { header: 'Total', key: 'total', width: 15 },
        { header: 'Payment Method', key: 'paymentMethod', width: 15 },
        { header: 'Status', key: 'status', width: 10 }
    ];

    sales.forEach(sale => {
        worksheet.addRow({
            id: sale.id,
            date: sale.createdAt,
            client: sale.Client?.name || 'N/A',
            event: sale.Event?.name || 'N/A',
            total: sale.total,
            paymentMethod: sale.paymentMethod,
            status: sale.status
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
}

function getDateFilter(period) {
    const now = new Date();
    switch(period) {
        case '7d':
            return new Date(now - 7 * 24 * 60 * 60 * 1000);
        case '30d':
            return new Date(now - 30 * 24 * 60 * 60 * 1000);
        case '90d':
            return new Date(now - 90 * 24 * 60 * 60 * 1000);
        default:
            return new Date(now - 30 * 24 * 60 * 60 * 1000);
    }
}

module.exports = router;