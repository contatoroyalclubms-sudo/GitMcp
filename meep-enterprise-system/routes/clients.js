const express = require('express');
const router = express.Router();
const { Client, Sale } = require('../models');
const { Op } = require('sequelize');
const { authorizeRole } = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, search, category } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { document: { [Op.iLike]: `%${search}%` } }
            ];
        }
        if (category) {
            whereClause.category = category;
        }

        const { count, rows } = await Client.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            clients: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        console.error('List clients error:', error);
        res.status(500).json({ error: 'Failed to list clients' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id, {
            include: [{
                model: Sale,
                limit: 10,
                order: [['createdAt', 'DESC']]
            }]
        });

        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        res.json(client);
    } catch (error) {
        console.error('Get client error:', error);
        res.status(500).json({ error: 'Failed to get client' });
    }
});

router.post('/', authorizeRole(['admin', 'manager']), async (req, res) => {
    try {
        const { name, document, email, phone, category } = req.body;

        if (document) {
            const existing = await Client.findOne({ where: { document } });
            if (existing) {
                return res.status(409).json({ error: 'Client already exists' });
            }
        }

        const client = await Client.create({
            name,
            document,
            email,
            phone,
            category: category || 'Standard'
        });

        res.status(201).json(client);
    } catch (error) {
        console.error('Create client error:', error);
        res.status(500).json({ error: 'Failed to create client' });
    }
});

router.put('/:id', authorizeRole(['admin', 'manager']), async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        await client.update(req.body);
        res.json(client);
    } catch (error) {
        console.error('Update client error:', error);
        res.status(500).json({ error: 'Failed to update client' });
    }
});

router.delete('/:id', authorizeRole(['admin']), async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        await client.destroy();
        res.json({ message: 'Client deleted successfully' });
    } catch (error) {
        console.error('Delete client error:', error);
        res.status(500).json({ error: 'Failed to delete client' });
    }
});

router.post('/:id/cashless/add', async (req, res) => {
    try {
        const { amount } = req.body;
        const client = await Client.findByPk(req.params.id);
        
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        client.cashlessBalance = parseFloat(client.cashlessBalance) + parseFloat(amount);
        await client.save();

        res.json({
            message: 'Balance added successfully',
            newBalance: client.cashlessBalance
        });
    } catch (error) {
        console.error('Add cashless balance error:', error);
        res.status(500).json({ error: 'Failed to add balance' });
    }
});

router.post('/:id/cashless/deduct', async (req, res) => {
    try {
        const { amount } = req.body;
        const client = await Client.findByPk(req.params.id);
        
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        if (parseFloat(client.cashlessBalance) < parseFloat(amount)) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        client.cashlessBalance = parseFloat(client.cashlessBalance) - parseFloat(amount);
        await client.save();

        res.json({
            message: 'Balance deducted successfully',
            newBalance: client.cashlessBalance
        });
    } catch (error) {
        console.error('Deduct cashless balance error:', error);
        res.status(500).json({ error: 'Failed to deduct balance' });
    }
});

router.get('/:id/commands', async (req, res) => {
    try {
        const sales = await Sale.findAll({
            where: { 
                clientId: req.params.id,
                status: { [Op.ne]: 'cancelled' }
            },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json(sales);
    } catch (error) {
        console.error('Get commands error:', error);
        res.status(500).json({ error: 'Failed to get commands' });
    }
});

router.post('/:id/satisfaction', async (req, res) => {
    try {
        const { score, feedback } = req.body;
        const client = await Client.findByPk(req.params.id);
        
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        client.npsScore = score;
        await client.save();

        res.json({
            message: 'Satisfaction recorded successfully',
            npsScore: client.npsScore
        });
    } catch (error) {
        console.error('Record satisfaction error:', error);
        res.status(500).json({ error: 'Failed to record satisfaction' });
    }
});

router.post('/:id/loyalty/add', async (req, res) => {
    try {
        const { points } = req.body;
        const client = await Client.findByPk(req.params.id);
        
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        client.loyaltyPoints = parseInt(client.loyaltyPoints) + parseInt(points);
        await client.save();

        res.json({
            message: 'Loyalty points added',
            totalPoints: client.loyaltyPoints
        });
    } catch (error) {
        console.error('Add loyalty points error:', error);
        res.status(500).json({ error: 'Failed to add loyalty points' });
    }
});

module.exports = router;