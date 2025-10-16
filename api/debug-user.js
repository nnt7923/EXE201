const axios = require('axios');

async function testRealUserApi() {
  try {
    console.log('=== TESTING API WITH REAL USER ===');
    
    // Login với user có subscription thực tế
    console.log('🔐 Logging in with phat@gmail.com...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'phat@gmail.com',
      password: '1234567'
    });

    if (loginResponse.data.success) {
      const token = loginResponse.data.data?.token || loginResponse.data.token;
      console.log('✅ Login successful');
      
      // Test /users/me endpoint
      console.log('\n📋 Testing /users/me endpoint...');
      const userResponse = await axios.get('http://localhost:5000/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (userResponse.data.success) {
        console.log('✅ /users/me successful');
        
        const user = userResponse.data.data.user;
        console.log('\n📊 User Data Analysis:');
        console.log('- Email:', user.email);
        console.log('- Name:', user.name);
        console.log('- Has subscriptionPlan:', !!user.subscriptionPlan);
        if (user.subscriptionPlan) {
          console.log('- Plan name:', user.subscriptionPlan.name);
          console.log('- AI Suggestion Limit:', user.subscriptionPlan.aiSuggestionLimit);
          console.log('- Supports AI:', user.subscriptionPlan.supportsAI);
        }
        console.log('- AI Suggestions Used:', user.aiSuggestionsUsed);
        console.log('- Subscription End Date:', user.subscriptionEndDate);
        
        // Test AI itinerary suggestions endpoint
        console.log('\n🤖 Testing AI itinerary suggestions...');
        try {
          const aiResponse = await axios.post('http://localhost:5000/api/ai/itinerary-suggestions', {
            destination: 'Hà Nội',
            duration: 3,
            budget: 5000000,
            interests: ['văn hóa', 'ẩm thực']
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (aiResponse.data.success) {
            console.log('✅ AI itinerary suggestions successful');
            console.log('Response data keys:', Object.keys(aiResponse.data.data));
            if (aiResponse.data.data.aiUsage) {
              console.log('AI Usage info:', aiResponse.data.data.aiUsage);
            }
          } else {
            console.log('❌ AI suggestions failed:', aiResponse.data.message);
          }
        } catch (aiError) {
          console.log('❌ AI suggestions error:', aiError.response?.data || aiError.message);
        }
        
        // Test lại /users/me để xem AI usage có cập nhật không
        console.log('\n🔄 Re-checking /users/me after AI usage...');
        const userResponse2 = await axios.get('http://localhost:5000/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (userResponse2.data.success) {
          const user2 = userResponse2.data.data.user;
          console.log('- AI Suggestions Used (after):', user2.aiSuggestionsUsed);
          console.log('- Remaining AI suggestions:', 
            (user2.subscriptionPlan?.aiSuggestionLimit || 0) - (user2.aiSuggestionsUsed || 0));
        }
        
      } else {
        console.log('❌ /users/me failed:', userResponse.data.message);
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testRealUserApi();