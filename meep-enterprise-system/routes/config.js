const express = require('express');
const router = express.Router();
const SystemConfig = require('../models/SystemConfig');

// Get current system configuration
router.get('/system', async (req, res) => {
    try {
        let config = await SystemConfig.findOne();
        
        if (!config) {
            // Create default configuration if none exists
            config = await SystemConfig.create({
                localCode: 'NOVA UNICA CLUB',
                localName: 'UNICA CLUB',
                establishmentType: 'Boate/Casas Noturnas',
                systemType: 'pre-paid-cashless',
                maxCashlessValue: 5000.00,
                maxDiscount: 10.00,
                printReceipt: true,
                printerName: 'BAR Royal0000',
                requireName: true,
                requireCPF: true,
                requirePhone: true,
                requireBirthDate: true,
                syncAfterSale: true,
                calculateChange: true,
                requestCPF: true,
                prePaidOnline: true,
                blockCashlessAfterPayment: true,
                requestTableForConsumption: true
            });
        }
        
        res.json(config);
    } catch (error) {
        console.error('Get config error:', error);
        res.status(500).json({ error: 'Failed to get configuration' });
    }
});

// Update system configuration
router.put('/system', async (req, res) => {
    try {
        let config = await SystemConfig.findOne();
        
        if (!config) {
            config = await SystemConfig.create(req.body);
        } else {
            await config.update(req.body);
        }
        
        res.json({
            message: 'Configuration updated successfully',
            config
        });
    } catch (error) {
        console.error('Update config error:', error);
        res.status(500).json({ error: 'Failed to update configuration' });
    }
});

// Get printer list
router.get('/printers', async (req, res) => {
    try {
        // Mock printer list - in production, this would query actual system printers
        const printers = [
            { name: 'BAR Royal0000', status: 'online', default: true },
            { name: 'COZINHA Epson', status: 'online', default: false },
            { name: 'CAIXA HP', status: 'offline', default: false }
        ];
        
        res.json(printers);
    } catch (error) {
        console.error('Get printers error:', error);
        res.status(500).json({ error: 'Failed to get printers' });
    }
});

// Test printer
router.post('/printers/test', async (req, res) => {
    try {
        const { printerName } = req.body;
        
        // Mock test - in production, would send actual test print
        res.json({
            message: `Test print sent to ${printerName}`,
            success: true
        });
    } catch (error) {
        console.error('Test printer error:', error);
        res.status(500).json({ error: 'Failed to test printer' });
    }
});

// Get establishment types
router.get('/establishment-types', (req, res) => {
    res.json([
        'Boate/Casas Noturnas',
        'Bar/Restaurante',
        'Festival',
        'Evento Corporativo',
        'Show/Concerto',
        'Feira/Exposição',
        'Clube/Associação',
        'Hotel/Resort',
        'Parque de Diversões',
        'Estádio/Arena'
    ]);
});

// Get system types
router.get('/system-types', (req, res) => {
    res.json([
        {
            id: 'pre-paid-token',
            name: 'Pré-pago Ficha',
            description: 'Sistema com fichas pré-pagas'
        },
        {
            id: 'pre-paid-cashless',
            name: 'Pré-pago Cashless',
            description: 'Sistema com cartão RFID pré-pago'
        },
        {
            id: 'post-paid-command',
            name: 'Pós-pago Comanda',
            description: 'Sistema tradicional com comanda'
        }
    ]);
});

module.exports = router;