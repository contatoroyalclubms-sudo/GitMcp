const express = require('express');
const router = express.Router();
const MEEPAIEngine = require('../ai-core/meep-ai-engine');

// Initialize AI Engine
const aiEngine = new MEEPAIEngine();

// Get AI Status
router.get('/status', async (req, res) => {
    try {
        const status = aiEngine.getStatus();
        res.json({
            success: true,
            status
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Predict Sales
router.post('/predict/sales', async (req, res) => {
    try {
        const prediction = await aiEngine.predictSales(req.body);
        res.json({
            success: true,
            prediction
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Analyze Customer
router.post('/analyze/customer', async (req, res) => {
    try {
        const analysis = await aiEngine.analyzeCustomer(req.body);
        res.json({
            success: true,
            analysis
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Detect Fraud
router.post('/detect/fraud', async (req, res) => {
    try {
        const result = await aiEngine.detectFraud(req.body);
        res.json({
            success: true,
            fraud_detection: result
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Optimize Price
router.post('/optimize/price', async (req, res) => {
    try {
        const { product, marketData } = req.body;
        const optimization = await aiEngine.optimizePrice(product, marketData);
        res.json({
            success: true,
            optimization
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Recommendations
router.post('/recommendations', async (req, res) => {
    try {
        const { user, context } = req.body;
        const recommendations = await aiEngine.generateRecommendations(user, context);
        res.json({
            success: true,
            recommendations
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Real-time Analytics
router.post('/analytics/realtime', async (req, res) => {
    try {
        const analytics = await aiEngine.performRealTimeAnalytics(req.body);
        res.json({
            success: true,
            analytics
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Detect Anomalies
router.post('/detect/anomalies', async (req, res) => {
    try {
        const anomalies = await aiEngine.detectAnomalies(req.body);
        res.json({
            success: true,
            anomalies
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Automate Decisions
router.post('/automate/decisions', async (req, res) => {
    try {
        const decisions = await aiEngine.automateDecisions(req.body);
        res.json({
            success: true,
            decisions
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Chatbot
router.post('/chat', async (req, res) => {
    try {
        const { message, context } = req.body;
        const response = await aiEngine.processChat(message, context);
        res.json({
            success: true,
            chat: response
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Sentiment Analysis
router.post('/analyze/sentiment', async (req, res) => {
    try {
        const { text } = req.body;
        const sentiment = aiEngine.analyzeSentiment(text);
        res.json({
            success: true,
            sentiment
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Export Predictions
router.get('/predictions/export', async (req, res) => {
    try {
        const predictions = aiEngine.exportPredictions();
        res.json({
            success: true,
            predictions
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// WebSocket support for real-time AI updates
router.ws = (ws) => {
    // Listen for AI events
    aiEngine.on('ai-ready', () => {
        ws.send(JSON.stringify({ type: 'ai-ready' }));
    });

    aiEngine.on('sales-predicted', (data) => {
        ws.send(JSON.stringify({ type: 'sales-prediction', data }));
    });

    aiEngine.on('fraud-detected', (data) => {
        ws.send(JSON.stringify({ type: 'fraud-alert', data }));
    });

    aiEngine.on('analytics-update', (data) => {
        ws.send(JSON.stringify({ type: 'analytics', data }));
    });
};

module.exports = router;