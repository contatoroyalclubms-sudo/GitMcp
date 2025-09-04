const express = require('express');
const router = express.Router();

// Mock database
let products = [
    { id: 1, name: 'Coca Cola', price: 5.00, category: 'Bebidas', stock: 100, active: true },
    { id: 2, name: 'Hambúrguer', price: 25.00, category: 'Lanches', stock: 50, active: true },
    { id: 3, name: 'Batata Frita', price: 15.00, category: 'Petiscos', stock: 80, active: true }
];

// GET all products
router.get('/', (req, res) => {
    res.json({ success: true, products });
});

// GET product by ID
router.get('/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    if (product) {
        res.json({ success: true, product });
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

// POST create product
router.post('/', (req, res) => {
    const newProduct = {
        id: products.length + 1,
        ...req.body,
        createdAt: new Date()
    };
    products.push(newProduct);
    res.status(201).json({ success: true, product: newProduct });
});

// PUT update product
router.put('/:id', (req, res) => {
    const index = products.findIndex(p => p.id == req.params.id);
    if (index !== -1) {
        products[index] = { ...products[index], ...req.body };
        res.json({ success: true, product: products[index] });
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

// DELETE product
router.delete('/:id', (req, res) => {
    const index = products.findIndex(p => p.id == req.params.id);
    if (index !== -1) {
        products.splice(index, 1);
        res.json({ success: true, message: 'Product deleted' });
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

module.exports = router;