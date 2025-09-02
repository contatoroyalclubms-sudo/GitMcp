const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const CashlessCard = require('../models/CashlessCard');
const { Client, Sale, SaleItem, Product, Transaction } = require('../models');
const SystemConfig = require('../models/SystemConfig');

// Criar novo cartão cashless
router.post('/cards/create', async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const {
            cardNumber,
            clientName,
            clientCPF,
            clientPhone,
            clientBirthDate,
            clientEmail,
            initialBalance,
            eventId,
            tableNumber
        } = req.body;
        
        // Verificar configurações do sistema
        const config = await SystemConfig.findOne();
        
        // Validar campos obrigatórios baseado na configuração
        if (config.requireName && !clientName) {
            throw new Error('Nome é obrigatório');
        }
        if (config.requireCPF && !clientCPF) {
            throw new Error('CPF é obrigatório');
        }
        if (config.requirePhone && !clientPhone) {
            throw new Error('Telefone é obrigatório');
        }
        if (config.requireBirthDate && !clientBirthDate) {
            throw new Error('Data de nascimento é obrigatória');
        }
        
        // Verificar se cartão já existe
        const existingCard = await CashlessCard.findOne({
            where: { cardNumber }
        });
        
        if (existingCard && existingCard.status === 'active') {
            throw new Error('Cartão já está ativo');
        }
        
        // Criar ou atualizar cliente
        let client = await Client.findOne({
            where: { document: clientCPF }
        });
        
        if (!client) {
            client = await Client.create({
                name: clientName,
                document: clientCPF,
                phone: clientPhone,
                email: clientEmail,
                cashlessBalance: initialBalance || 0
            }, { transaction });
        }
        
        // Criar ou reativar cartão
        let card;
        if (existingCard) {
            // Reativar cartão existente
            card = await existingCard.update({
                clientId: client.id,
                clientName,
                clientCPF,
                clientPhone,
                clientBirthDate,
                clientEmail,
                balance: initialBalance || 0,
                initialBalance: initialBalance || 0,
                totalSpent: 0,
                status: 'active',
                eventId,
                tableNumber,
                activatedAt: new Date()
            }, { transaction });
        } else {
            // Criar novo cartão
            card = await CashlessCard.create({
                cardNumber,
                clientId: client.id,
                clientName,
                clientCPF,
                clientPhone,
                clientBirthDate,
                clientEmail,
                balance: initialBalance || 0,
                initialBalance: initialBalance || 0,
                maxBalance: config.maxCashlessValue,
                eventId,
                tableNumber,
                createdBy: req.user?.id
            }, { transaction });
        }
        
        // Registrar transação de carga inicial
        if (initialBalance > 0) {
            await Transaction.create({
                type: 'income',
                category: 'Carga Cashless',
                amount: initialBalance,
                description: `Carga inicial cartão ${cardNumber}`,
                eventId,
                status: 'completed',
                paidDate: new Date()
            }, { transaction });
        }
        
        await transaction.commit();
        
        res.status(201).json({
            message: 'Cartão criado com sucesso',
            card
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Create card error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Consultar saldo do cartão
router.get('/cards/:cardNumber/balance', async (req, res) => {
    try {
        const { cardNumber } = req.params;
        
        const card = await CashlessCard.findOne({
            where: { cardNumber }
        });
        
        if (!card) {
            return res.status(404).json({ error: 'Cartão não encontrado' });
        }
        
        res.json({
            cardNumber: card.cardNumber,
            clientName: card.clientName,
            balance: card.balance,
            totalSpent: card.totalSpent,
            status: card.status,
            tableNumber: card.tableNumber,
            cashbackAccumulated: card.cashbackAccumulated
        });
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({ error: 'Erro ao consultar saldo' });
    }
});

// Adicionar crédito ao cartão
router.post('/cards/:cardNumber/recharge', async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { cardNumber } = req.params;
        const { amount, paymentMethod } = req.body;
        
        const config = await SystemConfig.findOne();
        const card = await CashlessCard.findOne({
            where: { cardNumber }
        });
        
        if (!card) {
            throw new Error('Cartão não encontrado');
        }
        
        if (card.status !== 'active') {
            throw new Error('Cartão não está ativo');
        }
        
        const newBalance = parseFloat(card.balance) + parseFloat(amount);
        
        if (newBalance > config.maxCashlessValue) {
            throw new Error(`Valor máximo do cartão é R$ ${config.maxCashlessValue}`);
        }
        
        await card.update({
            balance: newBalance
        }, { transaction });
        
        // Registrar transação
        await Transaction.create({
            type: 'income',
            category: 'Recarga Cashless',
            amount,
            description: `Recarga cartão ${cardNumber}`,
            eventId: card.eventId,
            status: 'completed',
            paidDate: new Date()
        }, { transaction });
        
        await transaction.commit();
        
        res.json({
            message: 'Recarga realizada com sucesso',
            newBalance,
            amount
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Recharge error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Realizar venda com cartão cashless
router.post('/cards/:cardNumber/purchase', async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { cardNumber } = req.params;
        const { items, terminalId, discount = 0 } = req.body;
        
        const config = await SystemConfig.findOne();
        const card = await CashlessCard.findOne({
            where: { cardNumber }
        });
        
        if (!card) {
            throw new Error('Cartão não encontrado');
        }
        
        if (card.status !== 'active') {
            throw new Error('Cartão bloqueado ou inativo');
        }
        
        // Calcular total da compra
        let subtotal = 0;
        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (!product) {
                throw new Error(`Produto ${item.productId} não encontrado`);
            }
            subtotal += product.price * item.quantity;
        }
        
        // Aplicar desconto
        const discountAmount = Math.min(discount, config.maxDiscount * subtotal / 100);
        const total = subtotal - discountAmount;
        
        // Verificar saldo
        if (card.balance < total && !card.allowNegativeBalance) {
            throw new Error(`Saldo insuficiente. Saldo: R$ ${card.balance}, Total: R$ ${total}`);
        }
        
        // Criar venda
        const sale = await Sale.create({
            clientId: card.clientId,
            eventId: card.eventId,
            userId: req.user?.id,
            total,
            discount: discountAmount,
            paymentMethod: 'cashless',
            status: 'completed'
        }, { transaction });
        
        // Criar itens da venda
        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            await SaleItem.create({
                saleId: sale.id,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: product.price,
                total: product.price * item.quantity
            }, { transaction });
            
            // Atualizar estoque
            await product.decrement('stock', {
                by: item.quantity,
                transaction
            });
        }
        
        // Calcular cashback se habilitado
        let cashbackAmount = 0;
        if (config.hasCashback && card.cashbackPercentage > 0) {
            cashbackAmount = total * card.cashbackPercentage / 100;
        }
        
        // Atualizar saldo do cartão
        const newBalance = parseFloat(card.balance) - total + cashbackAmount;
        await card.update({
            balance: newBalance,
            totalSpent: parseFloat(card.totalSpent) + total,
            cashbackAccumulated: parseFloat(card.cashbackAccumulated) + cashbackAmount,
            lastUsedAt: new Date(),
            lastTerminalId: terminalId
        }, { transaction });
        
        await transaction.commit();
        
        res.json({
            message: 'Compra realizada com sucesso',
            saleId: sale.id,
            total,
            discount: discountAmount,
            cashback: cashbackAmount,
            newBalance,
            items: items.length
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Purchase error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Fechar cartão (pagamento final)
router.post('/cards/:cardNumber/checkout', async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { cardNumber } = req.params;
        const { paymentMethod, zerBalance = false } = req.body;
        
        const config = await SystemConfig.findOne();
        const card = await CashlessCard.findOne({
            where: { cardNumber },
            include: [{ model: Client }]
        });
        
        if (!card) {
            throw new Error('Cartão não encontrado');
        }
        
        const totalConsumed = parseFloat(card.initialBalance) - parseFloat(card.balance);
        
        // Registrar pagamento
        await Transaction.create({
            type: 'income',
            category: 'Fechamento Cashless',
            amount: totalConsumed,
            description: `Fechamento cartão ${cardNumber} - ${card.clientName}`,
            eventId: card.eventId,
            status: 'completed',
            paidDate: new Date()
        }, { transaction });
        
        // Atualizar status do cartão
        const updateData = {
            status: 'paid',
            paidAt: new Date(),
            paymentMethod
        };
        
        // Se configurado para zerar saldo ou solicitado
        if (config.clearPrePaidBalance || zerBalance) {
            updateData.balance = 0;
        }
        
        // Se configurado para desativar após pagamento
        if (config.deactivateCardOnTransfer) {
            updateData.status = 'cancelled';
        }
        
        await card.update(updateData, { transaction });
        
        await transaction.commit();
        
        res.json({
            message: 'Cartão fechado com sucesso',
            totalConsumed,
            remainingBalance: zerBalance ? 0 : card.balance,
            paymentMethod,
            cashbackTotal: card.cashbackAccumulated
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Checkout error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Bloquear/Desbloquear cartão
router.put('/cards/:cardNumber/status', async (req, res) => {
    try {
        const { cardNumber } = req.params;
        const { status, reason } = req.body;
        
        const card = await CashlessCard.findOne({
            where: { cardNumber }
        });
        
        if (!card) {
            return res.status(404).json({ error: 'Cartão não encontrado' });
        }
        
        await card.update({
            status,
            blockedReason: status === 'blocked' ? reason : null,
            lastModifiedBy: req.user?.id
        });
        
        res.json({
            message: `Cartão ${status === 'blocked' ? 'bloqueado' : 'desbloqueado'} com sucesso`,
            status,
            reason
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Erro ao atualizar status' });
    }
});

// Transferir saldo entre cartões
router.post('/cards/transfer', async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { fromCard, toCard, amount } = req.body;
        
        const sourceCard = await CashlessCard.findOne({
            where: { cardNumber: fromCard }
        });
        
        const destCard = await CashlessCard.findOne({
            where: { cardNumber: toCard }
        });
        
        if (!sourceCard || !destCard) {
            throw new Error('Cartão de origem ou destino não encontrado');
        }
        
        if (sourceCard.balance < amount) {
            throw new Error('Saldo insuficiente para transferência');
        }
        
        await sourceCard.decrement('balance', {
            by: amount,
            transaction
        });
        
        await destCard.increment('balance', {
            by: amount,
            transaction
        });
        
        await transaction.commit();
        
        res.json({
            message: 'Transferência realizada com sucesso',
            amount,
            sourceNewBalance: sourceCard.balance - amount,
            destNewBalance: destCard.balance + amount
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Transfer error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Relatório de cartões ativos
router.get('/cards/active', async (req, res) => {
    try {
        const { eventId } = req.query;
        
        const whereClause = { status: 'active' };
        if (eventId) {
            whereClause.eventId = eventId;
        }
        
        const cards = await CashlessCard.findAll({
            where: whereClause,
            attributes: [
                'cardNumber',
                'clientName',
                'clientCPF',
                'balance',
                'totalSpent',
                'tableNumber',
                'lastUsedAt'
            ],
            order: [['lastUsedAt', 'DESC']]
        });
        
        const summary = {
            totalCards: cards.length,
            totalBalance: cards.reduce((sum, card) => sum + parseFloat(card.balance), 0),
            totalSpent: cards.reduce((sum, card) => sum + parseFloat(card.totalSpent), 0)
        };
        
        res.json({
            cards,
            summary
        });
    } catch (error) {
        console.error('Get active cards error:', error);
        res.status(500).json({ error: 'Erro ao buscar cartões ativos' });
    }
});

// Histórico de transações do cartão
router.get('/cards/:cardNumber/history', async (req, res) => {
    try {
        const { cardNumber } = req.params;
        
        const card = await CashlessCard.findOne({
            where: { cardNumber }
        });
        
        if (!card) {
            return res.status(404).json({ error: 'Cartão não encontrado' });
        }
        
        const sales = await Sale.findAll({
            where: {
                clientId: card.clientId,
                paymentMethod: 'cashless'
            },
            include: [{
                model: SaleItem,
                include: [Product]
            }],
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        
        res.json({
            cardNumber,
            clientName: card.clientName,
            currentBalance: card.balance,
            totalSpent: card.totalSpent,
            transactions: sales
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
});

module.exports = router;