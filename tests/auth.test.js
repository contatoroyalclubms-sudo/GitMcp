const request = require('supertest');
const app = require('../server');
const { User } = require('../models');
const jwt = require('jsonwebtoken');

describe('Authentication Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Test@123',
        role: 'operator'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        name: userData.name,
        email: userData.email,
        role: userData.role
      });

      // Verify token is valid
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('email', userData.email);
    });

    it('should not register user with existing email', async () => {
      // Create existing user
      await global.testHelpers.createTestUser();

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'test@example.com', // Same email as test user
          password: 'Test@123'
        })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'User already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe'
          // Missing email and password
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Missing required fields');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user for login tests
      await global.testHelpers.createTestUser();
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin'
      });
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test@123'
        })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // Missing password
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;

    beforeEach(async () => {
      await global.testHelpers.createTestUser();
      authToken = global.testHelpers.generateToken(1);
    });

    it('should return current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const authToken = global.testHelpers.generateToken(1);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logout successful');
    });
  });
});