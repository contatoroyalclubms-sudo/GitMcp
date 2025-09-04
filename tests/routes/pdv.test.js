const request = require('supertest');
const app = require('../../server');
const { Product, Sale, User } = require('../../models');

describe('PDV Routes Tests', () => {
  let authToken;
  let testUser;

  beforeEach(async () => {
    testUser = await global.testHelpers.createTestUser();
    authToken = global.testHelpers.generateToken(testUser.id);
  });

  describe('GET /api/pdv/products', () => {
    beforeEach(async () => {
      await Product.bulkCreate([
        {
          name: 'Coca Cola',
          price: 5.50,
          stock: 100,
          category: 'beverages',
          barcode: '7891234567890'
        },
        {
          name: 'Hot Dog',
          price: 12.00,
          stock: 50,
          category: 'food',
          barcode: '7891234567891'
        }
      ]);
    });

    it('should list all products for PDV', async () => {
      const response = await request(app)
        .get('/api/pdv/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('price');
      expect(response.body[0]).toHaveProperty('stock');
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/pdv/products?category=beverages')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Coca Cola');
    });

    it('should search products by barcode', async () => {
      const response = await request(app)
        .get('/api/pdv/products?barcode=7891234567890')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Coca Cola');
    });
  });

  describe('POST /api/pdv/sales', () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.create({
        name: 'Test Product',
        price: 10.00,
        stock: 20,
        category: 'test'
      });
      productId = product.id;
    });

    it('should create a new sale', async () => {
      const saleData = {
        items: [
          {
            productId: productId,
            quantity: 2,
            price: 10.00
          }
        ],
        paymentMethod: 'cash',
        totalAmount: 20.00
      };

      const response = await request(app)
        .post('/api/pdv/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(saleData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('totalAmount', 20.00);
      expect(response.body).toHaveProperty('paymentMethod', 'cash');

      // Verify stock was updated
      const product = await Product.findByPk(productId);
      expect(product.stock).toBe(18);
    });

    it('should validate stock availability', async () => {
      const saleData = {
        items: [
          {
            productId: productId,
            quantity: 25, // More than available
            price: 10.00
          }
        ],
        paymentMethod: 'cash',
        totalAmount: 250.00
      };

      const response = await request(app)
        .post('/api/pdv/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(saleData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/pdv/sales')
        .send({})
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/pdv/sales/:id', () => {
    let saleId;

    beforeEach(async () => {
      const sale = await Sale.create({
        totalAmount: 50.00,
        paymentMethod: 'credit_card',
        userId: testUser.id,
        status: 'completed'
      });
      saleId = sale.id;
    });

    it('should get sale details by ID', async () => {
      const response = await request(app)
        .get(`/api/pdv/sales/${saleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', saleId);
      expect(response.body).toHaveProperty('totalAmount', 50.00);
      expect(response.body).toHaveProperty('paymentMethod', 'credit_card');
    });

    it('should return 404 for non-existent sale', async () => {
      const response = await request(app)
        .get('/api/pdv/sales/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/pdv/open-register', () => {
    it('should open cash register', async () => {
      const response = await request(app)
        .post('/api/pdv/open-register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          initialAmount: 100.00
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('registerId');
    });
  });

  describe('POST /api/pdv/close-register', () => {
    it('should close cash register', async () => {
      // First open register
      const openResponse = await request(app)
        .post('/api/pdv/open-register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          initialAmount: 100.00
        });

      const registerId = openResponse.body.registerId;

      // Then close it
      const response = await request(app)
        .post('/api/pdv/close-register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          registerId: registerId,
          finalAmount: 250.00
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('report');
    });
  });
});