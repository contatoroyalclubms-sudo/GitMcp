const express = require('express');
const router = express.Router();

// Mock financial data
const financialData = {
    revenues: [],
    expenses: [],
    balance: 50000
};

// GET financial dashboard
router.get('/dashboard', (req, res) => {
    const totalRevenue = financialData.revenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = financialData.expenses.reduce((sum, e) => sum + e.amount, 0);
    
    res.json({
        success: true,
        dashboard: {
            currentBalance: financialData.balance,
            totalRevenue,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses,
            lastUpdate: new Date()
        }
    });
});

// GET revenues
router.get('/revenues', (req, res) => {
    res.json({
        success: true,
        revenues: financialData.revenues,
        total: financialData.revenues.reduce((sum, r) => sum + r.amount, 0)
    });
});

// GET expenses
router.get('/expenses', (req, res) => {
    res.json({
        success: true,
        expenses: financialData.expenses,
        total: financialData.expenses.reduce((sum, e) => sum + e.amount, 0)
    });
});

// POST add revenue
router.post('/revenue', (req, res) => {
    const revenue = {
        id: Date.now(),
        ...req.body,
        timestamp: new Date()
    };
    financialData.revenues.push(revenue);
    financialData.balance += revenue.amount;
    
    res.status(201).json({ success: true, revenue });
});

// POST add expense
router.post('/expense', (req, res) => {
    const expense = {
        id: Date.now(),
        ...req.body,
        timestamp: new Date()
    };
    financialData.expenses.push(expense);
    financialData.balance -= expense.amount;
    
    res.status(201).json({ success: true, expense });
});

// GET cash flow
router.get('/cashflow', (req, res) => {
    res.json({
        success: true,
        cashflow: {
            inflow: financialData.revenues,
            outflow: financialData.expenses,
            netFlow: financialData.balance
        }
    });
});

module.exports = router;