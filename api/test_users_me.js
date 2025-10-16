const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testUsersMe() {
  try {
    console.log('🔐 Testing /users/me endpoint...');
    
    // Login first
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'testuser@example.com',
      password: 'password123'
    });

    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      
      // Test /users/me endpoint
      console.log('\n📋 Testing /users/me endpoint...');
      const meResponse = await axios.get(`${API_BASE}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (meResponse.data.success) {
        console.log('✅ /users/me endpoint works!');
        console.log('User data from /users/me:');
        console.log(JSON.stringify(meResponse.data.data.user, null, 2));
        
        const user = meResponse.data.data.user;
        console.log('\n📊 Subscription info:');
        console.log('- Has subscription plan:', !!user.subscriptionPlan);
        if (user.subscriptionPlan) {
          console.log('- Plan name:', user.subscriptionPlan.name);
          console.log('- AI Suggestion Limit:', user.subscriptionPlan.aiSuggestionLimit);
          console.log('- AI Suggestions Used:', user.aiSuggestionsUsed);
        }
        console.log('- Subscription End Date:', user.subscriptionEndDate);
        
      } else {
        console.log('❌ /users/me failed:', meResponse.data.message);
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testUsersMe();