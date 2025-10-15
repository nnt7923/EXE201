const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const Place = require('../models/Place');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau-test';

describe('Places API', () => {
  let regularUserToken, adminUserToken, regularUserId, adminUserId;

  // A valid place object to be used in tests
  const validPlaceData = {
    name: 'Test Cafe',
    description: 'A wonderful place to test.',
    category: 'cafe',
    subcategory: 'Cà phê học bài',
    address: {
      street: '123 Test Street',
      ward: 'Phường Test',
      district: 'Quận Test',
      city: 'Hà Nội'
    },
    location: {
      type: 'Point',
      coordinates: [105.8, 21.0] // Longitude, Latitude
    }
  };

  beforeAll(async () => {
    await mongoose.connect(mongoUri, {});

    // Create a regular user and an admin user
    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'password123',
      role: 'user'
    });
    regularUserId = regularUser._id;
    regularUserToken = jwt.sign({ user: { id: regularUser._id, role: regularUser.role } }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    adminUserId = adminUser._id;
    adminUserToken = jwt.sign({ user: { id: adminUser._id, role: adminUser.role } }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterEach(async () => {
    await Place.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  // --- Test Suite for GET /api/places ---
  describe('GET /api/places', () => {
    it('should return a list of active places', async () => {
      // Create some sample places with explicit timestamps
      const now = new Date();
      const place1 = await Place.create({ 
        ...validPlaceData, 
        name: 'Place 1', 
        createdBy: regularUserId, 
        isActive: true,
        createdAt: new Date(now.getTime() - 1000) // 1 second earlier
      });
      const place2 = await Place.create({ 
        ...validPlaceData, 
        name: 'Place 2', 
        category: 'restaurant', 
        subcategory: 'Phở', 
        createdBy: regularUserId, 
        isActive: true,
        createdAt: now // later timestamp
      });
      await Place.create({ 
        ...validPlaceData, 
        name: 'Place 3 (Inactive)', 
        createdBy: regularUserId, 
        isActive: false 
      });

      const res = await request(app).get('/api/places');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.places).toHaveLength(2);
      // Default sort is -createdAt, so Place 2 should be first
      expect(res.body.data.places[0].name).toBe('Place 2'); 
      expect(res.body.data.places[1].name).toBe('Place 1');
    });

    it('should handle pagination correctly', async () => {
        await Place.create([
            { ...validPlaceData, name: 'Place 1', createdBy: regularUserId },
            { ...validPlaceData, name: 'Place 2', createdBy: regularUserId },
            { ...validPlaceData, name: 'Place 3', createdBy: regularUserId },
        ]);

        const res = await request(app).get('/api/places?page=2&limit=2');

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.places).toHaveLength(1);
        expect(res.body.data.pagination.current).toBe(2);
        expect(res.body.data.pagination.total).toBe(3);
    });
  });

  // --- Test Suite for POST /api/places ---
  describe('POST /api/places', () => {
    it('should return 401 if user is not authenticated', async () => {
        const res = await request(app)
            .post('/api/places')
            .send(validPlaceData);

        expect(res.statusCode).toEqual(401);
    });

    it('should create a new place successfully if user is authenticated', async () => {
        const { location, ...restOfPlaceData } = validPlaceData;
        const requestBody = {
            ...restOfPlaceData,
            lng: location.coordinates[0],
            lat: location.coordinates[1]
        };

        const res = await request(app)
            .post('/api/places')
            .set('Authorization', `Bearer ${regularUserToken}`)
            .send(requestBody);

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.place.name).toBe(validPlaceData.name);
        // Check the raw ID, since we removed populate for debugging
        expect(res.body.data.place.createdBy.toString()).toBe(regularUserId.toString());

        const placeInDb = await Place.findOne({ name: validPlaceData.name });
        expect(placeInDb).not.toBeNull();
        expect(placeInDb.location.coordinates[0]).toBe(location.coordinates[0]);
    });
  });
});
