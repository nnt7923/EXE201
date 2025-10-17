const axios = require('axios');

async function checkUserSubscription() {
  console.log('🔍 Checking User Subscription Status...\n');
  
  const baseURL = 'https://an-gi-o-dau-api-64eh.onrender.com/api';
  
  try {
    // 1. Login
    console.log('🔐 1. Logging in...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // 2. Get user info
    console.log('\n👤 2. Getting user info...');
    const userResponse = await axios.get(`${baseURL}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (userResponse.data.success) {
      const user = userResponse.data.data.user;
      console.log('✅ User info retrieved');
      console.log('User details:');
      console.log('- Email:', user.email);
      console.log('- Role:', user.role);
      console.log('- Subscription Plan:', user.subscriptionPlan?.name || 'None');
      console.log('- Subscription Status:', user.subscriptionStatus || 'None');
      console.log('- Subscription End Date:', user.subscriptionEndDate || 'None');
      console.log('- AI Suggestions Used:', user.aiSuggestionsUsed || 0);
      console.log('- AI Suggestion Limit:', user.subscriptionPlan?.aiSuggestionLimit || 0);
    }
    
    // 3. Get available plans
    console.log('\n📋 3. Getting available subscription plans...');
    const plansResponse = await axios.get(`${baseURL}/subscriptions/plans`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (plansResponse.data.success) {
      console.log('✅ Available plans:');
      plansResponse.data.data.forEach((plan, index) => {
        console.log(`${index + 1}. ${plan.name}:`);
        console.log(`   - Price: ${plan.price.toLocaleString()} VND/${plan.duration}`);
        console.log(`   - AI Limit: ${plan.aiSuggestionLimit}`);
        console.log(`   - Features: ${plan.features.join(', ')}`);
      });
    }
    
    // 4. Try to subscribe to a plan (Premium)
    console.log('\n💳 4. Attempting to subscribe to Premium plan...');
    try {
      const subscribeResponse = await axios.post(`${baseURL}/subscriptions/subscribe`, {
        planId: '6751b8b7e5b123456789abcd', // Premium plan ID
        customerInfo: {
          name: 'Admin User',
          email: 'admin@example.com',
          phone: '0123456789'
        },
        paymentMethod: 'bank_transfer'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (subscribeResponse.data.success) {
        console.log('✅ Subscription successful');
        console.log('Subscription details:', subscribeResponse.data.data);
      } else {
        console.log('❌ Subscription failed:', subscribeResponse.data.message);
      }
    } catch (subError) {
      console.log('❌ Subscription error:', subError.response?.data?.message || subError.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkUserSubscription();