const express = require('express');
const router = express.Router();
const { Client, Campaign, Sale } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { authorizeRole } = require('../middleware/auth');

router.get('/loyalty/program', async (req, res) => {
    try {
        const program = {
            name: 'MEEP Rewards',
            status: 'active',
            rules: {
                earnRate: 1,
                redeemRate: 100,
                minimumPoints: 500,
                expirationDays: 365
            },
            tiers: [
                { name: 'Bronze', minPoints: 0, benefits: ['5% discount'] },
                { name: 'Silver', minPoints: 1000, benefits: ['10% discount', 'Priority access'] },
                { name: 'Gold', minPoints: 5000, benefits: ['15% discount', 'VIP access', 'Free delivery'] },
                { name: 'Platinum', minPoints: 10000, benefits: ['20% discount', 'Exclusive events', 'Personal concierge'] }
            ],
            totalMembers: await Client.count({ where: { loyaltyPoints: { [Op.gt]: 0 } } }),
            totalPointsIssued: await Client.sum('loyaltyPoints') || 0
        };

        res.json(program);
    } catch (error) {
        console.error('Get loyalty program error:', error);
        res.status(500).json({ error: 'Failed to get loyalty program' });
    }
});

router.post('/loyalty/earn', async (req, res) => {
    try {
        const { clientId, amount, description } = req.body;

        const client = await Client.findByPk(clientId);
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        const pointsEarned = Math.floor(amount);
        client.loyaltyPoints += pointsEarned;
        await client.save();

        res.json({
            message: 'Points earned',
            pointsEarned,
            totalPoints: client.loyaltyPoints,
            description
        });
    } catch (error) {
        console.error('Earn points error:', error);
        res.status(500).json({ error: 'Failed to earn points' });
    }
});

router.post('/loyalty/redeem', async (req, res) => {
    try {
        const { clientId, points, rewardType } = req.body;

        const client = await Client.findByPk(clientId);
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        if (client.loyaltyPoints < points) {
            return res.status(400).json({ error: 'Insufficient points' });
        }

        client.loyaltyPoints -= points;
        await client.save();

        const reward = {
            id: require('uuid').v4(),
            type: rewardType,
            value: points / 100,
            code: `REWARD-${Date.now()}`,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };

        res.json({
            message: 'Points redeemed',
            reward,
            remainingPoints: client.loyaltyPoints
        });
    } catch (error) {
        console.error('Redeem points error:', error);
        res.status(500).json({ error: 'Failed to redeem points' });
    }
});

router.get('/crm/segments', async (req, res) => {
    try {
        const segments = [
            {
                id: 'high-value',
                name: 'High Value Customers',
                criteria: 'Total spent > R$ 5000',
                count: await Client.count({
                    include: [{
                        model: Sale,
                        attributes: [],
                        where: { status: 'completed' }
                    }],
                    having: sequelize.literal('SUM("Sales"."total") > 5000'),
                    group: ['Client.id']
                })
            },
            {
                id: 'frequent',
                name: 'Frequent Buyers',
                criteria: 'More than 10 purchases',
                count: await Client.count({
                    include: [{
                        model: Sale,
                        attributes: [],
                        where: { status: 'completed' }
                    }],
                    having: sequelize.literal('COUNT("Sales"."id") > 10'),
                    group: ['Client.id']
                })
            },
            {
                id: 'new',
                name: 'New Customers',
                criteria: 'Registered in last 30 days',
                count: await Client.count({
                    where: {
                        createdAt: {
                            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        }
                    }
                })
            },
            {
                id: 'inactive',
                name: 'Inactive Customers',
                criteria: 'No purchase in last 90 days',
                count: 0
            }
        ];

        res.json(segments);
    } catch (error) {
        console.error('Get CRM segments error:', error);
        res.status(500).json({ error: 'Failed to get CRM segments' });
    }
});

router.get('/crm/customers/:id/profile', async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        
        if (!client) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const purchases = await Sale.findAll({
            where: { 
                clientId: req.params.id,
                status: 'completed'
            },
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        const totalSpent = await Sale.sum('total', {
            where: { 
                clientId: req.params.id,
                status: 'completed'
            }
        });

        const profile = {
            client,
            metrics: {
                totalSpent: totalSpent || 0,
                totalPurchases: purchases.length,
                averageTicket: purchases.length > 0 ? (totalSpent / purchases.length).toFixed(2) : 0,
                loyaltyPoints: client.loyaltyPoints,
                category: client.category,
                npsScore: client.npsScore
            },
            recentPurchases: purchases,
            tags: ['loyal', 'high-value'],
            preferences: {
                preferredPayment: 'credit',
                favoriteCategory: 'Premium'
            }
        };

        res.json(profile);
    } catch (error) {
        console.error('Get customer profile error:', error);
        res.status(500).json({ error: 'Failed to get customer profile' });
    }
});

router.get('/guest-lists', async (req, res) => {
    try {
        const { eventId } = req.query;

        const guestLists = [
            {
                id: 'list-001',
                name: 'VIP List',
                eventId,
                discount: 100,
                guests: 50,
                checkedIn: 35
            },
            {
                id: 'list-002',
                name: 'Partners',
                eventId,
                discount: 50,
                guests: 30,
                checkedIn: 22
            },
            {
                id: 'list-003',
                name: 'Staff',
                eventId,
                discount: 100,
                guests: 20,
                checkedIn: 18
            }
        ];

        res.json(guestLists);
    } catch (error) {
        console.error('Get guest lists error:', error);
        res.status(500).json({ error: 'Failed to get guest lists' });
    }
});

router.post('/guest-lists', authorizeRole(['admin', 'manager']), async (req, res) => {
    try {
        const { name, eventId, discount, guests } = req.body;

        const guestList = {
            id: require('uuid').v4(),
            name,
            eventId,
            discount,
            guests,
            createdAt: new Date()
        };

        res.status(201).json(guestList);
    } catch (error) {
        console.error('Create guest list error:', error);
        res.status(500).json({ error: 'Failed to create guest list' });
    }
});

router.get('/coupons', async (req, res) => {
    try {
        const coupons = [
            {
                id: 'coup-001',
                code: 'SUMMER20',
                discount: 20,
                type: 'percentage',
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                usageLimit: 100,
                usageCount: 45,
                status: 'active'
            },
            {
                id: 'coup-002',
                code: 'WELCOME50',
                discount: 50,
                type: 'fixed',
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                usageLimit: 50,
                usageCount: 12,
                status: 'active'
            }
        ];

        res.json(coupons);
    } catch (error) {
        console.error('Get coupons error:', error);
        res.status(500).json({ error: 'Failed to get coupons' });
    }
});

router.post('/coupons', authorizeRole(['admin', 'manager']), async (req, res) => {
    try {
        const { code, discount, type, validFrom, validUntil, usageLimit } = req.body;

        const coupon = {
            id: require('uuid').v4(),
            code: code.toUpperCase(),
            discount,
            type,
            validFrom: new Date(validFrom),
            validUntil: new Date(validUntil),
            usageLimit,
            usageCount: 0,
            status: 'active',
            createdAt: new Date()
        };

        res.status(201).json(coupon);
    } catch (error) {
        console.error('Create coupon error:', error);
        res.status(500).json({ error: 'Failed to create coupon' });
    }
});

router.post('/coupons/validate', async (req, res) => {
    try {
        const { code, amount } = req.body;

        const isValid = Math.random() > 0.2;

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid or expired coupon' });
        }

        const discount = Math.floor(Math.random() * 30) + 10;
        const finalAmount = amount - (amount * discount / 100);

        res.json({
            valid: true,
            code,
            discount: `${discount}%`,
            originalAmount: amount,
            discountAmount: amount * discount / 100,
            finalAmount
        });
    } catch (error) {
        console.error('Validate coupon error:', error);
        res.status(500).json({ error: 'Failed to validate coupon' });
    }
});

router.get('/campaigns', async (req, res) => {
    try {
        const campaigns = await Campaign.findAll({
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        res.json(campaigns);
    } catch (error) {
        console.error('Get campaigns error:', error);
        res.status(500).json({ error: 'Failed to get campaigns' });
    }
});

router.post('/campaigns', authorizeRole(['admin', 'manager']), async (req, res) => {
    try {
        const { name, type, content, targetAudience, scheduledDate } = req.body;

        const campaign = await Campaign.create({
            name,
            type,
            content,
            targetAudience,
            scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
            status: scheduledDate ? 'scheduled' : 'draft'
        });

        res.status(201).json(campaign);
    } catch (error) {
        console.error('Create campaign error:', error);
        res.status(500).json({ error: 'Failed to create campaign' });
    }
});

router.post('/campaigns/:id/send', authorizeRole(['admin', 'manager']), async (req, res) => {
    try {
        const campaign = await Campaign.findByPk(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        const audienceCount = Math.floor(Math.random() * 1000) + 100;

        campaign.status = 'sent';
        campaign.sentCount = audienceCount;
        await campaign.save();

        res.json({
            message: 'Campaign sent successfully',
            sentTo: audienceCount,
            campaign
        });
    } catch (error) {
        console.error('Send campaign error:', error);
        res.status(500).json({ error: 'Failed to send campaign' });
    }
});

router.get('/promotions', async (req, res) => {
    try {
        const promotions = [
            {
                id: 'promo-001',
                name: 'Happy Hour 2x1',
                type: 'buy_one_get_one',
                products: ['Beer', 'Wine'],
                validFrom: '18:00',
                validUntil: '20:00',
                daysOfWeek: ['friday', 'saturday'],
                status: 'active'
            },
            {
                id: 'promo-002',
                name: 'Combo Special',
                type: 'bundle',
                products: ['Burger', 'Fries', 'Soda'],
                discount: 25,
                status: 'active'
            }
        ];

        res.json(promotions);
    } catch (error) {
        console.error('Get promotions error:', error);
        res.status(500).json({ error: 'Failed to get promotions' });
    }
});

router.post('/promotions', authorizeRole(['admin', 'manager']), async (req, res) => {
    try {
        const promotion = {
            id: require('uuid').v4(),
            ...req.body,
            status: 'active',
            createdAt: new Date()
        };

        res.status(201).json(promotion);
    } catch (error) {
        console.error('Create promotion error:', error);
        res.status(500).json({ error: 'Failed to create promotion' });
    }
});

module.exports = router;