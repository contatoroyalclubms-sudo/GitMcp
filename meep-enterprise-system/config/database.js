const { Sequelize } = require('sequelize');
require('dotenv').config();

// Usando SQLite para desenvolvimento local sem necessidade de PostgreSQL instalado
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 20,
        min: 5,
        acquire: 30000,
        idle: 10000
    }
});

module.exports = sequelize;