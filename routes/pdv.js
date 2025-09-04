const express = require('express');
const router = express.Router();

// Mock sales database
let sales = [];
let saleIdCounter = 1;

// GET all sales
router.get('/sales', (req, res) => {
    res.json({ success: true, sales });
});

// GET sale by ID
router.get('/sales/:id', (req, res) => {
    const sale = sales.find(s => s.id == req.params.id);
    if (sale) {
        res.json({ success: true, sale });
    } else {
        res.status(404).json({ error: 'Sale not found' });
    }
});

// POST create sale
router.post('/sales', (req, res) => {
    const newSale = {
        id: saleIdCounter++,
        ...req.body,
        status: 'completed',
        createdAt: new Date()
    };
    sales.push(newSale);
    res.status(201).json({ success: true, sale: newSale });
});

// GET daily report
router.get('/report/daily', (req, res) => {
    const today = new Date().toDateString();
    const todaySales = sales.filter(s => 
        new Date(s.createdAt).toDateString() === today
    );
    const total = todaySales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    
    res.json({
        success: true,
        report: {
            date: today,
            salesCount: todaySales.length,
            totalRevenue: total,
            sales: todaySales
        }
    });
});

// POST process payment
router.post('/payment', (req, res) => {
    res.json({
        success: true,
        payment: {
            id: Date.now(),
            ...req.body,
            status: 'approved',
            processedAt: new Date()
        }
    });
});

module.exports = router;