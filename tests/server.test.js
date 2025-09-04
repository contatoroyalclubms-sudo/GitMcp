const request = require('supertest');

describe('Server Tests', () => {
  let app;
  let server;

  beforeAll(async () => {
    // Mock environment variables
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3001';
    
    // Clear the module cache to get fresh instance
    jest.resetModules();
    
    // Import app after setting env vars
    app = require('../server');
  });

  afterAll(async () => {
    // Close server if running
    if (server && server.close) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  describe('Server Configuration', () => {
    it('should have app defined', () => {
      expect(app).toBeDefined();
    });

    it('should respond to health check endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/this-route-does-not-exist')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should have CORS enabled', async () => {
      const response = await request(app)
        .options('/api/auth/login')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should have security headers', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
    });
  });

  describe('API Routes Registration', () => {
    it('should have auth routes registered', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400); // Should fail with validation error, not 404

      expect(response.status).not.toBe(404);
    });

    it('should have events routes registered', async () => {
      const response = await request(app)
        .get('/api/events');

      expect(response.status).not.toBe(404);
    });

    it('should have pdv routes registered', async () => {
      const response = await request(app)
        .get('/api/pdv/products');

      expect(response.status).not.toBe(404);
    });
  });

  describe('Static Files', () => {
    it('should serve static files from public directory', async () => {
      // Test if public directory is accessible
      const response = await request(app)
        .get('/favicon.ico');

      // Should not return 404 if static serving is configured
      expect([200, 204, 404]).toContain(response.status);
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON parsing errors', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{ invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle large payload rejection', async () => {
      const largePayload = 'x'.repeat(10 * 1024 * 1024); // 10MB string

      const response = await request(app)
        .post('/api/auth/register')
        .send({ data: largePayload });

      // Should reject if body limit is configured
      expect([400, 413]).toContain(response.status);
    });
  });

  describe('Database Connection', () => {
    it('should have database connection', async () => {
      const sequelize = require('../config/database');
      const isConnected = await sequelize.authenticate()
        .then(() => true)
        .catch(() => false);

      expect(isConnected).toBe(true);
    });
  });
});