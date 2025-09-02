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
    Campaign 
} = require('../models');
const { hashPassword } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');
        
        const adminPassword = await hashPassword('admin123');
        const admin = await User.create({
            name: 'Administrator',
            email: 'admin@meep.com',
            password: adminPassword,
            role: 'admin',
            active: true
        });
        console.log('✅ Admin user created');
        
        const operatorPassword = await hashPassword('operator123');
        const operator = await User.create({
            name: 'Operator',
            email: 'operator@meep.com',
            password: operatorPassword,
            role: 'operator',
            active: true
        });
        console.log('✅ Operator user created');
        
        const events = await Event.bulkCreate([
            {
                name: 'Summer Music Festival',
                date: new Date('2025-02-15'),
                venue: 'Central Park',
                capacity: 5000,
                status: 'active'
            },
            {
                name: 'Tech Conference 2025',
                date: new Date('2025-03-20'),
                venue: 'Convention Center',
                capacity: 2000,
                status: 'planning'
            },
            {
                name: 'Food & Wine Expo',
                date: new Date('2025-04-10'),
                venue: 'Exhibition Hall',
                capacity: 3000,
                status: 'planning'
            }
        ]);
        console.log('✅ Events created');
        
        const clients = await Client.bulkCreate([
            {
                name: 'John Doe',
                document: '12345678900',
                email: 'john@example.com',
                phone: '11999999999',
                category: 'VIP',
                cashlessBalance: 500,
                loyaltyPoints: 1500
            },
            {
                name: 'Jane Smith',
                document: '98765432100',
                email: 'jane@example.com',
                phone: '11888888888',
                category: 'Premium',
                cashlessBalance: 250,
                loyaltyPoints: 800
            },
            {
                name: 'Bob Johnson',
                document: '55555555555',
                email: 'bob@example.com',
                phone: '11777777777',
                category: 'Standard',
                cashlessBalance: 100,
                loyaltyPoints: 200
            }
        ]);
        console.log('✅ Clients created');
        
        const products = await Product.bulkCreate([
            {
                name: 'Coca-Cola',
                category: 'Bebidas',
                price: 8.00,
                cost: 3.00,
                stock: 500,
                minStock: 50,
                barcode: '7891234567890'
            },
            {
                name: 'Heineken',
                category: 'Bebidas',
                price: 12.00,
                cost: 5.00,
                stock: 300,
                minStock: 30,
                barcode: '7891234567891'
            },
            {
                name: 'Hambúrguer Gourmet',
                category: 'Comidas',
                price: 35.00,
                cost: 15.00,
                stock: 100,
                minStock: 20,
                barcode: '7891234567892'
            },
            {
                name: 'Batata Frita',
                category: 'Comidas',
                price: 18.00,
                cost: 6.00,
                stock: 150,
                minStock: 25,
                barcode: '7891234567893'
            },
            {
                name: 'Ingresso VIP',
                category: 'Ingressos',
                price: 250.00,
                cost: 50.00,
                stock: 100,
                minStock: 10,
                barcode: '7891234567894'
            },
            {
                name: 'Camiseta Oficial',
                category: 'Merchandise',
                price: 60.00,
                cost: 20.00,
                stock: 200,
                minStock: 30,
                barcode: '7891234567895'
            }
        ]);
        console.log('✅ Products created');
        
        const sales = [];
        const saleItems = [];
        
        for (let i = 0; i < 20; i++) {
            const sale = await Sale.create({
                eventId: events[Math.floor(Math.random() * events.length)].id,
                clientId: clients[Math.floor(Math.random() * clients.length)].id,
                userId: Math.random() > 0.5 ? admin.id : operator.id,
                total: Math.floor(Math.random() * 500) + 50,
                discount: Math.floor(Math.random() * 50),
                paymentMethod: ['cash', 'card', 'pix', 'cashless'][Math.floor(Math.random() * 4)],
                status: 'completed'
            });
            
            const itemCount = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < itemCount; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;
                
                await SaleItem.create({
                    saleId: sale.id,
                    productId: product.id,
                    quantity,
                    unitPrice: product.price,
                    total: product.price * quantity
                });
            }
        }
        console.log('✅ Sales and sale items created');
        
        await Transaction.bulkCreate([
            {
                type: 'income',
                category: 'Vendas',
                amount: 5000,
                description: 'Vendas do dia',
                eventId: events[0].id,
                status: 'completed',
                paidDate: new Date()
            },
            {
                type: 'expense',
                category: 'Fornecedores',
                amount: 2000,
                description: 'Compra de bebidas',
                eventId: events[0].id,
                status: 'pending',
                dueDate: new Date('2025-02-20')
            },
            {
                type: 'income',
                category: 'Ingressos',
                amount: 10000,
                description: 'Venda antecipada de ingressos',
                eventId: events[1].id,
                status: 'completed',
                paidDate: new Date()
            }
        ]);
        console.log('✅ Transactions created');
        
        await Campaign.bulkCreate([
            {
                name: 'Summer Festival Launch',
                type: 'email',
                content: 'Join us for the biggest summer festival!',
                targetAudience: { category: 'all' },
                status: 'sent',
                sentCount: 1500,
                openRate: 35.5,
                conversionRate: 12.3
            },
            {
                name: 'VIP Early Bird',
                type: 'sms',
                content: 'Exclusive VIP tickets now available!',
                targetAudience: { category: 'VIP' },
                status: 'scheduled',
                scheduledDate: new Date('2025-02-01')
            }
        ]);
        console.log('✅ Campaigns created');
        
        console.log('✅ Database seeding completed successfully');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;