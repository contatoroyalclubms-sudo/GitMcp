/**
 * SETUP SIMPLIFICADO DO BANCO SQLite
 * Versão sem associações complexas para evitar erros
 */

const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Deletar banco antigo se existir
if (fs.existsSync('./database.sqlite')) {
    fs.unlinkSync('./database.sqlite');
    console.log('🗑️ Banco antigo deletado');
}

// Configurar novo SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false,
    define: {
        timestamps: true
    }
});

async function setupDatabase() {
    console.log('🔧 Criando novo banco de dados SQLite...\n');
    
    try {
        // Conectar
        await sequelize.authenticate();
        console.log('✅ Conectado ao SQLite');
        
        // Criar tabelas usando SQL direto (mais confiável)
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                active BOOLEAN DEFAULT 1,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabela Users criada');
        
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS Events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                date DATETIME,
                location VARCHAR(255),
                capacity INTEGER,
                status VARCHAR(50) DEFAULT 'active',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabela Events criada');
        
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS Clients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE,
                phone VARCHAR(50),
                document VARCHAR(50) UNIQUE,
                type VARCHAR(50) DEFAULT 'regular',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabela Clients criada');
        
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS Products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                category VARCHAR(100),
                stock INTEGER DEFAULT 0,
                active BOOLEAN DEFAULT 1,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabela Products criada');
        
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS Sales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                clientId INTEGER,
                eventId INTEGER,
                total DECIMAL(10,2) NOT NULL,
                paymentMethod VARCHAR(50),
                status VARCHAR(50) DEFAULT 'completed',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabela Sales criada');
        
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS CashlessCards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cardNumber VARCHAR(100) UNIQUE NOT NULL,
                clientId INTEGER,
                balance DECIMAL(10,2) DEFAULT 0,
                status VARCHAR(50) DEFAULT 'active',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabela CashlessCards criada');
        
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS TeamMembers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE,
                role VARCHAR(100),
                department VARCHAR(100),
                active BOOLEAN DEFAULT 1,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabela TeamMembers criada');
        
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS Campaigns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                startDate DATETIME,
                endDate DATETIME,
                budget DECIMAL(10,2),
                status VARCHAR(50) DEFAULT 'active',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabela Campaigns criada');
        
        console.log('\n📝 Populando dados de teste...');
        
        // Popular Users
        const adminPassword = await bcrypt.hash('admin123', 10);
        await sequelize.query(`
            INSERT INTO Users (name, email, password, role) VALUES
            ('Admin', 'admin@meep.com', '${adminPassword}', 'admin'),
            ('User', 'user@meep.com', '${adminPassword}', 'user'),
            ('Manager', 'manager@meep.com', '${adminPassword}', 'manager')
        `);
        console.log('  ✅ Usuários criados');
        
        // Popular Events
        await sequelize.query(`
            INSERT INTO Events (name, description, date, location, capacity) VALUES
            ('Rock Festival 2025', 'O maior festival de rock do ano', '2025-07-15', 'Arena Central', 50000),
            ('Tech Conference', 'Conferência de tecnologia', '2025-05-20', 'Centro de Convenções', 5000),
            ('Food Festival', 'Festival gastronômico', '2025-06-10', 'Parque da Cidade', 20000)
        `);
        console.log('  ✅ Eventos criados');
        
        // Popular Clients - com emails únicos
        await sequelize.query(`
            INSERT INTO Clients (name, email, phone, document, type) VALUES
            ('João Silva', 'joao.silva@email.com', '11999999999', '11111111111', 'vip'),
            ('Maria Santos', 'maria.santos@email.com', '11888888888', '22222222222', 'regular'),
            ('Pedro Costa', 'pedro.costa@email.com', '11777777777', '33333333333', 'premium'),
            ('Ana Lima', 'ana.lima@email.com', '11666666666', '44444444444', 'regular'),
            ('Carlos Souza', 'carlos.souza@email.com', '11555555555', '55555555555', 'vip')
        `);
        console.log('  ✅ Clientes criados');
        
        // Popular Products
        await sequelize.query(`
            INSERT INTO Products (name, description, price, category, stock) VALUES
            ('Coca-Cola', 'Refrigerante 350ml', 5.00, 'Bebidas', 1000),
            ('Água Mineral', 'Garrafa 500ml', 3.00, 'Bebidas', 2000),
            ('Cerveja', 'Lata 350ml', 8.00, 'Bebidas', 5000),
            ('Hambúrguer', 'Artesanal com queijo', 25.00, 'Lanches', 500),
            ('Hot Dog', 'Completo especial', 15.00, 'Lanches', 800),
            ('Batata Frita', 'Porção grande', 12.00, 'Petiscos', 600)
        `);
        console.log('  ✅ Produtos criados');
        
        // Popular Sales
        await sequelize.query(`
            INSERT INTO Sales (clientId, eventId, total, paymentMethod) VALUES
            (1, 1, 150.00, 'credit_card'),
            (2, 1, 85.00, 'cash'),
            (3, 2, 200.00, 'debit_card'),
            (4, 3, 95.00, 'pix'),
            (5, 1, 320.00, 'credit_card')
        `);
        console.log('  ✅ Vendas criadas');
        
        // Popular CashlessCards
        await sequelize.query(`
            INSERT INTO CashlessCards (cardNumber, clientId, balance) VALUES
            ('CARD001', 1, 500.00),
            ('CARD002', 2, 200.00),
            ('CARD003', 3, 1000.00),
            ('CARD004', 4, 50.00),
            ('CARD005', 5, 750.00)
        `);
        console.log('  ✅ Cartões cashless criados');
        
        // Popular TeamMembers
        await sequelize.query(`
            INSERT INTO TeamMembers (name, email, role, department) VALUES
            ('Roberto Manager', 'roberto@meep.com', 'Gerente', 'Administração'),
            ('Sandra Vendas', 'sandra@meep.com', 'Vendedor', 'Vendas'),
            ('Paulo TI', 'paulo@meep.com', 'Analista', 'Tecnologia')
        `);
        console.log('  ✅ Equipe criada');
        
        // Popular Campaigns
        await sequelize.query(`
            INSERT INTO Campaigns (name, description, startDate, endDate, budget) VALUES
            ('Summer Sale 2025', 'Promoção de verão', '2025-01-01', '2025-03-31', 50000.00),
            ('Early Bird', 'Desconto antecipado', '2025-01-01', '2025-12-31', 20000.00),
            ('VIP Experience', 'Pacotes VIP', '2025-01-01', '2025-12-31', 100000.00)
        `);
        console.log('  ✅ Campanhas criadas');
        
        console.log('\n✅ BANCO DE DADOS CONFIGURADO COM SUCESSO!');
        console.log('\n🔐 Credenciais de acesso:');
        console.log('  Admin: admin@meep.com / admin123');
        console.log('  User: user@meep.com / admin123');
        console.log('\n🚀 Sistema pronto para uso!');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await sequelize.close();
    }
}

// Executar
setupDatabase();