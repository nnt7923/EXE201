const mongoose = require('mongoose');
const path = require('path');

// Load test environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') });

// Set test environment variables
process.env.NODE_ENV = 'test';

// Increase timeout for database operations
jest.setTimeout(30000);

// Global setup
beforeAll(async () => {
  // Ensure we're using test database
  if (!process.env.MONGODB_URI.includes('test')) {
    throw new Error('Test must use a test database. Set MONGODB_URI to include "test"');
  }
});

// Global teardown
afterAll(async () => {
  // Close all database connections
  await mongoose.disconnect();
});

// Suppress console.log during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };