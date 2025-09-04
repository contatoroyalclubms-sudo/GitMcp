/**
 * SETUP COMPLETO DO BANCO DE DADOS SQLite
 * Cria todas as tabelas e popula com dados de teste
 */

const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Configurar SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

// ================ DEFINIR TODOS OS MODELOS ================

// 1. Users
const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: 'user' },
    active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// 2. Events
const Event = sequelize.define('Event', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    date: DataTypes.DATE,
    location: DataTypes.STRING,
    capacity: DataTypes.INTEGER,
    status: { type: DataTypes.STRING, defaultValue: 'active' }
});

// 3. Clients
const Client = sequelize.define('Client', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true },
    phone: DataTypes.STRING,
    document: { type: DataTypes.STRING, unique: true },
    type: { type: DataTypes.STRING, defaultValue: 'regular' }
});

// 4. Products
const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    category: DataTypes.STRING,
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// 5. Sales
const Sale = sequelize.define('Sale', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    clientId: DataTypes.INTEGER,
    eventId: DataTypes.INTEGER,
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    paymentMethod: DataTypes.STRING,
    status: { type: DataTypes.STRING, defaultValue: 'completed' }
});

// 6. CashlessCards
const CashlessCard = sequelize.define('CashlessCard', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cardNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
    clientId: DataTypes.INTEGER,
    balance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    status: { type: DataTypes.STRING, defaultValue: 'active' }
});

// 7. Transactions
const Transaction = sequelize.define('Transaction', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: DataTypes.STRING,
    amount: DataTypes.DECIMAL(10, 2),
    cardId: DataTypes.INTEGER,
    saleId: DataTypes.INTEGER,
    status: { type: DataTypes.STRING, defaultValue: 'completed' }
});

// 8. Inventory
const Inventory = sequelize.define('Inventory', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    productId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    minStock: DataTypes.INTEGER,
    location: DataTypes.STRING
});

// 9. TeamMembers
const TeamMember = sequelize.define('TeamMember', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true },
    role: DataTypes.STRING,
    department: DataTypes.STRING,
    active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// 10. Campaigns
const Campaign = sequelize.define('Campaign', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    budget: DataTypes.DECIMAL(10, 2),
    status: { type: DataTypes.STRING, defaultValue: 'active' }
});

// 11. SystemConfigs
const SystemConfig = sequelize.define('SystemConfig', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    key: { type: DataTypes.STRING, unique: true, allowNull: false },
    value: DataTypes.TEXT,
    category: DataTypes.STRING,
    description: DataTypes.TEXT
});

// ================ DEFINIR ASSOCIAÇÕES ================

// Sales relationships
Sale.belongsTo(Client, { foreignKey: 'clientId' });
Sale.belongsTo(Event, { foreignKey: 'eventId' });
Client.hasMany(Sale, { foreignKey: 'clientId' });
Event.hasMany(Sale, { foreignKey: 'eventId' });

// CashlessCard relationships
CashlessCard.belongsTo(Client, { foreignKey: 'clientId' });
Client.hasMany(CashlessCard, { foreignKey: 'clientId' });

// Transaction relationships
Transaction.belongsTo(CashlessCard, { foreignKey: 'cardId' });
Transaction.belongsTo(Sale, { foreignKey: 'saleId' });

// Inventory relationships
Inventory.belongsTo(Product, { foreignKey: 'productId' });
Product.hasOne(Inventory, { foreignKey: 'productId' });

// ================ FUNÇÃO PRINCIPAL ================

async function setupDatabase() {
    console.log('🔧 Iniciando configuração do banco de dados SQLite...\n');
    
    try {
        // 1. Conectar ao banco
        await sequelize.authenticate();
        console.log('✅ Conectado ao SQLite');
        
        // 2. Recriar todas as tabelas
        await sequelize.sync({ force: true });
        console.log('✅ Tabelas criadas');
        
        // 3. Popular com dados de teste
        console.log('\n📝 Populando dados de teste...');
        
        // Criar usuários
        const adminPassword = await bcrypt.hash('admin123', 10);
        const userPassword = await bcrypt.hash('user123', 10);
        
        await User.bulkCreate([
            { name: 'Admin', email: 'admin@meep.com', password: adminPassword, role: 'admin' },
            { name: 'User', email: 'user@meep.com', password: userPassword, role: 'user' },
            { name: 'Manager', email: 'manager@meep.com', password: adminPassword, role: 'manager' }
        ]);
        console.log('  ✅ Usuários criados');
        
        // Criar eventos
        await Event.bulkCreate([
            { 
                name: 'Rock Festival 2025', 
                description: 'O maior festival de rock do ano',
                date: new Date('2025-07-15'),
                location: 'Arena Central',
                capacity: 50000
            },
            { 
                name: 'Tech Conference', 
                description: 'Conferência de tecnologia e inovação',
                date: new Date('2025-05-20'),
                location: 'Centro de Convenções',
                capacity: 5000
            },
            { 
                name: 'Food Festival', 
                description: 'Festival gastronômico internacional',
                date: new Date('2025-06-10'),
                location: 'Parque da Cidade',
                capacity: 20000
            }
        ]);
        console.log('  ✅ Eventos criados');
        
        // Criar clientes
        await Client.bulkCreate([
            { name: 'João Silva', email: 'joao@gmail.com', phone: '11999999999', document: '11111111111', type: 'vip' },
            { name: 'Maria Santos', email: 'maria@gmail.com', phone: '11888888888', document: '22222222222', type: 'regular' },
            { name: 'Pedro Costa', email: 'pedro@gmail.com', phone: '11777777777', document: '33333333333', type: 'premium' },
            { name: 'Ana Lima', email: 'ana@gmail.com', phone: '11666666666', document: '44444444444', type: 'regular' },
            { name: 'Carlos Souza', email: 'carlos@gmail.com', phone: '11555555555', document: '55555555555', type: 'vip' }
        ]);
        console.log('  ✅ Clientes criados');
        
        // Criar produtos
        await Product.bulkCreate([
            { name: 'Coca-Cola', description: 'Refrigerante 350ml', price: 5.00, category: 'Bebidas', stock: 1000 },
            { name: 'Água Mineral', description: 'Garrafa 500ml', price: 3.00, category: 'Bebidas', stock: 2000 },
            { name: 'Cerveja', description: 'Lata 350ml', price: 8.00, category: 'Bebidas', stock: 5000 },
            { name: 'Hambúrguer', description: 'Artesanal com queijo', price: 25.00, category: 'Lanches', stock: 500 },
            { name: 'Hot Dog', description: 'Completo especial', price: 15.00, category: 'Lanches', stock: 800 },
            { name: 'Batata Frita', description: 'Porção grande', price: 12.00, category: 'Petiscos', stock: 600 },
            { name: 'Pizza Slice', description: 'Fatia de pizza', price: 18.00, category: 'Lanches', stock: 400 },
            { name: 'Pipoca', description: 'Balde grande', price: 10.00, category: 'Petiscos', stock: 1000 }
        ]);
        console.log('  ✅ Produtos criados');
        
        // Criar vendas
        await Sale.bulkCreate([
            { clientId: 1, eventId: 1, total: 150.00, paymentMethod: 'credit_card' },
            { clientId: 2, eventId: 1, total: 85.00, paymentMethod: 'cash' },
            { clientId: 3, eventId: 2, total: 200.00, paymentMethod: 'debit_card' },
            { clientId: 4, eventId: 3, total: 95.00, paymentMethod: 'pix' },
            { clientId: 5, eventId: 1, total: 320.00, paymentMethod: 'credit_card' }
        ]);
        console.log('  ✅ Vendas criadas');
        
        // Criar cartões cashless
        await CashlessCard.bulkCreate([
            { cardNumber: 'CARD001', clientId: 1, balance: 500.00 },
            { cardNumber: 'CARD002', clientId: 2, balance: 200.00 },
            { cardNumber: 'CARD003', clientId: 3, balance: 1000.00 },
            { cardNumber: 'CARD004', clientId: 4, balance: 50.00 },
            { cardNumber: 'CARD005', clientId: 5, balance: 750.00 }
        ]);
        console.log('  ✅ Cartões cashless criados');
        
        // Criar inventário
        const products = await Product.findAll();
        const inventoryData = products.map(p => ({
            productId: p.id,
            quantity: p.stock,
            minStock: Math.floor(p.stock * 0.2),
            location: 'Armazém Central'
        }));
        await Inventory.bulkCreate(inventoryData);
        console.log('  ✅ Inventário criado');
        
        // Criar membros da equipe
        await TeamMember.bulkCreate([
            { name: 'Roberto Manager', email: 'roberto@meep.com', role: 'Gerente', department: 'Administração' },
            { name: 'Sandra Vendas', email: 'sandra@meep.com', role: 'Vendedor', department: 'Vendas' },
            { name: 'Paulo TI', email: 'paulo@meep.com', role: 'Analista', department: 'Tecnologia' },
            { name: 'Lucia RH', email: 'lucia@meep.com', role: 'Coordenador', department: 'Recursos Humanos' },
            { name: 'Marco Financeiro', email: 'marco@meep.com', role: 'Analista', department: 'Financeiro' }
        ]);
        console.log('  ✅ Equipe criada');
        
        // Criar campanhas
        await Campaign.bulkCreate([
            { 
                name: 'Summer Sale 2025', 
                description: 'Promoção de verão com 30% de desconto',
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-03-31'),
                budget: 50000.00
            },
            { 
                name: 'Early Bird', 
                description: 'Desconto para compras antecipadas',
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-12-31'),
                budget: 20000.00
            },
            { 
                name: 'VIP Experience', 
                description: 'Pacotes exclusivos para clientes VIP',
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-12-31'),
                budget: 100000.00
            }
        ]);
        console.log('  ✅ Campanhas criadas');
        
        // Criar configurações do sistema
        await SystemConfig.bulkCreate([
            { key: 'company_name', value: 'MEEP Enterprise', category: 'system', description: 'Nome da empresa' },
            { key: 'version', value: '3.0.0', category: 'system', description: 'Versão do sistema' },
            { key: 'max_users', value: '10000', category: 'limits', description: 'Máximo de usuários' },
            { key: 'currency', value: 'BRL', category: 'finance', description: 'Moeda padrão' },
            { key: 'timezone', value: 'America/Sao_Paulo', category: 'system', description: 'Fuso horário' }
        ]);
        console.log('  ✅ Configurações criadas');
        
        // Criar transações
        await Transaction.bulkCreate([
            { type: 'recharge', amount: 100.00, cardId: 1, status: 'completed' },
            { type: 'payment', amount: 25.00, cardId: 1, saleId: 1, status: 'completed' },
            { type: 'recharge', amount: 200.00, cardId: 2, status: 'completed' },
            { type: 'payment', amount: 15.00, cardId: 2, saleId: 2, status: 'completed' },
            { type: 'refund', amount: 10.00, cardId: 3, status: 'completed' }
        ]);
        console.log('  ✅ Transações criadas');
        
        console.log('\n✅ BANCO DE DADOS CONFIGURADO COM SUCESSO!');
        console.log('\n📊 Resumo:');
        console.log('  - Usuários: 3');
        console.log('  - Eventos: 3');
        console.log('  - Clientes: 5');
        console.log('  - Produtos: 8');
        console.log('  - Vendas: 5');
        console.log('  - Cartões Cashless: 5');
        console.log('  - Equipe: 5');
        console.log('  - Campanhas: 3');
        
        console.log('\n🔐 Credenciais de acesso:');
        console.log('  Admin: admin@meep.com / admin123');
        console.log('  User: user@meep.com / user123');
        
        console.log('\n🚀 Sistema pronto para uso!');
        
    } catch (error) {
        console.error('❌ Erro ao configurar banco:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Executar
setupDatabase();