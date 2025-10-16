const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testUserLogin() {
  try {
    console.log('🔐 Testing user login...');
    
    // Login with the created user
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'testuser@example.com',
      password: 'password123'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      console.log('User data:', JSON.stringify(loginResponse.data.data, null, 2));
      
      const token = loginResponse.data.data.token;
      const user = loginResponse.data.data.user;
      
      console.log('\n📋 User subscription info:');
      console.log('- Subscription Plan:', user.subscriptionPlan);
      console.log('- AI Suggestions Used:', user.aiSuggestionsUsed);
      console.log('- Subscription End Date:', user.subscriptionEndDate);
      
      // Test AI endpoint
      console.log('\n🤖 Testing AI endpoint...');
      try {
        const aiResponse = await axios.post(`${API_BASE}/itineraries/ai-suggestion`, {
          location: 'Hà Nội',
          duration: 3,
          budget: '5000000',
          interests: ['văn hóa', 'ẩm thực']
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (aiResponse.data.success) {
          console.log('✅ AI endpoint works!');
          console.log('AI response:', JSON.stringify(aiResponse.data.data, null, 2));
        } else {
          console.log('❌ AI endpoint failed:', aiResponse.data.message);
        }
      } catch (aiError) {
        console.log('❌ AI endpoint error:', aiError.response?.data || aiError.message);
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testUserLogin();