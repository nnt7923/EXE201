const axios = require('axios');

const testAiItinerary = async () => {
  try {
    console.log('🔐 Logging in...');
    
    // Login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Test AI itinerary suggestions
    console.log('🤖 Testing AI itinerary suggestions...');
    const itineraryResponse = await axios.post('http://localhost:5000/api/ai/itinerary-suggestions', {
      destination: 'Hà Nội',
      duration: 3,
      budget: '5 triệu VND',
      interests: ['ẩm thực', 'văn hóa', 'lịch sử']
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ AI Itinerary Response:', JSON.stringify(itineraryResponse.data, null, 2));

  } catch (error) {
    if (error.response) {
      console.log('❌ Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
};

testAiItinerary();