const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Initialize transaction
router.post('/transactions/open', async (req, res) => {
    try {
        const { eventId, clientId, posTerminalId } = req.body;
        
        const transaction = {
            id: uuidv4(),
            transactionCode: `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'sale',
            status: 'pending',
            subtotal: 0,
            total: 0,
            cashierId: req.user?.id || 1,
            eventId,
            clientId,
            posTerminalId,
            items: [],
            payments: []
        };
        
        // Store in memory or session (in production, use database)
        global.activeTransactions = global.activeTransactions || {};
        global.activeTransactions[transaction.id] = transaction;
        
        res.json({
            success: true,
            transaction: {
                id: transaction.id,
                code: transaction.transactionCode,
                status: transaction.status
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add item to transaction
router.post('/transactions/:id/items', async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const transaction = global.activeTransactions?.[req.params.id];
        
        if (!transaction || transaction.status !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                error: 'Transaction not found or already closed' 
            });
        }
        
        // Simulate product lookup
        const product = {
            id: productId,
            name: `Product ${productId}`,
            price: Math.random() * 100 + 10
        };
        
        const subtotal = product.price * quantity;
        const item = {
            id: uuidv4(),
            transactionId: transaction.id,
            productId: product.id,
            productName: product.name,
            quantity,
            unitPrice: product.price,
            subtotal,
            total: subtotal
        };
        
        transaction.items.push(item);
        
        // Update transaction totals
        const newSubtotal = transaction.items.reduce((sum, item) => sum + item.total, 0);
        transaction.subtotal = newSubtotal;
        transaction.total = newSubtotal;
        
        res.json({
            success: true,
            item,
            transaction: {
                subtotal: newSubtotal,
                total: newSubtotal
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Remove item from transaction
router.delete('/transactions/:id/items/:itemId', async (req, res) => {
    try {
        const transaction = global.activeTransactions?.[req.params.id];
        
        if (!transaction) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }
        
        const itemIndex = transaction.items.findIndex(i => i.id === req.params.itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, error: 'Item not found' });
        }
        
        transaction.items.splice(itemIndex, 1);
        
        // Update transaction totals
        const newSubtotal = transaction.items.reduce((sum, item) => sum + item.total, 0);
        transaction.subtotal = newSubtotal;
        transaction.total = newSubtotal - (transaction.discount || 0);
        
        res.json({
            success: true,
            transaction: {
                subtotal: newSubtotal,
                total: transaction.total
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Apply discount
router.post('/transactions/:id/discount', async (req, res) => {
    try {
        const { discount, discountType } = req.body;
        const transaction = global.activeTransactions?.[req.params.id];
        
        if (!transaction || transaction.status !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                error: 'Transaction not found or already closed' 
            });
        }
        
        let discountAmount = 0;
        if (discountType === 'percentage') {
            discountAmount = transaction.subtotal * (discount / 100);
        } else {
            discountAmount = discount;
        }
        
        transaction.discount = discountAmount;
        transaction.total = transaction.subtotal - discountAmount;
        
        res.json({
            success: true,
            transaction: {
                discount: discountAmount,
                total: transaction.total
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Process payment
router.post('/transactions/:id/payment', async (req, res) => {
    try {
        const { method, amount, cardNumber, pixKey, voucherCode, authorizationCode } = req.body;
        const transaction = global.activeTransactions?.[req.params.id];
        
        if (!transaction || transaction.status !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                error: 'Transaction not found or already closed' 
            });
        }
        
        // Calculate remaining amount
        const totalPaid = transaction.payments.reduce((sum, p) => sum + p.amount, 0);
        const remaining = transaction.total - totalPaid;
        
        if (amount > remaining) {
            return res.status(400).json({
                success: false,
                error: `Payment exceeds remaining amount. Remaining: R$ ${remaining.toFixed(2)}`
            });
        }
        
        // Create payment record
        const payment = {
            id: uuidv4(),
            transactionId: transaction.id,
            method,
            amount,
            status: 'approved',
            timestamp: new Date()
        };
        
        // Add payment specific data
        if (method === 'cashless') {
            payment.cashlessCardNumber = cardNumber;
        } else if (method === 'pix') {
            payment.pixKey = pixKey;
        } else if (method === 'voucher') {
            payment.voucherCode = voucherCode;
        } else if (method === 'credit' || method === 'debit') {
            payment.authorizationCode = authorizationCode || uuidv4();
            payment.cardLastDigits = cardNumber ? cardNumber.slice(-4) : '****';
        }
        
        transaction.payments.push(payment);
        
        // Check if transaction is fully paid
        const newTotalPaid = totalPaid + amount;
        if (newTotalPaid >= transaction.total) {
            transaction.status = 'completed';
            transaction.paymentMethod = method;
        }
        
        res.json({
            success: true,
            payment,
            transaction: {
                totalPaid: newTotalPaid,
                remaining: transaction.total - newTotalPaid,
                status: transaction.status
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Cancel transaction
router.post('/transactions/:id/cancel', async (req, res) => {
    try {
        const transaction = global.activeTransactions?.[req.params.id];
        
        if (!transaction) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }
        
        transaction.status = 'cancelled';
        
        res.json({
            success: true,
            message: 'Transaction cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get transaction details
router.get('/transactions/:id', async (req, res) => {
    try {
        const transaction = global.activeTransactions?.[req.params.id];
        
        if (!transaction) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }
        
        res.json({
            success: true,
            transaction
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Daily sales report
router.get('/reports/daily', async (req, res) => {
    try {
        const { date, eventId } = req.query;
        const transactions = Object.values(global.activeTransactions || {})
            .filter(t => t.status === 'completed');
        
        const summary = {
            totalSales: transactions.length,
            totalAmount: transactions.reduce((sum, t) => sum + t.total, 0),
            byPaymentMethod: {},
            byHour: {}
        };
        
        transactions.forEach(transaction => {
            // Group by payment method
            transaction.payments.forEach(payment => {
                if (!summary.byPaymentMethod[payment.method]) {
                    summary.byPaymentMethod[payment.method] = {
                        count: 0,
                        total: 0
                    };
                }
                summary.byPaymentMethod[payment.method].count++;
                summary.byPaymentMethod[payment.method].total += payment.amount;
            });
        });
        
        res.json({
            success: true,
            date: date || new Date().toISOString().split('T')[0],
            summary,
            transactions: transactions.slice(0, 10) // Return first 10 transactions
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;