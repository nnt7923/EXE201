const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../server');
const User = require('../models/User');
const Place = require('../models/Place');
const Review = require('../models/Review');
const Itinerary = require('../models/Itinerary');
const SubscriptionPlan = require('../models/Plan');
const Category = require('../models/Category');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau-test';

describe('System Tests - Complete API Flow', () => {
  let adminToken, userToken, adminUserId, userId;
  let testPlace, testPlan, testItinerary;

  beforeAll(async () => {
    await mongoose.connect(mongoUri, {});
    
    // Hash password for test users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Create test users
    const adminUser = await User.create({
      name: 'System Test Admin',
      email: 'admin@systemtest.com',
      password: hashedPassword,
      role: 'admin'
    });
    adminUserId = adminUser._id;
    adminToken = jwt.sign(
      { user: { id: adminUser._id, role: adminUser.role } },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const regularUser = await User.create({
      name: 'System Test User',
      email: 'user@systemtest.com',
      password: hashedPassword,
      role: 'user'
    });
    userId = regularUser._id;
    userToken = jwt.sign(
      { user: { id: regularUser._id, role: regularUser.role } },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create test subscription plan
    testPlan = await SubscriptionPlan.create({
      name: 'Test Plan',
      description: 'Test subscription plan',
      price: 99000,
      durationInDays: 30,
      aiSuggestionLimit: 100,
      features: ['AI suggestions', 'Premium support']
    });

    // Create test categories
    await Category.create([
      {
        key: 'restaurant',
        name: 'Nhà hàng',
        subcategories: ['Cơm tấm', 'Phở', 'Bún bò Huế']
      },
      {
        key: 'cafe',
        name: 'Cà phê',
        subcategories: ['Cà phê truyền thống', 'Cà phê hiện đại']
      }
    ]);
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: { $regex: 'systemtest.com' } });
    await Place.deleteMany({ name: { $regex: 'System Test' } });
    await Review.deleteMany({});
    await Itinerary.deleteMany({ title: { $regex: 'System Test' } });
    await SubscriptionPlan.deleteMany({ name: 'Test Plan' });
    await Category.deleteMany({ key: { $in: ['restaurant', 'cafe'] } });
    await mongoose.connection.close();
  });

  describe('Health Check', () => {
    it('should return API health status', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.body.status).toBe('OK');
      expect(res.body.message).toBe('Ăn Gì Ở Đâu API is running!');
    });
  });

  describe('Authentication Flow', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New System User',
          email: 'newuser@systemtest.com',
          password: 'password123'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('newuser@systemtest.com');
    });

    it('should login existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@systemtest.com',
          password: 'password123'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should get current user profile', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('user@systemtest.com');
    });
  });

  describe('Places Management Flow', () => {
    it('should create a new place (admin)', async () => {
      const placeData = {
        name: 'System Test Cafe',
        description: 'A test cafe for system testing',
        category: 'cafe',
        subcategory: 'Cà phê học bài',
        address: {
          street: '123 Test Street',
          ward: 'Phường Test',
          district: 'Quận Test',
          city: 'Hà Nội'
        },
        lat: 21.0,
        lng: 105.8,
        priceRange: { min: 20000, max: 50000 },
        openingHours: {
          monday: { open: '07:00', close: '22:00' },
          tuesday: { open: '07:00', close: '22:00' }
        }
      };

      const res = await request(app)
        .post('/api/places')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(placeData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.place.name).toBe('System Test Cafe');
      testPlace = res.body.data.place;
    });

    it('should get all places', async () => {
      const res = await request(app)
        .get('/api/places')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.places)).toBe(true);
      expect(res.body.data.places.length).toBeGreaterThan(0);
    });

    it('should get place by ID', async () => {
      const res = await request(app)
        .get(`/api/places/${testPlace._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.place._id).toBe(testPlace._id);
    });

    it('should update place (admin)', async () => {
      const updateData = {
        description: 'Updated description for system test'
      };

      const res = await request(app)
        .put(`/api/places/${testPlace._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.place.description).toBe(updateData.description);
    });
  });

  describe('Reviews Flow', () => {
    it('should create a review for place', async () => {
      const reviewData = {
        place: testPlace._id,
        rating: 4,
        title: 'System Test Review',
        content: 'This is a test review for system testing',
        visitDate: new Date().toISOString(),
        visitType: 'dine-in',
        pricePaid: 35000,
        groupSize: 2
      };

      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.review.title).toBe('System Test Review');
      expect(res.body.data.review.rating).toBe(4);
    });

    it('should get reviews for place', async () => {
      const res = await request(app)
        .get(`/api/places/${testPlace._id}/reviews`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.reviews)).toBe(true);
    });
  });

  describe('Itineraries Flow', () => {
    it('should create an itinerary', async () => {
      const itineraryData = {
        title: 'System Test Itinerary',
        description: 'Test itinerary for system testing',
        date: new Date(),
        activities: [
          {
            place: testPlace._id,
            startTime: '09:00',
            endTime: '11:00',
            activityType: 'VISIT',
            notes: 'Visit Test Cafe'
          }
        ]
      };

      const res = await request(app)
        .post('/api/itineraries')
        .set('Authorization', `Bearer ${userToken}`)
        .send(itineraryData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.itinerary.title).toBe('System Test Itinerary');
      testItinerary = res.body.data.itinerary;
    });

    it('should get all itineraries', async () => {
      const res = await request(app)
        .get('/api/itineraries')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.itineraries)).toBe(true);
    });

    it('should get itinerary by ID', async () => {
      const res = await request(app)
        .get(`/api/itineraries/${testItinerary._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.itinerary._id).toBe(testItinerary._id);
    });
  });

  describe('Subscription Plans Flow', () => {
    it('should get all subscription plans', async () => {
      const res = await request(app)
        .get('/api/plans')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should get plan by ID', async () => {
      const res = await request(app)
        .get(`/api/plans/${testPlan._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(testPlan._id.toString());
    });

    it('should subscribe to plan', async () => {
      const res = await request(app)
        .post('/api/subscriptions/subscribe')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ planId: testPlan._id })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.subscriptionPlan._id).toBe(testPlan._id.toString());
    });
  });

  describe('User Management Flow (Admin)', () => {
    it('should get all users (admin)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.users)).toBe(true);
    });

    it('should get user by ID (admin)', async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user._id).toBe(userId.toString());
    });
  });

  describe('Categories Flow', () => {
    it('should get all categories', async () => {
      const res = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.categories)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent place', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/places/${fakeId}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should return 401 for unauthorized access', async () => {
      const res = await request(app)
        .post('/api/places')
        .send({ name: 'Test' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should return 403 for insufficient permissions', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });
});