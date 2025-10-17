const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testMiddleware() {
  try {
    console.log('🧪 Testing middleware...');
    
    // 1. Login to get token
    console.log('\n🔐 1. Testing admin login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Admin login failed:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Admin login successful');
    console.log('🔑 Token:', token ? token.substring(0, 20) + '...' : 'No token received');
    console.log('📋 Login response:', loginResponse.data);

    // 2. Test protected route with token
    console.log('\n📊 2. Testing protected route...');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      console.log('📤 Making request with headers:', headers);
      
      const response = await axios.get(`${BASE_URL}/subscriptions/user`, { headers });
      console.log('✅ Protected route successful');
      console.log('📋 Response:', response.data);
    } catch (error) {
      console.log('❌ Protected route failed:', error.response?.data?.message || error.message);
      console.log('📋 Error details:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMiddleware();