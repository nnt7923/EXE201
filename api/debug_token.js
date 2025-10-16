const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function debugToken() {
  try {
    // First login to get token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'ngoquocan712@gmail.com',
      password: '1234567'
    });

    console.log('📋 Full login response:', JSON.stringify(loginResponse.data, null, 2));

    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      
      // Check different possible token fields
      const token = loginResponse.data.token || loginResponse.data.accessToken || loginResponse.data.data?.token;
      
      console.log('🔍 Token:', token);
      console.log('🔍 JWT_SECRET exists:', !!process.env.JWT_SECRET);
      console.log('🔍 JWT_SECRET length:', process.env.JWT_SECRET?.length);
      
      if (token) {
        // Try to decode token
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          console.log('✅ Token decoded successfully:', decoded);
        } catch (decodeError) {
          console.log('❌ Token decode error:', decodeError.message);
        }

        // Test AI endpoint
        console.log('🤖 Testing AI endpoint...');
        const aiResponse = await axios.post('http://localhost:5000/api/itineraries/ai-suggestion', {
          destination: 'Hà Nội',
          duration: 3,
          budget: 1000000,
          interests: ['văn hóa', 'ẩm thực']
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ AI endpoint response:', aiResponse.data);
      } else {
        console.log('❌ No token found in response');
      }

    } else {
      console.log('❌ Login failed:', loginResponse.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugToken();