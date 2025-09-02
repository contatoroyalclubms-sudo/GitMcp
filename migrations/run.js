const sequelize = require('../config/database');
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

async function runMigrations() {
    try {
        console.log('🔄 Starting database migrations...');
        
        await sequelize.authenticate();
        console.log('✅ Database connection established');
        
        await sequelize.sync({ force: process.env.NODE_ENV === 'development' });
        console.log('✅ All models synchronized');
        
        console.log('✅ Migrations completed successfully');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    runMigrations();
}

module.exports = runMigrations;