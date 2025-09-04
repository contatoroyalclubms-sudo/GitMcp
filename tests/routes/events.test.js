const request = require('supertest');
const app = require('../../server');
const { Event, User } = require('../../models');

describe('Event Routes Tests', () => {
  let authToken;
  let testUser;

  beforeEach(async () => {
    // Create test user and generate token
    testUser = await global.testHelpers.createTestUser();
    authToken = global.testHelpers.generateToken(testUser.id);
  });

  describe('GET /api/events', () => {
    beforeEach(async () => {
      // Create sample events
      await Event.bulkCreate([
        {
          name: 'Tech Conference 2024',
          description: 'Annual technology conference',
          date: new Date('2024-06-15'),
          location: 'Convention Center',
          capacity: 500,
          ticketPrice: 150.00
        },
        {
          name: 'Music Festival',
          description: 'Summer music festival',
          date: new Date('2024-07-20'),
          location: 'City Park',
          capacity: 1000,
          ticketPrice: 75.00
        }
      ]);
    });

    it('should list all events', async () => {
      const response = await request(app)
        .get('/api/events')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('location');
    });

    it('should filter events by date range', async () => {
      const response = await request(app)
        .get('/api/events')
        .query({ 
          startDate: '2024-06-01',
          endDate: '2024-06-30'
        })
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Tech Conference 2024');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/events')
        .query({ 
          page: 1,
          limit: 1
        })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(1);
      expect(response.body.total).toBe(2);
      expect(response.body.page).toBe(1);
    });
  });

  describe('GET /api/events/:id', () => {
    let eventId;

    beforeEach(async () => {
      const event = await Event.create({
        name: 'Test Event',
        description: 'Event for testing',
        date: new Date('2024-08-01'),
        location: 'Test Location',
        capacity: 100,
        ticketPrice: 50.00
      });
      eventId = event.id;
    });

    it('should get event by ID', async () => {
      const response = await request(app)
        .get(`/api/events/${eventId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', eventId);
      expect(response.body).toHaveProperty('name', 'Test Event');
      expect(response.body).toHaveProperty('capacity', 100);
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .get('/api/events/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Event not found');
    });
  });

  describe('POST /api/events', () => {
    it('should create new event with authentication', async () => {
      const eventData = {
        name: 'New Conference',
        description: 'A brand new conference',
        date: '2024-09-15',
        location: 'Conference Hall',
        capacity: 300,
        ticketPrice: 200.00
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', eventData.name);
      expect(response.body).toHaveProperty('capacity', eventData.capacity);

      // Verify event was created in database
      const createdEvent = await Event.findByPk(response.body.id);
      expect(createdEvent).toBeDefined();
    });

    it('should reject creation without authentication', async () => {
      const eventData = {
        name: 'Unauthorized Event',
        description: 'Should not be created',
        date: '2024-09-20',
        location: 'Nowhere',
        capacity: 100,
        ticketPrice: 50.00
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Incomplete Event'
          // Missing required fields
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate capacity is positive number', async () => {
      const eventData = {
        name: 'Invalid Event',
        description: 'Event with invalid capacity',
        date: '2024-10-01',
        location: 'Test Location',
        capacity: -10,
        ticketPrice: 50.00
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/events/:id', () => {
    let eventId;

    beforeEach(async () => {
      const event = await Event.create({
        name: 'Original Event',
        description: 'Original description',
        date: new Date('2024-10-15'),
        location: 'Original Location',
        capacity: 150,
        ticketPrice: 75.00
      });
      eventId = event.id;
    });

    it('should update event with authentication', async () => {
      const updateData = {
        capacity: 200,
        ticketPrice: 100.00
      };

      const response = await request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('capacity', updateData.capacity);
      expect(response.body).toHaveProperty('ticketPrice', updateData.ticketPrice);
    });

    it('should reject update without authentication', async () => {
      const response = await request(app)
        .put(`/api/events/${eventId}`)
        .send({ capacity: 300 })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .put('/api/events/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ capacity: 200 })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Event not found');
    });
  });

  describe('DELETE /api/events/:id', () => {
    let eventId;

    beforeEach(async () => {
      const event = await Event.create({
        name: 'Event to Delete',
        description: 'This event will be deleted',
        date: new Date('2024-11-01'),
        location: 'Delete Location',
        capacity: 50,
        ticketPrice: 25.00
      });
      eventId = event.id;
    });

    it('should delete event with admin authentication', async () => {
      const response = await request(app)
        .delete(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Event deleted successfully');

      // Verify event was deleted
      const deletedEvent = await Event.findByPk(eventId);
      expect(deletedEvent).toBeNull();
    });

    it('should reject deletion without authentication', async () => {
      const response = await request(app)
        .delete(`/api/events/${eventId}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');

      // Verify event was not deleted
      const event = await Event.findByPk(eventId);
      expect(event).toBeDefined();
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .delete('/api/events/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Event not found');
    });
  });

  describe('Event Statistics', () => {
    beforeEach(async () => {
      // Create events with different stats
      await Event.bulkCreate([
        {
          name: 'Past Event',
          date: new Date('2023-01-01'),
          location: 'Past Location',
          capacity: 100,
          ticketPrice: 50.00,
          ticketsSold: 95
        },
        {
          name: 'Current Event',
          date: new Date('2024-12-01'),
          location: 'Current Location',
          capacity: 200,
          ticketPrice: 75.00,
          ticketsSold: 150
        },
        {
          name: 'Future Event',
          date: new Date('2025-01-01'),
          location: 'Future Location',
          capacity: 300,
          ticketPrice: 100.00,
          ticketsSold: 50
        }
      ]);
    });

    it('should get event statistics', async () => {
      const response = await request(app)
        .get('/api/events/statistics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalEvents');
      expect(response.body).toHaveProperty('upcomingEvents');
      expect(response.body).toHaveProperty('pastEvents');
      expect(response.body).toHaveProperty('totalRevenue');
    });
  });
});