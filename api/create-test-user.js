const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.API_BASE_URL || 'https://an-gi-o-dau-api-64eh.onrender.com/';

const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

async function createTestUser() {
  try {
    console.log('👤 Creating test user...');
    console.log('📧 Email:', TEST_USER.email);
    
    const response = await axios.post(`${BASE_URL}/auth/register`, TEST_USER);
    
    if (response.data.success) {
      console.log('✅ Test user created successfully');
      console.log('🆔 User ID:', response.data.user.id);
      console.log('📧 Email:', response.data.user.email);
      console.log('👤 Name:', response.data.user.name);
      return true;
    } else {
      console.log('❌ Failed to create test user:', response.data.message);
      return false;
    }
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️ Test user already exists');
      return true;
    } else {
      console.log('❌ Error creating test user:', error.response?.data?.message || error.message);
      return false;
    }
  }
}

createTestUser().catch(console.error);