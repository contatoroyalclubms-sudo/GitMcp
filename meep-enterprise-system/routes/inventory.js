const express = require('express');
const router = express.Router();
const { Product, Inventory, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { authorizeRole } = require('../middleware/auth');

router.get('/products', async (req, res) => {
    try {
        const { page = 1, limit = 20, search, category, lowStock } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { barcode: { [Op.iLike]: `%${search}%` } }
            ];
        }
        if (category) whereClause.category = category;
        if (lowStock === 'true') {
            whereClause[Op.and] = sequelize.literal('stock < "minStock"');
        }

        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['name', 'ASC']]
        });

        res.json({
            products: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        console.error('List products error:', error);
        res.status(500).json({ error: 'Failed to list products' });
    }
});

router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [{
                model: Inventory,
                limit: 10,
                order: [['createdAt', 'DESC']]
            }]
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Failed to get product' });
    }
});

router.post('/products', authorizeRole(['admin', 'manager']), async (req, res) => {
    try {
        const { name, category, price, cost, stock, minStock, barcode } = req.body;

        if (barcode) {
            const existing = await Product.findOne({ where: { barcode } });
            if (existing) {
                return res.status(409).json({ error: 'Product with this barcode already exists' });
            }
        }

        const product = await Product.create({
            name,
            category,
            price,
            cost,
            stock: stock || 0,
            minStock: minStock || 10,
            barcode
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

router.put('/products/:id', authorizeRole(['admin', 'manager']), async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await product.update(req.body);
        res.json(product);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

router.delete('/products/:id', authorizeRole(['admin']), async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await product.destroy();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

router.post('/entry', authorizeRole(['admin', 'manager', 'operator']), async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { productId, quantity, reason } = req.body;

        const product = await Product.findByPk(productId, { transaction });
        if (!product) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Product not found' });
        }

        product.stock += parseInt(quantity);
        await product.save({ transaction });

        const entry = await Inventory.create({
            productId,
            type: 'entry',
            quantity,
            reason: reason || 'Stock entry',
            userId: req.user.id
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: 'Stock entry recorded',
            entry,
            newStock: product.stock
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Stock entry error:', error);
        res.status(500).json({ error: 'Failed to record stock entry' });
    }
});

router.post('/exit', authorizeRole(['admin', 'manager', 'operator']), async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { productId, quantity, reason } = req.body;

        const product = await Product.findByPk(productId, { transaction });
        if (!product) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.stock < quantity) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        product.stock -= parseInt(quantity);
        await product.save({ transaction });

        const exit = await Inventory.create({
            productId,
            type: 'exit',
            quantity,
            reason: reason || 'Stock exit',
            userId: req.user.id
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: 'Stock exit recorded',
            exit,
            newStock: product.stock
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Stock exit error:', error);
        res.status(500).json({ error: 'Failed to record stock exit' });
    }
});

router.post('/adjustment', authorizeRole(['admin', 'manager']), async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { productId, newStock, reason } = req.body;

        const product = await Product.findByPk(productId, { transaction });
        if (!product) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Product not found' });
        }

        const difference = newStock - product.stock;
        product.stock = newStock;
        await product.save({ transaction });

        const adjustment = await Inventory.create({
            productId,
            type: 'adjustment',
            quantity: Math.abs(difference),
            reason: reason || `Stock adjustment: ${difference > 0 ? 'increase' : 'decrease'}`,
            userId: req.user.id
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: 'Stock adjusted',
            adjustment,
            newStock: product.stock
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Stock adjustment error:', error);
        res.status(500).json({ error: 'Failed to adjust stock' });
    }
});

router.get('/position', async (req, res) => {
    try {
        const products = await Product.findAll({
            attributes: ['id', 'name', 'category', 'stock', 'minStock', 'price', 'cost'],
            order: [['category', 'ASC'], ['name', 'ASC']]
        });

        const stockValue = products.reduce((sum, product) => {
            return sum + (product.stock * parseFloat(product.cost || 0));
        }, 0);

        const retailValue = products.reduce((sum, product) => {
            return sum + (product.stock * parseFloat(product.price));
        }, 0);

        const lowStockItems = products.filter(p => p.stock < p.minStock);
        const outOfStock = products.filter(p => p.stock === 0);

        res.json({
            products,
            summary: {
                totalProducts: products.length,
                totalItems: products.reduce((sum, p) => sum + p.stock, 0),
                stockValue,
                retailValue,
                lowStockItems: lowStockItems.length,
                outOfStock: outOfStock.length
            }
        });
    } catch (error) {
        console.error('Stock position error:', error);
        res.status(500).json({ error: 'Failed to get stock position' });
    }
});

router.get('/movements', async (req, res) => {
    try {
        const { page = 1, limit = 50, productId, type, startDate, endDate } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (productId) whereClause.productId = productId;
        if (type) whereClause.type = type;
        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const { count, rows } = await Inventory.findAndCountAll({
            where: whereClause,
            include: [
                { model: Product, attributes: ['name', 'category'] },
                { model: User, attributes: ['name'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            movements: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        console.error('List movements error:', error);
        res.status(500).json({ error: 'Failed to list movements' });
    }
});

router.post('/inventory/start', authorizeRole(['admin', 'manager']), async (req, res) => {
    try {
        const { name, description } = req.body;

        const inventory = {
            id: require('uuid').v4(),
            name,
            description,
            status: 'in_progress',
            startedAt: new Date(),
            startedBy: req.user.id,
            products: await Product.findAll({
                attributes: ['id', 'name', 'barcode', 'stock']
            })
        };

        res.status(201).json(inventory);
    } catch (error) {
        console.error('Start inventory error:', error);
        res.status(500).json({ error: 'Failed to start inventory' });
    }
});

router.post('/inventory/count', authorizeRole(['admin', 'manager', 'operator']), async (req, res) => {
    try {
        const { inventoryId, productId, countedStock } = req.body;

        res.json({
            message: 'Count recorded',
            inventoryId,
            productId,
            countedStock
        });
    } catch (error) {
        console.error('Record count error:', error);
        res.status(500).json({ error: 'Failed to record count' });
    }
});

module.exports = router;