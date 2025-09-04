const express = require('express');
const router = express.Router();

// Mock inventory database
let inventory = [
    { id: 1, productId: 1, productName: 'Coca Cola', quantity: 100, minStock: 20 },
    { id: 2, productId: 2, productName: 'Hambúrguer', quantity: 50, minStock: 10 },
    { id: 3, productId: 3, productName: 'Batata Frita', quantity: 80, minStock: 15 }
];

let movements = [];
let movementIdCounter = 1;

// GET all inventory
router.get('/', (req, res) => {
    res.json({ success: true, inventory });
});

// GET inventory by product
router.get('/product/:productId', (req, res) => {
    const item = inventory.find(i => i.productId == req.params.productId);
    if (item) {
        res.json({ success: true, item });
    } else {
        res.status(404).json({ error: 'Product not found in inventory' });
    }
});

// POST inventory movement
router.post('/movement', (req, res) => {
    const { productId, quantity, type, reason } = req.body;
    const item = inventory.find(i => i.productId == productId);
    
    if (item) {
        if (type === 'entrada') {
            item.quantity += quantity;
        } else if (type === 'saida') {
            if (item.quantity >= quantity) {
                item.quantity -= quantity;
            } else {
                return res.status(400).json({ error: 'Insufficient stock' });
            }
        }
        
        const movement = {
            id: movementIdCounter++,
            productId,
            quantity,
            type,
            reason,
            timestamp: new Date()
        };
        movements.push(movement);
        
        res.json({ success: true, movement, newQuantity: item.quantity });
    } else {
        res.status(404).json({ error: 'Product not found in inventory' });
    }
});

// GET low stock items
router.get('/low-stock', (req, res) => {
    const lowStock = inventory.filter(i => i.quantity <= i.minStock);
    res.json({ success: true, items: lowStock });
});

// GET movement history
router.get('/movements', (req, res) => {
    res.json({ success: true, movements });
});

module.exports = router;