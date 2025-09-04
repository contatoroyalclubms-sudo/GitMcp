const express = require('express');
const router = express.Router();

// Mock sales data
let salesData = [
    { id: 1, product: 'Product A', quantity: 50, revenue: 2500, date: new Date() },
    { id: 2, product: 'Product B', quantity: 30, revenue: 1800, date: new Date() }
];

// GET all sales
router.get('/', (req, res) => {
    res.json({ success: true, sales: salesData });
});

// GET sale by ID
router.get('/:id', (req, res) => {
    const sale = salesData.find(s => s.id == req.params.id);
    if (sale) {
        res.json({ success: true, sale });
    } else {
        res.status(404).json({ error: 'Sale not found' });
    }
});

// GET sales dashboard
router.get('/dashboard', (req, res) => {
    const totalRevenue = salesData.reduce((sum, s) => sum + s.revenue, 0);
    const totalQuantity = salesData.reduce((sum, s) => sum + s.quantity, 0);
    
    res.json({
        success: true,
        dashboard: {
            totalSales: salesData.length,
            totalRevenue,
            totalQuantity,
            averageOrderValue: totalRevenue / salesData.length,
            topProducts: getTopProducts()
        }
    });
});

// GET top products
router.get('/top-products', (req, res) => {
    res.json({
        success: true,
        topProducts: getTopProducts()
    });
});

// Helper function
function getTopProducts() {
    const productSales = {};
    salesData.forEach(sale => {
        if (!productSales[sale.product]) {
            productSales[sale.product] = { quantity: 0, revenue: 0 };
        }
        productSales[sale.product].quantity += sale.quantity;
        productSales[sale.product].revenue += sale.revenue;
    });
    
    return Object.entries(productSales)
        .map(([product, data]) => ({ product, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
}

// POST create sale
router.post('/', (req, res) => {
    const newSale = {
        id: salesData.length + 1,
        ...req.body,
        date: new Date()
    };
    salesData.push(newSale);
    res.status(201).json({ success: true, sale: newSale });
});

module.exports = router;