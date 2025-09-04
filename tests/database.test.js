const sequelize = require('../config/database');
const { User, Event, Product, Sale } = require('../models');

describe('Database Connection Tests', () => {
  describe('Sequelize Connection', () => {
    it('should connect to database successfully', async () => {
      const isConnected = await sequelize.authenticate()
        .then(() => true)
        .catch(() => false);
      
      expect(isConnected).toBe(true);
    });

    it('should use correct database dialect', () => {
      const dialect = sequelize.getDialect();
      expect(['sqlite', 'postgres']).toContain(dialect);
      
      if (process.env.NODE_ENV === 'test') {
        expect(dialect).toBe('sqlite');
      }
    });

    it('should sync all models without errors', async () => {
      const syncResult = await sequelize.sync({ force: false })
        .then(() => true)
        .catch(() => false);
      
      expect(syncResult).toBe(true);
    });
  });

  describe('Model Definitions', () => {
    it('should have User model defined', () => {
      expect(User).toBeDefined();
      expect(User.tableName).toBeDefined();
    });

    it('should have Event model defined', () => {
      expect(Event).toBeDefined();
      expect(Event.tableName).toBeDefined();
    });

    it('should have Product model defined', () => {
      expect(Product).toBeDefined();
      expect(Product.tableName).toBeDefined();
    });

    it('should have Sale model defined', () => {
      expect(Sale).toBeDefined();
      expect(Sale.tableName).toBeDefined();
    });
  });

  describe('Model Operations', () => {
    describe('User Model', () => {
      it('should create a new user', async () => {
        const userData = {
          name: 'Database Test User',
          email: 'dbtest@example.com',
          password: 'hashedpassword123',
          role: 'operator'
        };

        const user = await User.create(userData);
        expect(user).toBeDefined();
        expect(user.id).toBeDefined();
        expect(user.email).toBe(userData.email);
      });

      it('should enforce unique email constraint', async () => {
        const userData = {
          name: 'Test User 1',
          email: 'unique@example.com',
          password: 'password123',
          role: 'admin'
        };

        await User.create(userData);
        
        await expect(User.create({
          ...userData,
          name: 'Test User 2'
        })).rejects.toThrow();
      });

      it('should find user by email', async () => {
        const userData = {
          name: 'Findable User',
          email: 'find@example.com',
          password: 'password123',
          role: 'admin'
        };

        await User.create(userData);
        const foundUser = await User.findOne({ where: { email: userData.email } });
        
        expect(foundUser).toBeDefined();
        expect(foundUser.name).toBe(userData.name);
      });
    });

    describe('Event Model', () => {
      it('should create a new event', async () => {
        const eventData = {
          name: 'Database Test Event',
          description: 'Testing database operations',
          date: new Date('2024-12-31'),
          location: 'Test Venue',
          capacity: 200,
          ticketPrice: 75.00
        };

        const event = await Event.create(eventData);
        expect(event).toBeDefined();
        expect(event.id).toBeDefined();
        expect(event.name).toBe(eventData.name);
        expect(event.capacity).toBe(eventData.capacity);
      });

      it('should update event details', async () => {
        const event = await Event.create({
          name: 'Original Event',
          description: 'Original description',
          date: new Date(),
          location: 'Original Location',
          capacity: 100,
          ticketPrice: 50.00
        });

        await event.update({ capacity: 250 });
        expect(event.capacity).toBe(250);
      });
    });

    describe('Product Model', () => {
      it('should create a new product', async () => {
        const productData = {
          name: 'Test Product',
          description: 'Test product description',
          price: 19.99,
          category: 'test',
          stock: 100,
          barcode: 'TEST123456'
        };

        const product = await Product.create(productData);
        expect(product).toBeDefined();
        expect(product.price).toBe(productData.price);
        expect(product.stock).toBe(productData.stock);
      });

      it('should track stock levels', async () => {
        const product = await Product.create({
          name: 'Stock Test Product',
          price: 29.99,
          stock: 50,
          category: 'test'
        });

        const initialStock = product.stock;
        await product.update({ stock: product.stock - 5 });
        
        expect(product.stock).toBe(initialStock - 5);
      });
    });
  });

  describe('Associations', () => {
    it('should handle user-event associations', async () => {
      // Test if associations are properly set up
      const associations = User.associations;
      expect(associations).toBeDefined();
    });
  });

  describe('Transactions', () => {
    it('should rollback transaction on error', async () => {
      const t = await sequelize.transaction();
      
      try {
        await User.create({
          name: 'Transaction Test',
          email: 'transaction@test.com',
          password: 'password'
        }, { transaction: t });

        // Force an error
        throw new Error('Test error');
      } catch (error) {
        await t.rollback();
      }

      const user = await User.findOne({ 
        where: { email: 'transaction@test.com' } 
      });
      
      expect(user).toBeNull();
    });

    it('should commit transaction on success', async () => {
      const t = await sequelize.transaction();
      
      try {
        const user = await User.create({
          name: 'Commit Test',
          email: 'commit@test.com',
          password: 'password'
        }, { transaction: t });

        await t.commit();
        
        const foundUser = await User.findByPk(user.id);
        expect(foundUser).toBeDefined();
      } catch (error) {
        await t.rollback();
        throw error;
      }
    });
  });
});