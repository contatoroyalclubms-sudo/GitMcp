const express = require('express');
const router = express.Router();

// Mock configuration storage
let configs = {
    system: {
        name: 'MEEP Enterprise',
        version: '3.0.0',
        environment: process.env.NODE_ENV || 'development'
    },
    features: {
        aiEnabled: true,
        cashlessEnabled: true,
        realtimeEnabled: true
    },
    limits: {
        maxUsers: 10000,
        maxTransactionsPerMinute: 100,
        maxFileSize: 10485760
    }
};

// GET all configurations
router.get('/', (req, res) => {
    res.json({ success: true, configs });
});

// GET configuration by key
router.get('/:category/:key', (req, res) => {
    const { category, key } = req.params;
    if (configs[category] && configs[category][key] !== undefined) {
        res.json({ 
            success: true, 
            value: configs[category][key],
            category,
            key 
        });
    } else {
        res.status(404).json({ error: 'Configuration not found' });
    }
});

// POST create/update configuration
router.post('/', (req, res) => {
    const { category, key, value, description } = req.body;
    
    if (!configs[category]) {
        configs[category] = {};
    }
    
    configs[category][key] = value;
    
    res.json({
        success: true,
        config: { category, key, value, description },
        message: 'Configuration updated'
    });
});

// PUT update configuration
router.put('/:category/:key', (req, res) => {
    const { category, key } = req.params;
    const { value } = req.body;
    
    if (configs[category] && configs[category][key] !== undefined) {
        configs[category][key] = value;
        res.json({
            success: true,
            config: { category, key, value },
            message: 'Configuration updated'
        });
    } else {
        res.status(404).json({ error: 'Configuration not found' });
    }
});

// DELETE configuration
router.delete('/:category/:key', (req, res) => {
    const { category, key } = req.params;
    
    if (configs[category] && configs[category][key] !== undefined) {
        delete configs[category][key];
        res.json({
            success: true,
            message: 'Configuration deleted'
        });
    } else {
        res.status(404).json({ error: 'Configuration not found' });
    }
});

module.exports = router;