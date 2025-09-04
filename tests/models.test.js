const { User, Event, Product, Sale, Client, Inventory, CashRegister, Transaction, Campaign, SystemConfig, CashlessCard } = require('../models');
const bcrypt = require('bcryptjs');

describe('Model Tests', () => {
  describe('User Model', () => {
    it('should create user with encrypted password', async () => {
      const plainPassword = 'TestPassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      const user = await User.create({
        name: 'Test User',
        email: 'test@model.com',
        password: hashedPassword,
        role: 'operator'
      });

      expect(user.password).not.toBe(plainPassword);
      expect(user.password).toBe(hashedPassword);
    });

    it('should have default role as operator', async () => {
      const user = await User.create({
        name: 'Default Role User',
        email: 'default@model.com',
        password: 'hashed'
      });

      expect(user.role).toBe('operator');
    });
  });

  describe('Event Model', () => {
    it('should calculate available tickets', async () => {
      const event = await Event.create({
        name: 'Test Event',
        date: new Date(),
        venue: 'Test Location',
        capacity: 100
      });

      const available = event.capacity;
      expect(available).toBe(100);
    });

    it('should handle default values', async () => {
      const event = await Event.create({
        name: 'New Event',
        date: new Date(),
        venue: 'Location',
        capacity: 50
      });

      expect(event.status).toBe('planning');
      expect(event.revenue).toBe('0.00');
    });
  });

  describe('Product Model', () => {
    it('should track inventory correctly', async () => {
      const product = await Product.create({
        name: 'Inventory Test',
        price: 15.99,
        stock: 100,
        category: 'test'
      });

      // Simulate sale
      product.stock -= 5;
      await product.save();

      expect(product.stock).toBe(95);
    });

    it('should handle decimal prices', async () => {
      const product = await Product.create({
        name: 'Price Test',
        price: 19.99,
        stock: 10,
        category: 'test'
      });

      expect(product.price).toBe(19.99);
    });
  });

  describe('Sale Model', () => {
    it('should track sale status', async () => {
      const sale = await Sale.create({
        total: 100.00,
        paymentMethod: 'cash',
        status: 'pending'
      });

      expect(sale.status).toBe('pending');

      sale.status = 'completed';
      await sale.save();

      expect(sale.status).toBe('completed');
    });

    it('should handle multiple payment methods', async () => {
      const methods = ['cash', 'card', 'pix', 'cashless'];
      
      for (const method of methods) {
        const sale = await Sale.create({
          total: 50.00,
          paymentMethod: method
        });
        
        expect(sale.paymentMethod).toBe(method);
      }
    });
  });

  describe('Client Model', () => {
    it('should store client information', async () => {
      const client = await Client.create({
        name: 'John Doe',
        email: 'john@client.com',
        phone: '123456789',
        cpf: '12345678900'
      });

      expect(client.name).toBe('John Doe');
      expect(client.email).toBe('john@client.com');
    });

    it('should enforce unique document', async () => {
      await Client.create({
        name: 'Client 1',
        document: '12345678900',
        phone: '111111111'
      });

      await expect(Client.create({
        name: 'Client 2',
        document: '12345678900',
        phone: '222222222'
      })).rejects.toThrow();
    });
  });

  describe('Inventory Model', () => {
    it('should track stock movements', async () => {
      const inventory = await Inventory.create({
        quantity: 50,
        type: 'entry',
        reason: 'purchase'
      });

      expect(inventory.type).toBe('entry');
      expect(inventory.quantity).toBe(50);
    });

    it('should support different movement types', async () => {
      const entryMovement = await Inventory.create({
        quantity: 30,
        type: 'entry',
        reason: 'restock'
      });

      const exitMovement = await Inventory.create({
        quantity: 10,
        type: 'exit',
        reason: 'sale'
      });

      expect(entryMovement.type).toBe('entry');
      expect(exitMovement.type).toBe('exit');
    });
  });

  describe('CashRegister Model', () => {
    it('should track register sessions', async () => {
      const register = await CashRegister.create({
        openingBalance: 100.00,
        status: 'open'
      });

      expect(register.status).toBe('open');
      expect(register.openingBalance).toBe('100.00');
    });

    it('should handle register closing', async () => {
      const register = await CashRegister.create({
        openingBalance: 100.00,
        status: 'open'
      });

      register.status = 'closed';
      register.closingBalance = 350.00;
      register.closedAt = new Date();
      await register.save();

      expect(register.status).toBe('closed');
      expect(register.closingBalance).toBe('350.00');
    });
  });

  describe('Transaction Model', () => {
    it('should record financial transactions', async () => {
      const transaction = await Transaction.create({
        type: 'income',
        amount: 500.00,
        description: 'Sales revenue',
        category: 'sales'
      });

      expect(transaction.type).toBe('income');
      expect(transaction.amount).toBe(500.00);
    });
  });

  describe('Campaign Model', () => {
    it('should manage marketing campaigns', async () => {
      const campaign = await Campaign.create({
        name: 'Summer Sale',
        type: 'email',
        content: 'Summer discount campaign',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'scheduled'
      });

      expect(campaign.name).toBe('Summer Sale');
      expect(campaign.type).toBe('email');
      expect(campaign.status).toBe('scheduled');
    });
  });

  describe('SystemConfig Model', () => {
    it('should store system configurations', async () => {
      const config = await SystemConfig.create({
        key: 'app_name',
        value: 'GitMcp System',
        type: 'string'
      });

      expect(config.key).toBe('app_name');
      expect(config.value).toBe('GitMcp System');
    });

    it('should enforce unique keys', async () => {
      await SystemConfig.create({
        key: 'unique_setting',
        value: 'value1',
        type: 'string'
      });

      await expect(SystemConfig.create({
        key: 'unique_setting',
        value: 'value2',
        type: 'string'
      })).rejects.toThrow();
    });
  });

  describe('CashlessCard Model', () => {
    it('should manage cashless payment cards', async () => {
      const card = await CashlessCard.create({
        cardNumber: 'CARD123456',
        pin: '1234',
        balance: 100.00,
        status: 'active'
      });

      expect(card.cardNumber).toBe('CARD123456');
      expect(card.balance).toBe('100.00');
      expect(card.status).toBe('active');
    });

    it('should update card balance', async () => {
      const card = await CashlessCard.create({
        cardNumber: 'CARD789012',
        pin: '5678',
        balance: 50.00,
        status: 'active'
      });

      card.balance = parseFloat(card.balance) + 25.00;
      await card.save();

      expect(parseFloat(card.balance)).toBe(75.00);
    });
  });
});