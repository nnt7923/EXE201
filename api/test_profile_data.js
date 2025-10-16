require('dotenv').config();
const axios = require('axios');

async function testProfileData() {
  try {
    // Đăng nhập để lấy token mới
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'truongnn23790@gmail.com',
      password: '123456'
    });
    
    console.log('Login response:', loginResponse.data);
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, token received:', token ? 'YES' : 'NO');
    console.log('Token length:', token ? token.length : 'N/A');
    
    console.log('🔍 Testing /users/me endpoint...');
    
    const response = await axios.get('http://localhost:5000/api/users/me', {
      headers: { 
        Authorization: `Bearer ${token}` 
      }
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('\n=== FULL RESPONSE DATA ===');
    console.log(JSON.stringify(response.data, null, 2));
    
    const user = response.data.data.user;
    console.log('\n=== USER SUBSCRIPTION INFO ===');
    console.log('subscriptionPlan:', user.subscriptionPlan);
    console.log('aiSuggestionsUsed:', user.aiSuggestionsUsed);
    console.log('subscriptionEndDate:', user.subscriptionEndDate);
    
    console.log('\n=== SUBSCRIPTION PLAN DETAILS ===');
    if (user.subscriptionPlan) {
      console.log('Plan Name:', user.subscriptionPlan.name);
      console.log('AI Limit:', user.subscriptionPlan.aiSuggestionLimit);
      console.log('Price:', user.subscriptionPlan.price);
    } else {
      console.log('❌ No subscription plan found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testProfileData();