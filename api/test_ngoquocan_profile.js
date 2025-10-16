require('dotenv').config();
const axios = require('axios');

async function testNgoquocanProfile() {
  try {
    // Đăng nhập để lấy token
    console.log('🔐 Logging in as ngoquocan712@gmail.com...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'ngoquocan712@gmail.com',
      password: '123456'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, token received:', token ? 'YES' : 'NO');
    
    console.log('🔍 Testing /users/me endpoint...');
    
    const response = await axios.get('http://localhost:5000/api/users/me', {
      headers: { 
        Authorization: `Bearer ${token}` 
      }
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('\n=== USER PROFILE DATA ===');
    const user = response.data.data.user;
    
    console.log('User Info:');
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    
    console.log('\nSubscription Info:');
    if (user.subscriptionPlan) {
      console.log('✅ Subscription Plan:', user.subscriptionPlan.name);
      console.log('- Price:', user.subscriptionPlan.price);
      console.log('- AI Limit:', user.subscriptionPlan.aiSuggestionLimit);
      console.log('- End Date:', user.subscriptionEndDate);
      console.log('- AI Used:', user.aiSuggestionsUsed);
    } else {
      console.log('❌ No subscription plan found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testNgoquocanProfile();