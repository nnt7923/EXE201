const axios = require('axios');

const testGeminiIntegration = async () => {
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
    console.log('🤖 Testing AI itinerary suggestions with Gemini...');
    const itineraryResponse = await axios.post('http://localhost:5000/api/ai/itinerary-suggestions', {
      destination: 'Đà Nẵng',
      duration: 3,
      budget: '10 triệu VND',
      interests: ['biển', 'ẩm thực', 'chùa chiền']
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ AI Itinerary Response:', JSON.stringify(itineraryResponse.data, null, 2));

    // Test AI place suggestions
    console.log('🏞️ Testing AI place suggestions with Gemini...');
    const placeResponse = await axios.post('http://localhost:5000/api/ai/place-suggestions', {
      query: 'bãi biển đẹp miền Trung'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ AI Place Response:', JSON.stringify(placeResponse.data, null, 2));

  } catch (error) {
    if (error.response) {
      console.log('❌ Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
};

testGeminiIntegration();