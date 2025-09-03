const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    transactionCode: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('sale', 'refund', 'cashless_recharge', 'cashless_purchase', 'cashless_checkout'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'failed'),
        defaultValue: 'pending'
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    discount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    tax: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.STRING
    },
    cashierId: {
        type: DataTypes.INTEGER
    },
    posTerminalId: {
        type: DataTypes.STRING
    },
    clientId: {
        type: DataTypes.INTEGER
    },
    eventId: {
        type: DataTypes.INTEGER
    },
    fiscalNote: {
        type: DataTypes.TEXT
    },
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
    }
}, {
    timestamps: true
});

const TransactionItem = sequelize.define('TransactionItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    transactionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    discount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    timestamps: true
});

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    transactionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    method: {
        type: DataTypes.ENUM('cash', 'credit', 'debit', 'pix', 'voucher', 'cashless'),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'declined', 'cancelled'),
        defaultValue: 'pending'
    },
    authorizationCode: {
        type: DataTypes.STRING
    },
    cardLastDigits: {
        type: DataTypes.STRING
    },
    pixKey: {
        type: DataTypes.STRING
    },
    voucherCode: {
        type: DataTypes.STRING
    },
    cashlessCardNumber: {
        type: DataTypes.STRING
    },
    changeAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
    }
}, {
    timestamps: true
});

// Associations
Transaction.hasMany(TransactionItem, { foreignKey: 'transactionId' });
TransactionItem.belongsTo(Transaction, { foreignKey: 'transactionId' });

Transaction.hasMany(Payment, { foreignKey: 'transactionId' });
Payment.belongsTo(Transaction, { foreignKey: 'transactionId' });

module.exports = { Transaction, TransactionItem, Payment };