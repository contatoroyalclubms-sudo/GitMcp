const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'manager', 'operator', 'viewer'),
        defaultValue: 'operator'
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

const Client = sequelize.define('Client', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    document: {
        type: DataTypes.STRING,
        unique: true
    },
    email: {
        type: DataTypes.STRING
    },
    phone: {
        type: DataTypes.STRING
    },
    category: {
        type: DataTypes.ENUM('VIP', 'Premium', 'Standard'),
        defaultValue: 'Standard'
    },
    cashlessBalance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    loyaltyPoints: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    npsScore: {
        type: DataTypes.INTEGER
    }
});

const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    venue: {
        type: DataTypes.STRING
    },
    capacity: {
        type: DataTypes.INTEGER
    },
    status: {
        type: DataTypes.ENUM('planning', 'active', 'completed', 'cancelled'),
        defaultValue: 'planning'
    },
    revenue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    }
});

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2)
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    minStock: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    barcode: {
        type: DataTypes.STRING,
        unique: true
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

const Sale = sequelize.define('Sale', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    eventId: {
        type: DataTypes.UUID,
        references: {
            model: Event,
            key: 'id'
        }
    },
    clientId: {
        type: DataTypes.UUID,
        references: {
            model: Client,
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.UUID,
        references: {
            model: User,
            key: 'id'
        }
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    discount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    paymentMethod: {
        type: DataTypes.ENUM('cash', 'card', 'pix', 'cashless'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
        defaultValue: 'pending'
    }
});

const SaleItem = sequelize.define('SaleItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    saleId: {
        type: DataTypes.UUID,
        references: {
            model: Sale,
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.UUID,
        references: {
            model: Product,
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
});

const Inventory = sequelize.define('Inventory', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    productId: {
        type: DataTypes.UUID,
        references: {
            model: Product,
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('entry', 'exit', 'adjustment'),
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reason: {
        type: DataTypes.STRING
    },
    userId: {
        type: DataTypes.UUID,
        references: {
            model: User,
            key: 'id'
        }
    }
});

const CashRegister = sequelize.define('CashRegister', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    eventId: {
        type: DataTypes.UUID,
        references: {
            model: Event,
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.UUID,
        references: {
            model: User,
            key: 'id'
        }
    },
    openingBalance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    closingBalance: {
        type: DataTypes.DECIMAL(10, 2)
    },
    totalSales: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('open', 'closed'),
        defaultValue: 'open'
    },
    openedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    closedAt: {
        type: DataTypes.DATE
    }
});

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    type: {
        type: DataTypes.ENUM('income', 'expense', 'transfer'),
        allowNull: false
    },
    category: {
        type: DataTypes.STRING
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    eventId: {
        type: DataTypes.UUID,
        references: {
            model: Event,
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
        defaultValue: 'pending'
    },
    dueDate: {
        type: DataTypes.DATE
    },
    paidDate: {
        type: DataTypes.DATE
    }
});

const Campaign = sequelize.define('Campaign', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('email', 'sms', 'push', 'whatsapp'),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT
    },
    targetAudience: {
        type: DataTypes.JSON
    },
    status: {
        type: DataTypes.ENUM('draft', 'scheduled', 'sent', 'cancelled'),
        defaultValue: 'draft'
    },
    scheduledDate: {
        type: DataTypes.DATE
    },
    sentCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    openRate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0
    },
    conversionRate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0
    }
});

Event.hasMany(Sale, { foreignKey: 'eventId' });
Sale.belongsTo(Event, { foreignKey: 'eventId' });

Client.hasMany(Sale, { foreignKey: 'clientId' });
Sale.belongsTo(Client, { foreignKey: 'clientId' });

User.hasMany(Sale, { foreignKey: 'userId' });
Sale.belongsTo(User, { foreignKey: 'userId' });

Sale.hasMany(SaleItem, { foreignKey: 'saleId' });
SaleItem.belongsTo(Sale, { foreignKey: 'saleId' });

Product.hasMany(SaleItem, { foreignKey: 'productId' });
SaleItem.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(Inventory, { foreignKey: 'productId' });
Inventory.belongsTo(Product, { foreignKey: 'productId' });

Event.hasMany(CashRegister, { foreignKey: 'eventId' });
CashRegister.belongsTo(Event, { foreignKey: 'eventId' });

User.hasMany(CashRegister, { foreignKey: 'userId' });
CashRegister.belongsTo(User, { foreignKey: 'userId' });

Event.hasMany(Transaction, { foreignKey: 'eventId' });
Transaction.belongsTo(Event, { foreignKey: 'eventId' });

// Import new models
const SystemConfig = require('./SystemConfig');
const CashlessCard = require('./CashlessCard');

// Add associations for CashlessCard
CashlessCard.belongsTo(Client, { foreignKey: 'clientId' });
Client.hasMany(CashlessCard, { foreignKey: 'clientId' });

CashlessCard.belongsTo(Event, { foreignKey: 'eventId' });
Event.hasMany(CashlessCard, { foreignKey: 'eventId' });

module.exports = {
    sequelize,
    User,
    Client,
    Event,
    Product,
    Sale,
    SaleItem,
    Inventory,
    CashRegister,
    Transaction,
    Campaign,
    SystemConfig,
    CashlessCard
};