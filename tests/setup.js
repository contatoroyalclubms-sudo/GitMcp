// Test Setup Configuration
require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DB_TYPE = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.LOG_LEVEL = 'error';

const sequelize = require('../config/database');

// Global test setup
beforeAll(async () => {
  try {
    // Sync database before tests
    await sequelize.sync({ force: true });
    console.log('Test database synced');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
});

// Clean up after each test
afterEach(async () => {
  // Clear all tables but keep structure
  const models = Object.values(sequelize.models);
  for (const model of models) {
    await model.destroy({ truncate: true, force: true });
  }
});

// Global teardown
afterAll(async () => {
  try {
    await sequelize.close();
    console.log('Test database connection closed');
  } catch (error) {
    console.error('Error closing test database:', error);
  }
});

// Suppress console logs during tests
if (process.env.NODE_ENV === 'test') {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
}

// Global test helpers
global.testHelpers = {
  // Generate test JWT token
  generateToken: (userId = 1) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { id: userId, email: 'test@example.com' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },

  // Create test user
  createTestUser: async () => {
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    return User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'admin'
    });
  },

  // Create test event
  createTestEvent: async () => {
    const Event = require('../models/Event');
    return Event.create({
      name: 'Test Event',
      description: 'Test event description',
      date: new Date('2024-12-31'),
      location: 'Test Location',
      capacity: 100,
      ticketPrice: 50.00
    });
  }
};

module.exports = global.testHelpers;