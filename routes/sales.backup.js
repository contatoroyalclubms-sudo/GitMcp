const express = require('express');
const router = express.Router();
const { Sale, SaleItem, Product, Client, Event } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

router.get('/menus', async (req, res) => {
    try {
        const { category, active = true } = req.query;
        
        const whereClause = { active: active === 'true' };
        if (category) {
            whereClause.category = category;
        }

        const products = await Product.findAll({
            where: whereClause,
            order: [['category', 'ASC'], ['name', 'ASC']]
        });

        const groupedProducts = products.reduce((acc, product) => {
            const cat = product.category || 'Others';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(product);
            return acc;
        }, {});

        res.json(groupedProducts);
    } catch (error) {
        console.error('Get menus error:', error);
        res.status(500).json({ error: 'Failed to get menus' });
    }
});

router.post('/create', async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { clientId, eventId, items, paymentMethod, discount = 0 } = req.body;

        const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const finalTotal = total - discount;

        const sale = await Sale.create({
            clientId,
            eventId,
            userId: req.user.id,
            total: finalTotal,
            discount,
            paymentMethod,
            status: 'pending'
        }, { transaction });

        for (const item of items) {
            await SaleItem.create({
                saleId: sale.id,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.quantity * item.unitPrice
            }, { transaction });

            const product = await Product.findByPk(item.productId, { transaction });
            if (product) {
                product.stock -= item.quantity;
                await product.save({ transaction });
            }
        }

        if (paymentMethod === 'cashless' && clientId) {
            const client = await Client.findByPk(clientId, { transaction });
            if (client) {
                if (parseFloat(client.cashlessBalance) < finalTotal) {
                    throw new Error('Insufficient cashless balance');
                }
                client.cashlessBalance = parseFloat(client.cashlessBalance) - finalTotal;
                await client.save({ transaction });
            }
        }

        sale.status = 'completed';
        await sale.save({ transaction });

        await transaction.commit();

        res.status(201).json({
            message: 'Sale created successfully',
            sale
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Create sale error:', error);
        res.status(500).json({ error: error.message || 'Failed to create sale' });
    }
});

router.get('/list', async (req, res) => {
    try {
        const { page = 1, limit = 20, eventId, status } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (eventId) whereClause.eventId = eventId;
        if (status) whereClause.status = status;

        const { count, rows } = await Sale.findAndCountAll({
            where: whereClause,
            include: [
                { model: Client, attributes: ['name', 'document'] },
                { model: Event, attributes: ['name'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            sales: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        console.error('List sales error:', error);
        res.status(500).json({ error: 'Failed to list sales' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const sale = await Sale.findByPk(req.params.id, {
            include: [
                { model: Client },
                { model: Event },
                { 
                    model: SaleItem,
                    include: [{ model: Product }]
                }
            ]
        });

        if (!sale) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        res.json(sale);
    } catch (error) {
        console.error('Get sale error:', error);
        res.status(500).json({ error: 'Failed to get sale' });
    }
});

router.post('/:id/cancel', async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const sale = await Sale.findByPk(req.params.id, {
            include: [{ model: SaleItem }],
            transaction
        });

        if (!sale) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Sale not found' });
        }

        if (sale.status === 'cancelled') {
            await transaction.rollback();
            return res.status(400).json({ error: 'Sale already cancelled' });
        }

        for (const item of sale.SaleItems) {
            const product = await Product.findByPk(item.productId, { transaction });
            if (product) {
                product.stock += item.quantity;
                await product.save({ transaction });
            }
        }

        if (sale.paymentMethod === 'cashless' && sale.clientId) {
            const client = await Client.findByPk(sale.clientId, { transaction });
            if (client) {
                client.cashlessBalance = parseFloat(client.cashlessBalance) + parseFloat(sale.total);
                await client.save({ transaction });
            }
        }

        sale.status = 'cancelled';
        await sale.save({ transaction });

        await transaction.commit();

        res.json({
            message: 'Sale cancelled successfully',
            sale
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Cancel sale error:', error);
        res.status(500).json({ error: 'Failed to cancel sale' });
    }
});

router.get('/online/solutions', async (req, res) => {
    try {
        const onlineSolutions = {
            ecommerce: {
                enabled: true,
                url: 'https://shop.meep.com',
                products: await Product.count({ where: { active: true } }),
                orders: Math.floor(Math.random() * 100) + 50
            },
            delivery: {
                enabled: true,
                partners: ['iFood', 'Rappi', 'Uber Eats'],
                activeOrders: Math.floor(Math.random() * 20) + 5
            },
            marketplace: {
                enabled: false,
                platforms: ['Mercado Livre', 'Amazon']
            }
        };

        res.json(onlineSolutions);
    } catch (error) {
        console.error('Get online solutions error:', error);
        res.status(500).json({ error: 'Failed to get online solutions' });
    }
});

router.get('/tickets', async (req, res) => {
    try {
        const { eventId } = req.query;
        
        const whereClause = {};
        if (eventId) whereClause.id = eventId;

        const events = await Event.findAll({
            where: whereClause,
            attributes: ['id', 'name', 'date', 'venue', 'capacity'],
            order: [['date', 'ASC']]
        });

        const ticketInfo = await Promise.all(events.map(async (event) => {
            const soldTickets = await Sale.count({
                where: { 
                    eventId: event.id,
                    status: 'completed'
                }
            });

            return {
                ...event.toJSON(),
                soldTickets,
                availableTickets: event.capacity - soldTickets,
                occupancyRate: ((soldTickets / event.capacity) * 100).toFixed(1)
            };
        }));

        res.json(ticketInfo);
    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({ error: 'Failed to get tickets' });
    }
});

module.exports = router;