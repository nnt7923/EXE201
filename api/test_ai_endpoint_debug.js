const axios = require('axios');

async function testAiEndpoint() {
  try {
    // First login to get token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'ngoquocan712@gmail.com',
      password: '1234567'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      const token = loginResponse.data.token;

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
      console.log('❌ Login failed:', loginResponse.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAiEndpoint();