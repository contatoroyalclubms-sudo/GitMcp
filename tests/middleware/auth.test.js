const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRole, hashPassword, comparePassword, generateToken } = require('../../middleware/auth');
const { User } = require('../../models');

describe('Auth Middleware Tests', () => {
  let app;

  beforeEach(() => {
    // Create a test Express app
    app = express();
    app.use(express.json());
  });

  describe('authenticateToken Middleware', () => {
    beforeEach(() => {
      // Setup test route with auth middleware
      app.get('/protected', authenticateToken, (req, res) => {
        res.json({ 
          message: 'Protected route accessed',
          user: req.user 
        });
      });
    });

    it('should allow access with valid token', async () => {
      const token = jwt.sign(
        { id: 1, email: 'test@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Protected route accessed');
      expect(response.body.user).toHaveProperty('id', 1);
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'No token provided');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid token');
    });

    it('should reject expired token', async () => {
      const expiredToken = jwt.sign(
        { id: 1, email: 'test@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Already expired
      );

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Token expired');
    });

    it('should reject token with wrong secret', async () => {
      const wrongSecretToken = jwt.sign(
        { id: 1, email: 'test@example.com' },
        'wrong-secret-key',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${wrongSecretToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid token');
    });

    it('should handle malformed authorization header', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'NotBearer token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('authorizeRole Middleware', () => {
    beforeEach(() => {
      // Setup test routes with role authorization
      app.get('/admin-only', 
        authenticateToken, 
        authorizeRole('admin'), 
        (req, res) => {
          res.json({ message: 'Admin route accessed' });
        }
      );

      app.get('/operator-allowed',
        authenticateToken,
        authorizeRole('operator', 'admin'),
        (req, res) => {
          res.json({ message: 'Operator route accessed' });
        }
      );
    });

    it('should allow admin to access admin-only route', async () => {
      const adminToken = jwt.sign(
        { id: 1, email: 'admin@example.com', role: 'admin' },
        process.env.JWT_SECRET
      );

      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Admin route accessed');
    });

    it('should reject operator from admin-only route', async () => {
      const operatorToken = jwt.sign(
        { id: 2, email: 'operator@example.com', role: 'operator' },
        process.env.JWT_SECRET
      );

      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Insufficient permissions');
    });

    it('should allow multiple authorized roles', async () => {
      const operatorToken = jwt.sign(
        { id: 2, email: 'operator@example.com', role: 'operator' },
        process.env.JWT_SECRET
      );

      const response = await request(app)
        .get('/operator-allowed')
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Operator route accessed');
    });
  });

  describe('Password Hashing Functions', () => {
    it('should hash password correctly', async () => {
      const plainPassword = 'MySecurePassword123';
      const hashedPassword = await hashPassword(plainPassword);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hashes are long
    });

    it('should generate different hashes for same password', async () => {
      const plainPassword = 'TestPassword456';
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);

      expect(hash1).not.toBe(hash2); // Different salts
    });

    it('should correctly compare password with hash', async () => {
      const plainPassword = 'CorrectPassword789';
      const hashedPassword = await hashPassword(plainPassword);

      const isMatch = await comparePassword(plainPassword, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const plainPassword = 'CorrectPassword789';
      const wrongPassword = 'WrongPassword123';
      const hashedPassword = await hashPassword(plainPassword);

      const isMatch = await comparePassword(wrongPassword, hashedPassword);
      expect(isMatch).toBe(false);
    });
  });

  describe('Token Generation', () => {
    it('should generate valid JWT token', () => {
      const user = {
        id: 123,
        email: 'user@example.com',
        role: 'operator'
      };

      const token = generateToken(user);
      expect(token).toBeDefined();

      // Verify token structure
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty('id', user.id);
      expect(decoded).toHaveProperty('email', user.email);
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');
    });

    it('should include expiration in token', () => {
      const user = {
        id: 456,
        email: 'another@example.com',
        role: 'admin'
      };

      const token = generateToken(user);
      const decoded = jwt.decode(token);

      const now = Math.floor(Date.now() / 1000);
      expect(decoded.exp).toBeGreaterThan(now);
      expect(decoded.iat).toBeLessThanOrEqual(now);
    });
  });

  describe('Rate Limiting Middleware', () => {
    let rateLimitMiddleware;

    beforeEach(() => {
      // Mock rate limiting middleware
      rateLimitMiddleware = (req, res, next) => {
        const ip = req.ip;
        const requests = global.requestCounts || {};
        
        if (!requests[ip]) {
          requests[ip] = { count: 1, resetTime: Date.now() + 60000 };
        } else if (Date.now() > requests[ip].resetTime) {
          requests[ip] = { count: 1, resetTime: Date.now() + 60000 };
        } else {
          requests[ip].count++;
        }

        if (requests[ip].count > 5) {
          return res.status(429).json({ error: 'Too many requests' });
        }

        global.requestCounts = requests;
        next();
      };

      app.get('/rate-limited', rateLimitMiddleware, (req, res) => {
        res.json({ message: 'Request successful' });
      });
    });

    it('should allow requests within limit', async () => {
      global.requestCounts = {};

      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get('/rate-limited')
          .expect(200);

        expect(response.body).toHaveProperty('message', 'Request successful');
      }
    });

    it('should block requests exceeding limit', async () => {
      global.requestCounts = {};

      // Make 5 successful requests
      for (let i = 0; i < 5; i++) {
        await request(app).get('/rate-limited').expect(200);
      }

      // 6th request should be blocked
      const response = await request(app)
        .get('/rate-limited')
        .expect(429);

      expect(response.body).toHaveProperty('error', 'Too many requests');
    });
  });

  describe('CORS Middleware', () => {
    beforeEach(() => {
      // Simple CORS implementation for testing
      app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
        
        if (req.method === 'OPTIONS') {
          return res.sendStatus(200);
        }
        next();
      });

      app.get('/cors-enabled', (req, res) => {
        res.json({ message: 'CORS enabled route' });
      });
    });

    it('should handle preflight OPTIONS request', async () => {
      const response = await request(app)
        .options('/cors-enabled')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.headers['access-control-allow-methods']).toContain('GET');
    });

    it('should include CORS headers in response', async () => {
      const response = await request(app)
        .get('/cors-enabled')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });
  });
});