const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('../server'); // Import your Express app
const User = require('../models/User');

// Use a separate test database
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau-test';

describe('Auth API', () => {
  // Connect to the test database before all tests
  beforeAll(async () => {
    await mongoose.connect(mongoUri, {});
  });

  // Clear the users collection after each test
  afterEach(async () => {
    await User.deleteMany({});
  });

  // Disconnect from the database after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // --- Test Suite for User Registration ---
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(200); // Based on your code, it returns 200, not 201
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.name).toBe('Test User');
      expect(res.body.data.user).not.toHaveProperty('password');

      // Verify user was actually created in the DB
      const userInDb = await User.findOne({ email: 'test@example.com' });
      expect(userInDb).not.toBeNull();
    });

    it('should return 400 if user already exists', async () => {
      // First, create a user
      const user = new User({ name: 'Existing User', email: 'existing@example.com', password: 'password123' });
      await user.save();

      // Then, try to register with the same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'existing@example.com',
          password: 'password456',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.msg).toBe('User already exists');
    });

    it('should return 400 on validation error (e.g., invalid email)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'not-an-email',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0].msg).toBe('Please include a valid email');
    });

    it('should return 400 if password is less than 6 characters', async () => {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User',
            email: 'shortpass@example.com',
            password: '12345',
          });
  
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors[0].msg).toBe('Please enter a password with 6 or more characters');
      });
  });

  // --- Test Suite for User Login ---
  describe('POST /api/auth/login', () => {
    // Seed a user before each login test
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      await User.create({
        name: 'Login User',
        email: 'login@example.com',
        password: hashedPassword,
      });
    });

    it('should log in an existing user and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('login@example.com');
    });

    it('should return 400 for incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.msg).toBe('Invalid Credentials');
    });

    it('should return 400 for a non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nouser@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.msg).toBe('Invalid Credentials');
    });
  });
});
