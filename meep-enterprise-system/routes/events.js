const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const QRCode = require('qrcode');
const { 
    Event, 
    TicketType, 
    Ticket, 
    Artist, 
    EventLineup, 
    CheckIn, 
    EventZone 
} = require('../models/EventManagement');

// ==================== EVENTOS ====================

// Listar todos os eventos com filtros
router.get('/', async (req, res) => {
    try {
        const { 
            status, 
            type, 
            featured, 
            startDate, 
            endDate,
            search,
            page = 1,
            limit = 20
        } = req.query;
        
        const whereClause = {};
        
        if (status) whereClause.status = status;
        if (type) whereClause.eventType = type;
        if (featured === 'true') whereClause.featured = true;
        
        if (startDate || endDate) {
            whereClause.startDate = {};
            if (startDate) whereClause.startDate[Op.gte] = startDate;
            if (endDate) whereClause.startDate[Op.lte] = endDate;
        }
        
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { venue: { [Op.like]: `%${search}%` } },
                { city: { [Op.like]: `%${search}%` } }
            ];
        }
        
        const offset = (page - 1) * limit;
        
        const { count, rows } = await Event.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: TicketType,
                    attributes: ['id', 'name', 'price', 'quantity', 'sold']
                },
                {
                    model: Artist,
                    through: { attributes: ['performanceDate', 'headliner'] },
                    attributes: ['id', 'name', 'photo']
                }
            ],
            order: [
                ['featured', 'DESC'],
                ['startDate', 'ASC']
            ],
            limit: parseInt(limit),
            offset
        });
        
        res.json({
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: page,
            events: rows
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ error: 'Erro ao buscar eventos' });
    }
});

// Criar novo evento
router.post('/', async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const eventData = req.body;
        
        // Gerar slug único
        eventData.slug = eventData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + 
            '-' + Date.now();
        
        const event = await Event.create(eventData, { transaction });
        
        // Criar zonas padrão
        const defaultZones = [
            { name: 'Pista', capacity: 1000, color: '#00ffcc' },
            { name: 'VIP', capacity: 200, color: '#ff00ff' },
            { name: 'Camarote', capacity: 50, color: '#ffcc00' }
        ];
        
        for (const zone of defaultZones) {
            await EventZone.create({
                ...zone,
                eventId: event.id
            }, { transaction });
        }
        
        await transaction.commit();
        
        res.status(201).json({
            message: 'Evento criado com sucesso',
            event
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Create event error:', error);
        res.status(500).json({ error: 'Erro ao criar evento' });
    }
});

// Obter detalhes do evento
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id, {
            include: [
                {
                    model: TicketType,
                    include: [
                        {
                            model: Ticket,
                            attributes: [],
                            where: { status: 'paid' },
                            required: false
                        }
                    ]
                },
                {
                    model: Artist,
                    through: EventLineup,
                    include: ['technicalRider']
                },
                {
                    model: EventZone
                },
                {
                    model: CheckIn,
                    attributes: [],
                    separate: true
                }
            ]
        });
        
        if (!event) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }
        
        // Calcular estatísticas
        const stats = {
            totalTickets: 0,
            soldTickets: 0,
            availableTickets: 0,
            revenue: 0,
            checkedIn: await CheckIn.count({ where: { eventId: event.id } }),
            occupancyRate: 0
        };
        
        for (const ticketType of event.TicketTypes) {
            stats.totalTickets += ticketType.quantity;
            stats.soldTickets += ticketType.sold;
            stats.revenue += ticketType.sold * ticketType.price;
        }
        
        stats.availableTickets = stats.totalTickets - stats.soldTickets;
        stats.occupancyRate = stats.totalTickets > 0 
            ? ((stats.soldTickets / stats.totalTickets) * 100).toFixed(1)
            : 0;
        
        res.json({
            event,
            stats
        });
    } catch (error) {
        console.error('Get event details error:', error);
        res.status(500).json({ error: 'Erro ao buscar detalhes do evento' });
    }
});

// Atualizar evento
router.put('/:id', async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        
        if (!event) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }
        
        await event.update(req.body);
        
        res.json({
            message: 'Evento atualizado com sucesso',
            event
        });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ error: 'Erro ao atualizar evento' });
    }
});

// ==================== TIPOS DE INGRESSO ====================

// Criar tipo de ingresso
router.post('/:eventId/ticket-types', async (req, res) => {
    try {
        const { eventId } = req.params;
        const ticketTypeData = req.body;
        
        ticketTypeData.eventId = eventId;
        
        const ticketType = await TicketType.create(ticketTypeData);
        
        res.status(201).json({
            message: 'Tipo de ingresso criado com sucesso',
            ticketType
        });
    } catch (error) {
        console.error('Create ticket type error:', error);
        res.status(500).json({ error: 'Erro ao criar tipo de ingresso' });
    }
});

// Listar tipos de ingresso do evento
router.get('/:eventId/ticket-types', async (req, res) => {
    try {
        const ticketTypes = await TicketType.findAll({
            where: { 
                eventId: req.params.eventId,
                isActive: true
            },
            order: [['price', 'ASC']]
        });
        
        res.json(ticketTypes);
    } catch (error) {
        console.error('Get ticket types error:', error);
        res.status(500).json({ error: 'Erro ao buscar tipos de ingresso' });
    }
});

// ==================== VENDA DE INGRESSOS ====================

// Comprar ingressos
router.post('/:eventId/purchase', async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { eventId } = req.params;
        const {
            ticketTypeId,
            quantity,
            buyerName,
            buyerEmail,
            buyerPhone,
            buyerDocument,
            paymentMethod,
            attendees = []
        } = req.body;
        
        // Verificar disponibilidade
        const ticketType = await TicketType.findOne({
            where: { 
                id: ticketTypeId,
                eventId,
                isActive: true
            }
        });
        
        if (!ticketType) {
            throw new Error('Tipo de ingresso não encontrado');
        }
        
        const available = ticketType.quantity - ticketType.sold - ticketType.reserved;
        if (available < quantity) {
            throw new Error(`Apenas ${available} ingressos disponíveis`);
        }
        
        // Criar ordem
        const orderId = require('uuid').v4();
        const tickets = [];
        
        for (let i = 0; i < quantity; i++) {
            const ticketCode = `${eventId.substring(0, 8)}-${Date.now()}-${i}`.toUpperCase();
            
            // Gerar QR Code
            const qrData = await QRCode.toDataURL(ticketCode);
            
            const attendee = attendees[i] || {};
            
            const ticket = await Ticket.create({
                eventId,
                ticketTypeId,
                orderId,
                code: ticketCode,
                qrCode: qrData,
                buyerName,
                buyerEmail,
                buyerPhone,
                buyerDocument,
                attendeeName: attendee.name || buyerName,
                attendeeDocument: attendee.document || buyerDocument,
                price: ticketType.price,
                finalPrice: ticketType.price,
                status: 'paid',
                validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 ano
            }, { transaction });
            
            tickets.push(ticket);
        }
        
        // Atualizar quantidade vendida
        await ticketType.increment('sold', { 
            by: quantity,
            transaction 
        });
        
        // Atualizar evento
        await Event.increment('soldTickets', {
            by: quantity,
            where: { id: eventId },
            transaction
        });
        
        await Event.increment('revenue', {
            by: ticketType.price * quantity,
            where: { id: eventId },
            transaction
        });
        
        await transaction.commit();
        
        res.status(201).json({
            message: 'Compra realizada com sucesso',
            orderId,
            tickets: tickets.map(t => ({
                id: t.id,
                code: t.code,
                attendeeName: t.attendeeName,
                qrCode: t.qrCode
            })),
            total: ticketType.price * quantity
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Purchase tickets error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Verificar ingresso
router.get('/ticket/:code', async (req, res) => {
    try {
        const ticket = await Ticket.findOne({
            where: { code: req.params.code },
            include: [
                {
                    model: Event,
                    attributes: ['name', 'venue', 'startDate']
                },
                {
                    model: TicketType,
                    attributes: ['name']
                },
                {
                    model: CheckIn,
                    attributes: ['checkInTime', 'gate']
                }
            ]
        });
        
        if (!ticket) {
            return res.status(404).json({ error: 'Ingresso não encontrado' });
        }
        
        res.json({
            valid: ticket.status === 'paid' && !ticket.checkedIn,
            ticket
        });
    } catch (error) {
        console.error('Verify ticket error:', error);
        res.status(500).json({ error: 'Erro ao verificar ingresso' });
    }
});

// ==================== CHECK-IN ====================

// Realizar check-in
router.post('/checkin', async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const {
            ticketCode,
            gate,
            terminal,
            staffId,
            staffName,
            documentVerified = false,
            ageVerified = false,
            wristbandCode
        } = req.body;
        
        // Buscar ingresso
        const ticket = await Ticket.findOne({
            where: { code: ticketCode },
            include: [Event, TicketType]
        });
        
        if (!ticket) {
            throw new Error('Ingresso não encontrado');
        }
        
        if (ticket.status !== 'paid') {
            throw new Error(`Ingresso com status: ${ticket.status}`);
        }
        
        if (ticket.checkedIn) {
            throw new Error('Ingresso já utilizado');
        }
        
        // Verificar se o evento está acontecendo
        const now = new Date();
        const eventStart = new Date(ticket.Event.startDate);
        const eventEnd = new Date(ticket.Event.endDate);
        
        if (now < eventStart) {
            throw new Error('Evento ainda não começou');
        }
        
        if (now > eventEnd) {
            throw new Error('Evento já terminou');
        }
        
        // Criar registro de check-in
        const checkIn = await CheckIn.create({
            eventId: ticket.eventId,
            ticketId: ticket.id,
            gate,
            terminal,
            staffId,
            staffName,
            attendeeName: ticket.attendeeName,
            attendeeDocument: ticket.attendeeDocument,
            documentVerified,
            ageVerified,
            wristbandCode,
            status: 'success'
        }, { transaction });
        
        // Atualizar ingresso
        await ticket.update({
            checkedIn: true,
            checkedInAt: now,
            checkedInBy: staffId,
            checkInGate: gate
        }, { transaction });
        
        // Atualizar contador do evento
        await Event.increment('checkedIn', {
            where: { id: ticket.eventId },
            transaction
        });
        
        // Atualizar zona se especificada
        if (ticket.TicketType.name) {
            await EventZone.increment('currentOccupancy', {
                where: { 
                    eventId: ticket.eventId,
                    name: ticket.TicketType.name
                },
                transaction
            });
        }
        
        await transaction.commit();
        
        res.json({
            success: true,
            message: 'Check-in realizado com sucesso',
            checkIn: {
                id: checkIn.id,
                attendeeName: ticket.attendeeName,
                ticketType: ticket.TicketType.name,
                gate,
                time: checkIn.checkInTime
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Check-in error:', error);
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Listar check-ins do evento
router.get('/:eventId/checkins', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 50,
            gate,
            search
        } = req.query;
        
        const whereClause = { eventId: req.params.eventId };
        
        if (gate) whereClause.gate = gate;
        
        if (search) {
            whereClause[Op.or] = [
                { attendeeName: { [Op.like]: `%${search}%` } },
                { attendeeDocument: { [Op.like]: `%${search}%` } },
                { '$Ticket.code$': { [Op.like]: `%${search}%` } }
            ];
        }
        
        const offset = (page - 1) * limit;
        
        const { count, rows } = await CheckIn.findAndCountAll({
            where: whereClause,
            include: [{
                model: Ticket,
                include: [TicketType]
            }],
            order: [['checkInTime', 'DESC']],
            limit: parseInt(limit),
            offset
        });
        
        res.json({
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: page,
            checkins: rows
        });
    } catch (error) {
        console.error('Get check-ins error:', error);
        res.status(500).json({ error: 'Erro ao buscar check-ins' });
    }
});

// ==================== LINE-UP / ARTISTAS ====================

// Adicionar artista ao line-up
router.post('/:eventId/lineup', async (req, res) => {
    try {
        const { eventId } = req.params;
        const {
            artistId,
            performanceDate,
            startTime,
            endTime,
            stage,
            headliner,
            cachet
        } = req.body;
        
        const lineup = await EventLineup.create({
            eventId,
            artistId,
            performanceDate,
            startTime,
            endTime,
            stage,
            headliner,
            cachet,
            confirmed: false
        });
        
        res.status(201).json({
            message: 'Artista adicionado ao line-up',
            lineup
        });
    } catch (error) {
        console.error('Add to lineup error:', error);
        res.status(500).json({ error: 'Erro ao adicionar artista' });
    }
});

// Obter line-up do evento
router.get('/:eventId/lineup', async (req, res) => {
    try {
        const lineup = await EventLineup.findAll({
            where: { 
                eventId: req.params.eventId,
                cancelled: false
            },
            include: [{
                model: Artist,
                attributes: ['id', 'name', 'artisticName', 'photo', 'genre']
            }],
            order: [
                ['performanceDate', 'ASC'],
                ['startTime', 'ASC']
            ]
        });
        
        res.json(lineup);
    } catch (error) {
        console.error('Get lineup error:', error);
        res.status(500).json({ error: 'Erro ao buscar line-up' });
    }
});

// ==================== ESTATÍSTICAS DO EVENTO ====================

// Dashboard do evento
router.get('/:eventId/dashboard', async (req, res) => {
    try {
        const eventId = req.params.eventId;
        
        const event = await Event.findByPk(eventId, {
            include: [
                TicketType,
                EventZone
            ]
        });
        
        if (!event) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }
        
        // Estatísticas gerais
        const [
            totalSold,
            totalCheckedIn,
            revenueByType,
            checkinsByHour,
            checkinsByGate
        ] = await Promise.all([
            // Total vendido
            Ticket.count({
                where: { 
                    eventId,
                    status: 'paid'
                }
            }),
            
            // Total check-ins
            CheckIn.count({
                where: { eventId }
            }),
            
            // Receita por tipo
            TicketType.findAll({
                where: { eventId },
                attributes: [
                    'name',
                    'price',
                    'sold',
                    [sequelize.literal('price * sold'), 'revenue']
                ]
            }),
            
            // Check-ins por hora
            CheckIn.findAll({
                where: { eventId },
                attributes: [
                    [sequelize.fn('HOUR', sequelize.col('checkInTime')), 'hour'],
                    [sequelize.fn('COUNT', '*'), 'count']
                ],
                group: ['hour'],
                order: [[sequelize.fn('HOUR', sequelize.col('checkInTime')), 'ASC']]
            }),
            
            // Check-ins por portão
            CheckIn.findAll({
                where: { eventId },
                attributes: [
                    'gate',
                    [sequelize.fn('COUNT', '*'), 'count']
                ],
                group: ['gate']
            })
        ]);
        
        // Calcular taxas
        const attendanceRate = totalSold > 0 
            ? ((totalCheckedIn / totalSold) * 100).toFixed(1)
            : 0;
        
        // Zonas e ocupação
        const zoneOccupancy = event.EventZones.map(zone => ({
            name: zone.name,
            capacity: zone.capacity,
            currentOccupancy: zone.currentOccupancy,
            occupancyRate: zone.capacity > 0 
                ? ((zone.currentOccupancy / zone.capacity) * 100).toFixed(1)
                : 0
        }));
        
        res.json({
            event: {
                id: event.id,
                name: event.name,
                venue: event.venue,
                startDate: event.startDate,
                status: event.status
            },
            stats: {
                capacity: event.capacity,
                totalSold,
                totalCheckedIn,
                attendanceRate,
                revenue: event.revenue,
                profit: event.profit
            },
            revenueByType,
            checkinsByHour,
            checkinsByGate,
            zoneOccupancy
        });
    } catch (error) {
        console.error('Get event dashboard error:', error);
        res.status(500).json({ error: 'Erro ao buscar dashboard do evento' });
    }
});

// Exportar relatório do evento
router.get('/:eventId/export', async (req, res) => {
    try {
        const { format = 'json' } = req.query;
        
        const event = await Event.findByPk(req.params.eventId, {
            include: [
                TicketType,
                {
                    model: Ticket,
                    where: { status: 'paid' },
                    required: false,
                    include: [CheckIn]
                },
                {
                    model: Artist,
                    through: EventLineup
                }
            ]
        });
        
        if (!event) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }
        
        if (format === 'csv') {
            // Implementar exportação CSV
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${event.slug}-report.csv"`);
            // ... código para gerar CSV
        } else {
            res.json(event);
        }
    } catch (error) {
        console.error('Export event error:', error);
        res.status(500).json({ error: 'Erro ao exportar evento' });
    }
});

module.exports = router;