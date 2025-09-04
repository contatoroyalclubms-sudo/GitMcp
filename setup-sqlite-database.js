const { sequelize } = require('./models');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function setupDatabase() {
    console.log('🔧 Configurando banco de dados SQLite...\n');
    
    try {
        // Sincronizar todas as tabelas
        console.log('📊 Criando tabelas...');
        await sequelize.sync({ force: true });
        console.log('✅ Tabelas criadas com sucesso!\n');
        
        // Importar modelos
        const {
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
        } = require('./models');
        
        // Criar dados de teste
        console.log('📝 Inserindo dados de teste...\n');
        
        // 1. Criar usuários
        console.log('👤 Criando usuários...');
        const adminPassword = await bcrypt.hash('admin123', 10);
        const operatorPassword = await bcrypt.hash('operator123', 10);
        
        const admin = await User.create({
            id: uuidv4(),
            name: 'Admin Master',
            email: 'admin@meep.com',
            password: adminPassword,
            role: 'admin',
            active: true
        });
        
        const operator = await User.create({
            id: uuidv4(),
            name: 'Operador João',
            email: 'joao@meep.com',
            password: operatorPassword,
            role: 'operator',
            active: true
        });
        
        const manager = await User.create({
            id: uuidv4(),
            name: 'Gerente Maria',
            email: 'maria@meep.com',
            password: operatorPassword,
            role: 'manager',
            active: true
        });
        
        console.log('✅ Usuários criados!\n');
        
        // 2. Criar eventos
        console.log('🎉 Criando eventos...');
        const event1 = await Event.create({
            id: uuidv4(),
            name: 'Rock in Rio 2025',
            date: new Date('2025-09-15'),
            venue: 'Cidade do Rock',
            capacity: 100000,
            status: 'active',
            revenue: 0
        });
        
        const event2 = await Event.create({
            id: uuidv4(),
            name: 'Lollapalooza Brasil 2025',
            date: new Date('2025-03-22'),
            venue: 'Autódromo de Interlagos',
            capacity: 80000,
            status: 'planning',
            revenue: 0
        });
        
        console.log('✅ Eventos criados!\n');
        
        // 3. Criar produtos
        console.log('🍺 Criando produtos...');
        const products = await Promise.all([
            Product.create({
                id: uuidv4(),
                name: 'Cerveja Heineken 350ml',
                category: 'Bebidas',
                price: 15.00,
                cost: 8.00,
                stock: 1000,
                minStock: 100,
                barcode: '7896045505020',
                active: true
            }),
            Product.create({
                id: uuidv4(),
                name: 'Água Mineral 500ml',
                category: 'Bebidas',
                price: 8.00,
                cost: 3.00,
                stock: 2000,
                minStock: 200,
                barcode: '7896045505021',
                active: true
            }),
            Product.create({
                id: uuidv4(),
                name: 'Hambúrguer Artesanal',
                category: 'Alimentos',
                price: 35.00,
                cost: 15.00,
                stock: 500,
                minStock: 50,
                barcode: '7896045505022',
                active: true
            }),
            Product.create({
                id: uuidv4(),
                name: 'Batata Frita Porção',
                category: 'Alimentos',
                price: 25.00,
                cost: 10.00,
                stock: 500,
                minStock: 50,
                barcode: '7896045505023',
                active: true
            }),
            Product.create({
                id: uuidv4(),
                name: 'Camiseta Oficial do Evento',
                category: 'Merchandising',
                price: 80.00,
                cost: 30.00,
                stock: 200,
                minStock: 20,
                barcode: '7896045505024',
                active: true
            })
        ]);
        
        console.log('✅ Produtos criados!\n');
        
        // 4. Criar clientes
        console.log('👥 Criando clientes...');
        const clients = await Promise.all([
            Client.create({
                id: uuidv4(),
                name: 'Carlos Silva',
                document: '12345678901',
                email: 'carlos@email.com',
                phone: '11987654321',
                category: 'VIP',
                cashlessBalance: 500.00,
                loyaltyPoints: 1500,
                npsScore: 9
            }),
            Client.create({
                id: uuidv4(),
                name: 'Ana Santos',
                document: '23456789012',
                email: 'ana@email.com',
                phone: '11976543210',
                category: 'Premium',
                cashlessBalance: 250.00,
                loyaltyPoints: 800,
                npsScore: 8
            }),
            Client.create({
                id: uuidv4(),
                name: 'Pedro Oliveira',
                document: '34567890123',
                email: 'pedro@email.com',
                phone: '11965432109',
                category: 'Standard',
                cashlessBalance: 100.00,
                loyaltyPoints: 300,
                npsScore: 7
            })
        ]);
        
        console.log('✅ Clientes criados!\n');
        
        // 5. Criar cartões cashless
        console.log('💳 Criando cartões cashless...');
        for (let client of clients) {
            await CashlessCard.create({
                id: uuidv4(),
                cardNumber: `CARD${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                pin: Math.floor(1000 + Math.random() * 9000).toString(),
                balance: client.cashlessBalance,
                status: 'active',
                clientId: client.id,
                eventId: event1.id,
                clientName: client.name,
                clientCPF: client.document,
                clientPhone: client.phone
            });
        }
        
        console.log('✅ Cartões cashless criados!\n');
        
        // 6. Criar vendas de exemplo
        console.log('💰 Criando vendas de exemplo...');
        const sale1 = await Sale.create({
            id: uuidv4(),
            eventId: event1.id,
            clientId: clients[0].id,
            userId: operator.id,
            total: 115.00,
            discount: 0,
            paymentMethod: 'cashless',
            status: 'completed'
        });
        
        // Itens da venda
        await SaleItem.create({
            id: uuidv4(),
            saleId: sale1.id,
            productId: products[0].id,
            quantity: 2,
            unitPrice: 15.00,
            total: 30.00
        });
        
        await SaleItem.create({
            id: uuidv4(),
            saleId: sale1.id,
            productId: products[2].id,
            quantity: 2,
            unitPrice: 35.00,
            total: 70.00
        });
        
        await SaleItem.create({
            id: uuidv4(),
            saleId: sale1.id,
            productId: products[1].id,
            quantity: 2,
            unitPrice: 8.00,
            total: 15.00
        });
        
        console.log('✅ Vendas criadas!\n');
        
        // 7. Criar caixa registradora
        console.log('💵 Criando caixa registradora...');
        await CashRegister.create({
            id: uuidv4(),
            eventId: event1.id,
            userId: operator.id,
            openingBalance: 500.00,
            closingBalance: null,
            totalSales: 115.00,
            status: 'open',
            openedAt: new Date(),
            closedAt: null
        });
        
        console.log('✅ Caixa registradora criada!\n');
        
        // 8. Criar transações financeiras
        console.log('📊 Criando transações financeiras...');
        await Transaction.create({
            id: uuidv4(),
            type: 'income',
            category: 'Vendas',
            amount: 115.00,
            description: 'Venda PDV #1',
            eventId: event1.id,
            status: 'completed',
            paidDate: new Date()
        });
        
        await Transaction.create({
            id: uuidv4(),
            type: 'expense',
            category: 'Fornecedores',
            amount: 5000.00,
            description: 'Compra de bebidas',
            eventId: event1.id,
            status: 'pending',
            dueDate: new Date('2025-01-15')
        });
        
        console.log('✅ Transações criadas!\n');
        
        // 9. Criar movimentações de estoque
        console.log('📦 Criando movimentações de estoque...');
        for (let product of products) {
            await Inventory.create({
                id: uuidv4(),
                productId: product.id,
                type: 'entry',
                quantity: product.stock,
                reason: 'Estoque inicial',
                userId: admin.id
            });
        }
        
        console.log('✅ Movimentações de estoque criadas!\n');
        
        // 10. Criar campanhas de marketing
        console.log('📧 Criando campanhas de marketing...');
        await Campaign.create({
            id: uuidv4(),
            name: 'Lançamento Rock in Rio 2025',
            type: 'email',
            content: 'Ingressos disponíveis! Garanta já o seu!',
            targetAudience: { category: 'VIP' },
            status: 'sent',
            scheduledDate: new Date('2025-01-01'),
            sentCount: 1500,
            openRate: 65.5,
            conversionRate: 12.3
        });
        
        await Campaign.create({
            id: uuidv4(),
            name: 'Promoção Early Bird',
            type: 'whatsapp',
            content: '30% de desconto para os primeiros 1000 ingressos!',
            targetAudience: { category: 'Premium' },
            status: 'scheduled',
            scheduledDate: new Date('2025-02-01'),
            sentCount: 0,
            openRate: 0,
            conversionRate: 0
        });
        
        console.log('✅ Campanhas criadas!\n');
        
        // 11. Criar configurações do sistema
        console.log('⚙️ Criando configurações do sistema...');
        await SystemConfig.create({
            key: 'app_name',
            value: 'MEEP Enterprise Event Platform',
            type: 'string'
        });
        
        await SystemConfig.create({
            key: 'tax_rate',
            value: '0.10',
            type: 'number'
        });
        
        await SystemConfig.create({
            key: 'currency',
            value: 'BRL',
            type: 'string'
        });
        
        await SystemConfig.create({
            key: 'max_discount',
            value: '0.30',
            type: 'number'
        });
        
        console.log('✅ Configurações criadas!\n');
        
        console.log('🎉 BANCO DE DADOS CONFIGURADO COM SUCESSO!\n');
        console.log('📋 Resumo dos dados criados:');
        console.log('   - 3 Usuários (admin, manager, operator)');
        console.log('   - 2 Eventos');
        console.log('   - 5 Produtos');
        console.log('   - 3 Clientes');
        console.log('   - 3 Cartões Cashless');
        console.log('   - 1 Venda com 3 itens');
        console.log('   - 1 Caixa registradora aberta');
        console.log('   - 2 Transações financeiras');
        console.log('   - 5 Movimentações de estoque');
        console.log('   - 2 Campanhas de marketing');
        console.log('   - 4 Configurações do sistema\n');
        
        console.log('🔑 Credenciais de acesso:');
        console.log('   Admin: admin@meep.com / admin123');
        console.log('   Manager: maria@meep.com / operator123');
        console.log('   Operator: joao@meep.com / operator123\n');
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao configurar banco de dados:', error);
        return false;
    }
}

// Executar se for chamado diretamente
if (require.main === module) {
    setupDatabase().then(success => {
        if (success) {
            console.log('✨ Sistema pronto para uso!');
            process.exit(0);
        } else {
            process.exit(1);
        }
    });
}

module.exports = setupDatabase;