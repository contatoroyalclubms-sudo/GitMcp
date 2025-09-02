const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CashlessCard = sequelize.define('CashlessCard', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    
    // IDENTIFICAÇÃO DO CARTÃO
    cardNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        comment: 'Número único do cartão RFID'
    },
    cardType: {
        type: DataTypes.ENUM('client', 'employee', 'vip', 'temporary'),
        defaultValue: 'client'
    },
    
    // DADOS DO CLIENTE
    clientId: {
        type: DataTypes.UUID,
        references: {
            model: 'Clients',
            key: 'id'
        }
    },
    clientName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    clientCPF: {
        type: DataTypes.STRING,
        allowNull: false
    },
    clientPhone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    clientBirthDate: {
        type: DataTypes.DATE
    },
    clientEmail: {
        type: DataTypes.STRING
    },
    
    // SALDO E LIMITES
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Saldo atual do cartão'
    },
    initialBalance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Saldo inicial carregado'
    },
    maxBalance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 5000.00,
        comment: 'Valor máximo permitido no cartão'
    },
    totalSpent: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Total gasto com este cartão'
    },
    
    // STATUS DO CARTÃO
    status: {
        type: DataTypes.ENUM('active', 'blocked', 'expired', 'cancelled', 'paid'),
        defaultValue: 'active'
    },
    blockedReason: {
        type: DataTypes.STRING,
        comment: 'Motivo do bloqueio'
    },
    
    // CONTROLE DE EVENTO
    eventId: {
        type: DataTypes.UUID,
        references: {
            model: 'Events',
            key: 'id'
        }
    },
    
    // CASHBACK
    cashbackPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
        comment: 'Percentual de cashback'
    },
    cashbackAccumulated: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Cashback acumulado'
    },
    
    // MESA/LOCALIZAÇÃO
    tableNumber: {
        type: DataTypes.STRING,
        comment: 'Número da mesa associada'
    },
    sector: {
        type: DataTypes.STRING,
        comment: 'Setor/Área do evento'
    },
    
    // CONTROLE DE ACESSO
    lastUsedAt: {
        type: DataTypes.DATE,
        comment: 'Última vez que o cartão foi usado'
    },
    lastTerminalId: {
        type: DataTypes.STRING,
        comment: 'ID do último terminal usado'
    },
    activatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    expiresAt: {
        type: DataTypes.DATE,
        comment: 'Data de expiração do cartão'
    },
    
    // PAGAMENTO
    paidAt: {
        type: DataTypes.DATE,
        comment: 'Data/hora do pagamento final'
    },
    paymentMethod: {
        type: DataTypes.ENUM('cash', 'card', 'pix', 'transfer'),
        comment: 'Método de pagamento usado no fechamento'
    },
    
    // FLAGS DE CONTROLE
    requiresPIN: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Requer PIN para transações'
    },
    pin: {
        type: DataTypes.STRING,
        comment: 'PIN criptografado'
    },
    allowNegativeBalance: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Permite saldo negativo'
    },
    isRotative: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Cartão rotativo (reutilizável)'
    },
    
    // AUDITORIA
    createdBy: {
        type: DataTypes.UUID,
        comment: 'ID do usuário que criou o cartão'
    },
    lastModifiedBy: {
        type: DataTypes.UUID,
        comment: 'ID do último usuário que modificou'
    },
    
    // OBSERVAÇÕES
    notes: {
        type: DataTypes.TEXT,
        comment: 'Observações sobre o cartão'
    }
});

module.exports = CashlessCard;