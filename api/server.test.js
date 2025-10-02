const request = require('supertest');
const app = require('./server'); // Import the Express app
const mongoose = require('mongoose');

describe('API Server', () => {
  // Close the database connection after all tests have run
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test for the health check endpoint
  it('should return 200 OK and a status message from /api/health', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect('Content-Type', /json/)
      .expect(200);

    // Check the response body
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('message', 'Ăn Gì Ở Đâu API is running!');
  });

  // Test for 404 Not Found on a random endpoint
  it('should return 404 for a non-existent route', async () => {
    const res = await request(app)
      .get('/api/this-route-does-not-exist')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message', 'API endpoint not found');
  });
});
