const express = require('express');
const router = express.Router();
const { Transaction, Client, Event } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { authorizeRole } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

router.get('/digital-account', async (req, res) => {
    try {
        const balance = await Transaction.findOne({
            attributes: [
                [sequelize.fn('SUM', sequelize.literal('CASE WHEN type = \'income\' THEN amount ELSE -amount END')), 'balance']
            ],
            where: { status: 'completed' }
        });

        const pendingReceivables = await Transaction.sum('amount', {
            where: { 
                type: 'income',
                status: 'pending'
            }
        });

        const pendingPayables = await Transaction.sum('amount', {
            where: { 
                type: 'expense',
                status: 'pending'
            }
        });

        res.json({
            account: {
                number: '00012345-6',
                agency: '0001',
                bank: 'MEEP Digital Bank',
                holder: req.user.name
            },
            balance: balance?.dataValues?.balance || 0,
            pendingReceivables: pendingReceivables || 0,
            pendingPayables: pendingPayables || 0,
            availableBalance: (balance?.dataValues?.balance || 0) - (pendingPayables || 0)
        });
    } catch (error) {
        console.error('Digital account error:', error);
        res.status(500).json({ error: 'Failed to get digital account' });
    }
});

router.post('/transactions', authorizeRole(['admin', 'manager']), async (req, res) => {
    try {
        const { type, amount, category, description, eventId, dueDate } = req.body;

        const transaction = await Transaction.create({
            type,
            amount,
            category,
            description,
            eventId,
            dueDate,
            status: 'pending'
        });

        res.status(201).json(transaction);
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

router.put('/transactions/:id/pay', authorizeRole(['admin', 'manager']), async (req, res) => {
    try {
        const transaction = await Transaction.findByPk(req.params.id);
        
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        transaction.status = 'completed';
        transaction.paidDate = new Date();
        await transaction.save();

        res.json({
            message: 'Transaction paid',
            transaction
        });
    } catch (error) {
        console.error('Pay transaction error:', error);
        res.status(500).json({ error: 'Failed to pay transaction' });
    }
});

router.post('/swaps', authorizeRole(['admin', 'manager']), async (req, res) => {
    try {
        const { partnerId, itemsOffered, itemsReceived, eventId } = req.body;

        const swap = {
            id: require('uuid').v4(),
            partnerId,
            itemsOffered,
            itemsReceived,
            eventId,
            status: 'pending',
            createdAt: new Date()
        };

        res.status(201).json({
            message: 'Swap created',
            swap
        });
    } catch (error) {
        console.error('Create swap error:', error);
        res.status(500).json({ error: 'Failed to create swap' });
    }
});

router.post('/receivables/anticipate', authorizeRole(['admin', 'manager']), async (req, res) => {
    try {
        const { transactionIds, discountRate = 0.02 } = req.body;

        const transactions = await Transaction.findAll({
            where: {
                id: { [Op.in]: transactionIds },
                type: 'income',
                status: 'pending'
            }
        });

        const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const discountAmount = totalAmount * discountRate;
        const netAmount = totalAmount - discountAmount;

        res.json({
            message: 'Receivables anticipation calculated',
            totalAmount,
            discountRate: `${(discountRate * 100).toFixed(2)}%`,
            discountAmount,
            netAmount,
            transactions: transactions.length
        });
    } catch (error) {
        console.error('Anticipate receivables error:', error);
        res.status(500).json({ error: 'Failed to anticipate receivables' });
    }
});

router.get('/fees', async (req, res) => {
    try {
        const fees = {
            payment: {
                credit: { rate: 0.0299, fixed: 0.39 },
                debit: { rate: 0.0199, fixed: 0.39 },
                pix: { rate: 0.0099, fixed: 0 },
                boleto: { rate: 0, fixed: 3.49 }
            },
            withdrawal: {
                standard: 6.90,
                express: 14.90
            },
            anticipation: {
                rate: 0.0199
            }
        };

        res.json(fees);
    } catch (error) {
        console.error('Get fees error:', error);
        res.status(500).json({ error: 'Failed to get fees' });
    }
});

router.post('/routing', authorizeRole(['admin']), async (req, res) => {
    try {
        const { rules } = req.body;

        res.json({
            message: 'Transaction routing rules updated',
            rules
        });
    } catch (error) {
        console.error('Update routing error:', error);
        res.status(500).json({ error: 'Failed to update routing' });
    }
});

router.get('/bank-accounts', async (req, res) => {
    try {
        const accounts = [
            {
                id: 'acc-001',
                bank: 'Banco do Brasil',
                agency: '1234',
                account: '12345-6',
                type: 'checking',
                balance: 50000
            },
            {
                id: 'acc-002',
                bank: 'Itaú',
                agency: '5678',
                account: '67890-1',
                type: 'savings',
                balance: 25000
            }
        ];

        res.json(accounts);
    } catch (error) {
        console.error('Get bank accounts error:', error);
        res.status(500).json({ error: 'Failed to get bank accounts' });
    }
});

router.post('/payment-link', async (req, res) => {
    try {
        const { amount, description, clientId, expiresIn = 24 } = req.body;

        const link = {
            id: require('uuid').v4(),
            url: `https://pay.meep.com/${require('uuid').v4()}`,
            amount,
            description,
            clientId,
            status: 'active',
            expiresAt: new Date(Date.now() + expiresIn * 60 * 60 * 1000),
            createdAt: new Date()
        };

        res.status(201).json(link);
    } catch (error) {
        console.error('Create payment link error:', error);
        res.status(500).json({ error: 'Failed to create payment link' });
    }
});

router.get('/payment-methods', async (req, res) => {
    try {
        const methods = [
            { id: 'cash', name: 'Cash', enabled: true, icon: 'money' },
            { id: 'credit', name: 'Credit Card', enabled: true, icon: 'credit-card' },
            { id: 'debit', name: 'Debit Card', enabled: true, icon: 'credit-card' },
            { id: 'pix', name: 'PIX', enabled: true, icon: 'qrcode' },
            { id: 'cashless', name: 'Cashless', enabled: true, icon: 'nfc' },
            { id: 'boleto', name: 'Boleto', enabled: false, icon: 'barcode' },
            { id: 'transfer', name: 'Bank Transfer', enabled: false, icon: 'bank' }
        ];

        res.json(methods);
    } catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({ error: 'Failed to get payment methods' });
    }
});

router.post('/invoices', authorizeRole(['admin', 'manager']), async (req, res) => {
    try {
        const { clientId, items, dueDate } = req.body;

        const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        const invoice = {
            id: require('uuid').v4(),
            number: `INV-${Date.now()}`,
            clientId,
            items,
            total,
            dueDate,
            status: 'pending',
            createdAt: new Date()
        };

        res.status(201).json(invoice);
    } catch (error) {
        console.error('Create invoice error:', error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
});

router.post('/split', async (req, res) => {
    try {
        const { transactionId, splits } = req.body;

        const totalPercentage = splits.reduce((sum, split) => sum + split.percentage, 0);
        
        if (totalPercentage !== 100) {
            return res.status(400).json({ error: 'Split percentages must total 100%' });
        }

        res.json({
            message: 'Payment split configured',
            transactionId,
            splits
        });
    } catch (error) {
        console.error('Configure split error:', error);
        res.status(500).json({ error: 'Failed to configure split' });
    }
});

router.post('/refund', authorizeRole(['admin', 'manager']), async (req, res) => {
    try {
        const { transactionId, amount, reason } = req.body;

        const refund = {
            id: require('uuid').v4(),
            transactionId,
            amount,
            reason,
            status: 'processing',
            createdAt: new Date()
        };

        res.json({
            message: 'Refund initiated',
            refund
        });
    } catch (error) {
        console.error('Process refund error:', error);
        res.status(500).json({ error: 'Failed to process refund' });
    }
});

router.get('/operation-map', async (req, res) => {
    try {
        const operationMap = {
            regions: [
                {
                    id: 'region-1',
                    name: 'São Paulo',
                    events: 12,
                    revenue: 450000,
                    coordinates: [-23.5505, -46.6333]
                },
                {
                    id: 'region-2',
                    name: 'Rio de Janeiro',
                    events: 8,
                    revenue: 320000,
                    coordinates: [-22.9068, -43.1729]
                },
                {
                    id: 'region-3',
                    name: 'Belo Horizonte',
                    events: 5,
                    revenue: 180000,
                    coordinates: [-19.9167, -43.9345]
                }
            ],
            totalRevenue: 950000,
            totalEvents: 25,
            activeRegions: 3
        };

        res.json(operationMap);
    } catch (error) {
        console.error('Get operation map error:', error);
        res.status(500).json({ error: 'Failed to get operation map' });
    }
});

module.exports = router;