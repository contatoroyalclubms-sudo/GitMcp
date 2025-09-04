const express = require('express');
const router = express.Router();

// GET sales report
router.get('/sales', (req, res) => {
    res.json({
        success: true,
        report: {
            title: 'Sales Report',
            period: req.query.period || 'monthly',
            data: {
                totalSales: 3420,
                totalRevenue: 450000,
                averageOrderValue: 131.58,
                topProducts: [
                    { name: 'Product A', sales: 890, revenue: 89000 },
                    { name: 'Product B', sales: 650, revenue: 65000 }
                ],
                salesByPeriod: generateSalesByPeriod()
            },
            generatedAt: new Date()
        }
    });
});

// GET events report
router.get('/events', (req, res) => {
    res.json({
        success: true,
        report: {
            title: 'Events Report',
            data: {
                totalEvents: 45,
                activeEvents: 12,
                completedEvents: 30,
                upcomingEvents: 3,
                totalAttendees: 25000,
                averageAttendance: 555,
                eventsByCategory: {
                    'Music': 15,
                    'Sports': 10,
                    'Corporate': 12,
                    'Other': 8
                }
            },
            generatedAt: new Date()
        }
    });
});

// GET clients report
router.get('/clients', (req, res) => {
    res.json({
        success: true,
        report: {
            title: 'Clients Report',
            data: {
                totalClients: 1250,
                newClientsThisMonth: 85,
                activeClients: 890,
                clientsBySegment: {
                    'VIP': 125,
                    'Premium': 350,
                    'Regular': 775
                },
                averageLifetimeValue: 2500,
                retentionRate: 0.92
            },
            generatedAt: new Date()
        }
    });
});

// GET financial report
router.get('/financial', (req, res) => {
    res.json({
        success: true,
        report: {
            title: 'Financial Report',
            period: req.query.period || 'quarterly',
            data: {
                revenue: 450000,
                expenses: 280000,
                netProfit: 170000,
                profitMargin: 0.378,
                cashFlow: 'positive',
                revenueByCategory: {
                    'Tickets': 250000,
                    'Merchandise': 80000,
                    'Food & Beverage': 120000
                }
            },
            generatedAt: new Date()
        }
    });
});

// Helper function
function generateSalesByPeriod() {
    const periods = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        periods.push({
            date: date.toISOString().split('T')[0],
            sales: Math.floor(300 + Math.random() * 200),
            revenue: Math.floor(40000 + Math.random() * 20000)
        });
    }
    return periods;
}

// POST generate custom report
router.post('/custom', (req, res) => {
    const { type, filters, period } = req.body;
    
    res.json({
        success: true,
        report: {
            title: `Custom ${type} Report`,
            filters,
            period,
            data: {
                message: 'Custom report generated successfully',
                recordsFound: Math.floor(100 + Math.random() * 500)
            },
            generatedAt: new Date()
        }
    });
});

// GET export report
router.get('/export/:format', (req, res) => {
    const { format } = req.params;
    const supportedFormats = ['pdf', 'excel', 'csv', 'json'];
    
    if (supportedFormats.includes(format)) {
        res.json({
            success: true,
            export: {
                format,
                url: `/downloads/report_${Date.now()}.${format}`,
                message: `Report exported as ${format.toUpperCase()}`
            }
        });
    } else {
        res.status(400).json({ error: 'Unsupported format' });
    }
});

module.exports = router;