const { Sequelize } = require('sequelize');
require('dotenv').config();

// Determina qual banco de dados usar baseado no ambiente
const isDevelopment = process.env.NODE_ENV !== 'production';
const usePostgres = process.env.DB_TYPE === 'postgres';

let sequelize;

if (usePostgres) {
    // Configuração para PostgreSQL (Docker/Production)
    sequelize = new Sequelize({
        dialect: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'gitmecp',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        logging: isDevelopment ? console.log : false,
        pool: {
            max: 20,
            min: 5,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            ssl: process.env.DB_SSL === 'true' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        }
    });
} else {
    // Configuração para SQLite (Development)
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: process.env.DB_STORAGE || './database.sqlite',
        logging: isDevelopment ? console.log : false,
        pool: {
            max: 20,
            min: 5,
            acquire: 30000,
            idle: 10000
        }
    });
}

// Testa a conexão ao iniciar
sequelize.authenticate()
    .then(() => {
        console.log(`✅ Database connected successfully (${usePostgres ? 'PostgreSQL' : 'SQLite'})`);
    })
    .catch(err => {
        console.error('❌ Unable to connect to database:', err);
    });

module.exports = sequelize;