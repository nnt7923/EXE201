const axios = require('axios');

async function testProductionAI() {
  console.log('🌐 === KIỂM TRA CHỨC NĂNG AI TRÊN PRODUCTION ===\n');
  
  const productionAPI = 'https://an-gi-o-dau-api-64eh.onrender.com/api';
  const localAPI = 'http://localhost:5000/api';
  
  // Test credentials
  const testUser = {
    email: 'phat@gmail.com',
    password: '1234567'
  };

  console.log('🔍 Testing Production vs Local API...\n');

  // Test Production API
  console.log('🌐 === PRODUCTION API TEST ===');
  await testAPI(productionAPI, 'PRODUCTION');
  
  console.log('\n🏠 === LOCAL API TEST ===');
  await testAPI(localAPI, 'LOCAL');
}

async function testAPI(baseURL, environment) {
  try {
    console.log(`\n📡 Testing ${environment} API: ${baseURL}`);
    
    // 1. Test API Health
    console.log('🏥 1. Checking API health...');
    try {
      const healthResponse = await axios.get(`${baseURL.replace('/api', '')}/health`, {
        timeout: 10000
      });
      console.log(`✅ ${environment} API is healthy`);
    } catch (error) {
      console.log(`❌ ${environment} API health check failed:`, error.message);
      return;
    }

    // 2. Test Login
    console.log('🔐 2. Testing login...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'phat@gmail.com',
      password: '1234567'
    }, { timeout: 10000 });

    if (!loginResponse.data.success) {
      console.log(`❌ ${environment} Login failed:`, loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.data?.token || loginResponse.data.token;
    console.log(`✅ ${environment} Login successful`);

    // 3. Test /users/me
    console.log('👤 3. Testing /users/me...');
    const userResponse = await axios.get(`${baseURL}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
      timeout: 10000
    });

    if (userResponse.data.success) {
      const user = userResponse.data.data.user;
      console.log(`✅ ${environment} User info retrieved:`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Plan: ${user.subscriptionPlan?.name || 'None'}`);
      console.log(`   - AI Limit: ${user.subscriptionPlan?.aiSuggestionLimit || 0}`);
      console.log(`   - AI Used: ${user.aiSuggestionsUsed || 0}`);
      console.log(`   - AI Remaining: ${(user.subscriptionPlan?.aiSuggestionLimit || 0) - (user.aiSuggestionsUsed || 0)}`);
      
      if (!user.subscriptionPlan) {
        console.log(`⚠️  ${environment} WARNING: No subscription plan found!`);
        return;
      }
    } else {
      console.log(`❌ ${environment} Failed to get user info:`, userResponse.data.message);
      return;
    }

    // 4. Test AI Itinerary Suggestions
    console.log('🤖 4. Testing AI Itinerary Suggestions...');
    try {
      const aiResponse = await axios.post(`${baseURL}/ai/itinerary-suggestions`, {
        destination: 'Hà Nội',
        duration: 2,
        budget: 3000000,
        interests: ['văn hóa', 'ẩm thực']
      }, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 30000 // AI calls take longer
      });

      if (aiResponse.data.success) {
        console.log(`✅ ${environment} AI Suggestions successful!`);
        const data = aiResponse.data.data;
        console.log(`   - Title: ${data.title || 'N/A'}`);
        console.log(`   - Content length: ${data.content ? data.content.length : 0} chars`);
        console.log(`   - Cost: ${data.totalEstimatedCost || 'N/A'}`);
      } else {
        console.log(`❌ ${environment} AI Suggestions failed:`, aiResponse.data.message);
      }
    } catch (aiError) {
      console.log(`❌ ${environment} AI Suggestions error:`, aiError.response?.data?.message || aiError.message);
      
      if (aiError.code === 'ECONNABORTED') {
        console.log(`⏰ ${environment} AI request timed out - this might indicate server issues`);
      }
    }

    // 5. Check Environment Variables
    console.log('🔧 5. Checking environment configuration...');
    try {
      const configResponse = await axios.get(`${baseURL}/health/config`, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 5000
      });
      
      if (configResponse.data.success) {
        console.log(`✅ ${environment} Environment config OK`);
      }
    } catch (error) {
      console.log(`⚠️  ${environment} Could not check environment config`);
    }

  } catch (error) {
    console.log(`❌ ${environment} API Test failed:`, error.response?.data?.message || error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log(`🌐 ${environment} DNS resolution failed - server might be down`);
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`🔌 ${environment} Connection refused - server not responding`);
    } else if (error.code === 'ECONNABORTED') {
      console.log(`⏰ ${environment} Request timeout - server too slow`);
    }
  }
}

// Chạy test
testProductionAI().then(() => {
  console.log('\n🏁 === TEST COMPLETED ===');
  console.log('Compare the results above to identify the issue.');
}).catch(error => {
  console.error('❌ Test script error:', error.message);
});