const axios = require('axios');

async function testCurrentUserAi() {
  try {
    console.log('🔐 Logging in with subscription user...');
    
    // Login với user có subscription
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'truongnn23790@gmail.com',
      password: '123456' // Password đã được reset
    });

    console.log('📋 Login response:', JSON.stringify(loginResponse.data, null, 2));

    if (loginResponse.data.success) {
      const token = loginResponse.data.data?.token || loginResponse.data.token;
      console.log('✅ Login successful, token:', token ? 'exists' : 'missing');

      if (token) {
        // Test AI endpoint
        console.log('🤖 Testing AI itinerary endpoint...');
        try {
          const aiResponse = await axios.post('http://localhost:5000/api/itineraries/ai-suggestion', {
            location: 'Hà Nội',
            duration: 3,
            budget: 1000000,
            interests: ['văn hóa', 'ẩm thực']
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('✅ AI endpoint response:', JSON.stringify(aiResponse.data, null, 2));
        } catch (aiError) {
          console.log('❌ AI endpoint error:', aiError.response?.data || aiError.message);
        }
      }
    } else {
      console.log('❌ Login failed, trying different password...');
      
      // Thử password khác
      const loginResponse2 = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'truongnn23790@gmail.com',
        password: 'password123'
      });

      console.log('📋 Second login attempt:', JSON.stringify(loginResponse2.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCurrentUserAi();