const express = require('express');
const router = express.Router();
const { CashRegister, Sale, Product, Client, SaleItem, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

router.get('/profile', async (req, res) => {
    try {
        const profile = {
            user: {
                id: req.user.id,
                name: req.user.name || 'Operator',
                role: req.user.role || 'operator',
                email: req.user.email
            },
            terminal: {
                id: process.env.TERMINAL_ID || 'TERM-001',
                name: process.env.TERMINAL_NAME || 'Terminal 1',
                location: process.env.TERMINAL_LOCATION || 'Main Floor'
            },
            currentRegister: await CashRegister.findOne({
                where: {
                    userId: req.user.id,
                    status: 'open'
                },
                order: [['createdAt', 'DESC']]
            })
        };

        res.json(profile);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

router.post('/open-register', async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { eventId, openingBalance = 0 } = req.body;

        const existingOpen = await CashRegister.findOne({
            where: {
                userId: req.user.id,
                status: 'open'
            }
        });

        if (existingOpen) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Register already open' });
        }

        const register = await CashRegister.create({
            eventId,
            userId: req.user.id,
            openingBalance,
            status: 'open',
            openedAt: new Date()
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: 'Cash register opened',
            register
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Open register error:', error);
        res.status(500).json({ error: 'Failed to open register' });
    }
});

router.post('/close-register', async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { closingBalance, notes } = req.body;

        const register = await CashRegister.findOne({
            where: {
                userId: req.user.id,
                status: 'open'
            },
            transaction
        });

        if (!register) {
            await transaction.rollback();
            return res.status(404).json({ error: 'No open register found' });
        }

        const totalSales = await Sale.sum('total', {
            where: {
                userId: req.user.id,
                createdAt: {
                    [Op.gte]: register.openedAt
                },
                status: 'completed'
            },
            transaction
        });

        register.closingBalance = closingBalance;
        register.totalSales = totalSales || 0;
        register.status = 'closed';
        register.closedAt = new Date();
        await register.save({ transaction });

        await transaction.commit();

        const expectedBalance = parseFloat(register.openingBalance) + parseFloat(register.totalSales);
        const difference = closingBalance - expectedBalance;

        res.json({
            message: 'Cash register closed',
            register,
            summary: {
                openingBalance: register.openingBalance,
                totalSales: register.totalSales,
                expectedBalance,
                actualBalance: closingBalance,
                difference,
                status: Math.abs(difference) < 1 ? 'balanced' : 'discrepancy'
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Close register error:', error);
        res.status(500).json({ error: 'Failed to close register' });
    }
});

router.post('/quick-sale', async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { items, paymentMethod, clientId } = req.body;

        const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        const sale = await Sale.create({
            clientId,
            userId: req.user.id,
            total,
            paymentMethod,
            status: 'completed'
        }, { transaction });

        for (const item of items) {
            await SaleItem.create({
                saleId: sale.id,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.price,
                total: item.quantity * item.price
            }, { transaction });

            const product = await Product.findByPk(item.productId, { transaction });
            if (product) {
                product.stock -= item.quantity;
                await product.save({ transaction });
            }
        }

        await transaction.commit();

        res.status(201).json({
            message: 'Sale completed',
            sale,
            receipt: {
                saleId: sale.id,
                date: sale.createdAt,
                items,
                total,
                paymentMethod
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Quick sale error:', error);
        res.status(500).json({ error: 'Failed to process sale' });
    }
});

router.get('/printers', async (req, res) => {
    try {
        const printers = [
            {
                id: 'printer-001',
                name: 'Receipt Printer 1',
                type: 'receipt',
                model: 'Epson TM-T88V',
                status: 'online',
                location: 'Counter 1'
            },
            {
                id: 'printer-002',
                name: 'Kitchen Printer',
                type: 'kitchen',
                model: 'Star TSP650II',
                status: 'online',
                location: 'Kitchen'
            },
            {
                id: 'printer-003',
                name: 'Bar Printer',
                type: 'bar',
                model: 'Bixolon SRP-350',
                status: 'online',
                location: 'Bar'
            }
        ];

        res.json(printers);
    } catch (error) {
        console.error('Get printers error:', error);
        res.status(500).json({ error: 'Failed to get printers' });
    }
});

router.post('/print', async (req, res) => {
    try {
        const { printerId, type, data } = req.body;

        res.json({
            message: 'Print job sent',
            jobId: require('uuid').v4(),
            printerId,
            type,
            status: 'queued'
        });
    } catch (error) {
        console.error('Print error:', error);
        res.status(500).json({ error: 'Failed to print' });
    }
});

router.get('/smart-printers', async (req, res) => {
    try {
        const smartPrinters = [
            {
                id: 'smart-001',
                name: 'Smart Receipt Printer',
                features: ['auto-cut', 'qr-code', 'logo-print', 'multi-language'],
                status: 'online',
                templates: ['receipt', 'invoice', 'ticket']
            }
        ];

        res.json(smartPrinters);
    } catch (error) {
        console.error('Get smart printers error:', error);
        res.status(500).json({ error: 'Failed to get smart printers' });
    }
});

router.get('/equipment', async (req, res) => {
    try {
        const equipment = [
            {
                id: 'eq-001',
                type: 'barcode-scanner',
                name: 'Scanner 1',
                model: 'Symbol LS2208',
                status: 'connected'
            },
            {
                id: 'eq-002',
                type: 'card-reader',
                name: 'Card Terminal 1',
                model: 'Ingenico Move 5000',
                status: 'connected'
            },
            {
                id: 'eq-003',
                type: 'cash-drawer',
                name: 'Cash Drawer 1',
                model: 'APG Vasario',
                status: 'connected'
            },
            {
                id: 'eq-004',
                type: 'customer-display',
                name: 'Customer Display 1',
                model: 'Posiflex PD-2800',
                status: 'connected'
            }
        ];

        res.json(equipment);
    } catch (error) {
        console.error('Get equipment error:', error);
        res.status(500).json({ error: 'Failed to get equipment' });
    }
});

router.get('/operators', async (req, res) => {
    try {
        const operators = await User.findAll({
            where: {
                role: { [Op.in]: ['operator', 'manager'] },
                active: true
            },
            attributes: ['id', 'name', 'role'],
            order: [['name', 'ASC']]
        });

        res.json(operators);
    } catch (error) {
        console.error('Get operators error:', error);
        res.status(500).json({ error: 'Failed to get operators' });
    }
});

router.get('/orders', async (req, res) => {
    try {
        const { status = 'pending' } = req.query;

        const orders = await Sale.findAll({
            where: { status },
            include: [
                { model: Client, attributes: ['name'] },
                { 
                    model: SaleItem,
                    include: [{ model: Product, attributes: ['name'] }]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
});

router.post('/orders/:id/prepare', async (req, res) => {
    try {
        const order = await Sale.findByPk(req.params.id);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({
            message: 'Order marked as preparing',
            orderId: req.params.id,
            estimatedTime: '15 minutes'
        });
    } catch (error) {
        console.error('Prepare order error:', error);
        res.status(500).json({ error: 'Failed to prepare order' });
    }
});

router.post('/orders/:id/complete', async (req, res) => {
    try {
        const order = await Sale.findByPk(req.params.id);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.status = 'completed';
        await order.save();

        res.json({
            message: 'Order completed',
            order
        });
    } catch (error) {
        console.error('Complete order error:', error);
        res.status(500).json({ error: 'Failed to complete order' });
    }
});

module.exports = router;