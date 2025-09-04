const express = require('express');
const router = express.Router();

// Mock cashless cards database
let cards = [];
let cardIdCounter = 1;

// GET all cards
router.get('/cards', (req, res) => {
    res.json({ success: true, cards });
});

// GET card by ID
router.get('/cards/:id', (req, res) => {
    const card = cards.find(c => c.id == req.params.id);
    if (card) {
        res.json({ success: true, card });
    } else {
        res.status(404).json({ error: 'Card not found' });
    }
});

// POST create card
router.post('/cards', (req, res) => {
    const newCard = {
        id: cardIdCounter++,
        ...req.body,
        balance: req.body.balance || 0,
        status: 'active',
        createdAt: new Date()
    };
    cards.push(newCard);
    res.status(201).json({ success: true, card: newCard });
});

// POST recharge card
router.post('/recharge', (req, res) => {
    const { cardId, amount } = req.body;
    const card = cards.find(c => c.id == cardId);
    
    if (card) {
        card.balance += amount;
        res.json({
            success: true,
            transaction: {
                id: Date.now(),
                cardId,
                amount,
                newBalance: card.balance,
                type: 'recharge',
                timestamp: new Date()
            }
        });
    } else {
        res.status(404).json({ error: 'Card not found' });
    }
});

// POST make payment
router.post('/payment', (req, res) => {
    const { cardId, amount } = req.body;
    const card = cards.find(c => c.id == cardId);
    
    if (card) {
        if (card.balance >= amount) {
            card.balance -= amount;
            res.json({
                success: true,
                transaction: {
                    id: Date.now(),
                    cardId,
                    amount,
                    newBalance: card.balance,
                    type: 'payment',
                    timestamp: new Date()
                }
            });
        } else {
            res.status(400).json({ error: 'Insufficient balance' });
        }
    } else {
        res.status(404).json({ error: 'Card not found' });
    }
});

// GET card balance
router.get('/balance/:cardNumber', (req, res) => {
    const card = cards.find(c => c.cardNumber === req.params.cardNumber);
    if (card) {
        res.json({ success: true, balance: card.balance });
    } else {
        res.status(404).json({ error: 'Card not found' });
    }
});

module.exports = router;