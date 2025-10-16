const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../server');
const User = require('../models/User');
const Place = require('../models/Place');
const Booking = require('../models/Booking');
const Category = require('../models/Category');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau-test';

describe('Booking API Tests', () => {
  let userToken, adminToken, ownerToken;
  let testUser, testAdmin, testOwner;
  let testPlace, testBooking;

  beforeAll(async () => {
    await mongoose.connect(mongoUri, {});
    
    // Hash password for test users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Create test users
    testUser = await User.create({
      name: 'Test User',
      email: 'user@bookingtest.com',
      password: hashedPassword,
      role: 'user'
    });
    userToken = jwt.sign(
      { user: { id: testUser._id, role: testUser.role } },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    testAdmin = await User.create({
      name: 'Test Admin',
      email: 'admin@bookingtest.com',
      password: hashedPassword,
      role: 'admin'
    });
    adminToken = jwt.sign(
      { user: { id: testAdmin._id, role: testAdmin.role } },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    testOwner = await User.create({
      name: 'Test Owner',
      email: 'owner@bookingtest.com',
      password: hashedPassword,
      role: 'owner'
    });
    ownerToken = jwt.sign(
      { user: { id: testOwner._id, role: testOwner.role } },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create test category
    await Category.create({
      key: 'hotel',
      name: 'Khách sạn',
      subcategories: ['Khách sạn 3 sao', 'Khách sạn 4 sao']
    });

    // Create test place
    testPlace = await Place.create({
      name: 'Test Hotel',
      description: 'A test hotel for booking tests',
      category: 'hotel',
      subcategory: 'Khách sạn 3 sao',
      address: {
        street: '123 Test Street',
        ward: 'Phường Test',
        district: 'Quận Test',
        city: 'Hà Nội'
      },
      location: {
        type: 'Point',
        coordinates: [105.8, 21.0] // [longitude, latitude]
      },
      pricing: { 
        minPrice: 500000, 
        maxPrice: 1000000,
        currency: 'VND'
      },
      operatingHours: [
        { day: 'monday', open: '00:00', close: '23:59', isClosed: false },
        { day: 'tuesday', open: '00:00', close: '23:59', isClosed: false }
      ],
      createdBy: testOwner._id
    });
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: { $regex: 'bookingtest.com' } });
    await Place.deleteMany({ name: 'Test Hotel' });
    await Booking.deleteMany({});
    await Category.deleteMany({ key: 'hotel' });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up bookings before each test
    await Booking.deleteMany({});
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking successfully', async () => {
      const bookingData = {
        place: testPlace._id,
        customerInfo: {
          name: 'John Doe',
          email: 'john@test.com',
          phone: '0123456789'
        },
        bookingDetails: {
          checkInDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days later
          numberOfGuests: 2,
          numberOfRooms: 1,
          roomType: 'standard',
          specialRequests: 'Late check-in'
        },
        pricing: {
          roomPrice: 800000,
          serviceFee: 50000,
          taxes: 85000,
          totalAmount: 935000,
          currency: 'VND'
        }
      };

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData);

      // Debug error if not 201
      if (res.status !== 201) {
        throw new Error(`Expected 201, got ${res.status}. Response: ${JSON.stringify(res.body)}`);
      }

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('bookingNumber');
      expect(res.body.data.user._id).toBe(testUser._id.toString());
      expect(res.body.data.place._id).toBe(testPlace._id.toString());
      expect(res.body.data.status).toBe('pending');
      
      testBooking = res.body.data;
    });

    it('should return 400 for invalid booking data', async () => {
      const invalidBookingData = {
        place: testPlace._id,
        customerInfo: {
          name: 'John Doe',
          email: 'invalid-email', // Invalid email
          phone: '0123456789'
        },
        bookingDetails: {
          checkInDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Past date
          checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          numberOfGuests: 0, // Invalid number
          numberOfRooms: 1
        },
        pricing: {
          roomPrice: 800000,
          totalAmount: 800000
        }
      };

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidBookingData)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should return 401 for unauthorized access', async () => {
      const bookingData = {
        place: testPlace._id,
        customerInfo: {
          name: 'John Doe',
          email: 'john@test.com',
          phone: '0123456789'
        }
      };

      await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(401);
    });
  });

  describe('GET /api/bookings/user', () => {
    beforeEach(async () => {
      // Create a test booking
      testBooking = await Booking.create({
        bookingNumber: `BK${Date.now().toString().slice(-6)}0001`,
        user: testUser._id,
        place: testPlace._id,
        customerInfo: {
          name: 'John Doe',
          email: 'john@test.com',
          phone: '0123456789'
        },
        bookingDetails: {
          checkInDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          numberOfGuests: 2,
          numberOfRooms: 1
        },
        pricing: {
          roomPrice: 800000,
          totalAmount: 800000,
          currency: 'VND'
        }
      });
    });

    it('should get user bookings successfully', async () => {
      const res = await request(app)
        .get('/api/bookings/user')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.bookings)).toBe(true);
      expect(res.body.data.bookings.length).toBeGreaterThan(0);
      // Note: user is not populated in /user endpoint, only place is populated
      expect(res.body.data.bookings[0].place).toBeDefined();
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/bookings/user?page=1&limit=5')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('pagination');
      expect(res.body.data.pagination.current).toBe(1);
      expect(res.body.data.pagination.limit).toBe(5);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/bookings/user?status=pending')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.bookings.every(booking => booking.status === 'pending')).toBe(true);
    });
  });

  describe('GET /api/bookings/:id', () => {
    beforeEach(async () => {
      testBooking = await Booking.create({
        bookingNumber: `BK${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`,
        user: testUser._id,
        place: testPlace._id,
        customerInfo: {
          name: 'John Doe',
          email: 'john@test.com',
          phone: '0123456789'
        },
        bookingDetails: {
          checkInDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          numberOfGuests: 2,
          numberOfRooms: 1
        },
        pricing: {
          roomPrice: 800000,
          totalAmount: 800000,
          currency: 'VND'
        }
      });
    });

    it('should get booking by ID successfully', async () => {
      const res = await request(app)
        .get(`/api/bookings/${testBooking._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(testBooking._id.toString());
      expect(res.body.data.user._id).toBe(testUser._id.toString());
    });

    it('should return 404 for non-existent booking', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/bookings/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should return 403 for unauthorized access to other user booking', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: `other${Date.now()}@test.com`,
        password: await bcrypt.hash('password123', 10),
        role: 'user'
      });
      const otherUserToken = jwt.sign(
        { user: { id: otherUser._id, role: otherUser.role } },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .get(`/api/bookings/${testBooking._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/bookings/:id', () => {
    beforeEach(async () => {
      testBooking = await Booking.create({
        bookingNumber: `BK${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`,
        user: testUser._id,
        place: testPlace._id,
        customerInfo: {
          name: 'John Doe',
          email: 'john@test.com',
          phone: '0123456789'
        },
        bookingDetails: {
          checkInDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          numberOfGuests: 2,
          numberOfRooms: 1
        },
        pricing: {
          roomPrice: 800000,
          totalAmount: 800000,
          currency: 'VND'
        }
      });
    });

    it('should update booking successfully', async () => {
      const updateData = {
        customerInfo: {
          name: 'Jane Doe',
          email: 'jane@test.com',
          phone: '0987654321'
        },
        'notes.customerNotes': 'Updated notes'
      };

      const res = await request(app)
        .put(`/api/bookings/${testBooking._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.customerInfo.name).toBe('Jane Doe');
    });

    it('should return 404 for non-existent booking', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/bookings/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ customerInfo: { name: 'Test' } })
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    beforeEach(async () => {
      testBooking = await Booking.create({
        bookingNumber: `BK${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`,
        user: testUser._id,
        place: testPlace._id,
        customerInfo: {
          name: 'John Doe',
          email: 'john@test.com',
          phone: '0123456789'
        },
        bookingDetails: {
          checkInDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          numberOfGuests: 2,
          numberOfRooms: 1
        },
        pricing: {
          roomPrice: 800000,
          totalAmount: 800000,
          currency: 'VND'
        }
      });
    });

    it('should cancel booking successfully', async () => {
      const res = await request(app)
        .delete(`/api/bookings/${testBooking._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('cancelled');
    });

    it('should return 404 for non-existent booking', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/bookings/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/bookings/place/:placeId', () => {
    beforeEach(async () => {
      testBooking = await Booking.create({
        bookingNumber: `BK${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`,
        user: testUser._id,
        place: testPlace._id,
        customerInfo: {
          name: 'John Doe',
          email: 'john@test.com',
          phone: '0123456789'
        },
        bookingDetails: {
          checkInDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          numberOfGuests: 2,
          numberOfRooms: 1
        },
        pricing: {
          roomPrice: 800000,
          totalAmount: 800000,
          currency: 'VND'
        }
      });
    });

    it('should get place bookings for owner', async () => {
      const res = await request(app)
        .get(`/api/bookings/place/${testPlace._id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.bookings)).toBe(true);
    });

    it('should get place bookings for admin', async () => {
      const res = await request(app)
        .get(`/api/bookings/place/${testPlace._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.bookings)).toBe(true);
    });

    it('should return 403 for regular user', async () => {
      const res = await request(app)
        .get(`/api/bookings/place/${testPlace._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });
});