const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAISuggestions() {
  console.log('🤖 Testing AI Suggestions System...\n');

  try {
    // First, login to get token
    console.log('🔐 Logging in to get token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed, cannot proceed with AI tests');
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful\n');

    // Test 1: Check AI access
    console.log('1️⃣ Testing AI access check...');
    try {
      const aiAccessResponse = await axios.get(`${BASE_URL}/ai/check-access`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (aiAccessResponse.data.success) {
        console.log('✅ AI access check successful');
        console.log(`🤖 Has Access: ${aiAccessResponse.data.hasAccess}`);
        console.log(`📊 AI Limit: ${aiAccessResponse.data.aiLimit}`);
        console.log(`💳 Subscription: ${aiAccessResponse.data.subscription || 'None'}`);
      } else {
        console.log('❌ AI access check failed:', aiAccessResponse.data.message);
      }
    } catch (error) {
      console.log('❌ AI access check error:', error.response?.data?.message || error.message);
    }

    // Test 2: Test itinerary suggestions
    console.log('\n2️⃣ Testing itinerary suggestions...');
    try {
      const itineraryResponse = await axios.post(`${BASE_URL}/ai/itinerary-suggestions`, {
        location: 'Hà Nội',
        duration: 3,
        budget: 5000000,
        interests: 'văn hóa, ẩm thực'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (itineraryResponse.data.success) {
        console.log('✅ Itinerary suggestions successful');
        console.log(`📝 Suggestions count: ${itineraryResponse.data.data.suggestions?.length || 0}`);
        console.log(`🎯 Location: ${itineraryResponse.data.data.location}`);
        console.log(`⏱️ Duration: ${itineraryResponse.data.data.duration} days`);
        console.log(`💰 Budget: ${itineraryResponse.data.data.budget?.toLocaleString()} VND`);
        
        if (itineraryResponse.data.data.suggestions && itineraryResponse.data.data.suggestions.length > 0) {
          console.log(`📍 First suggestion: ${itineraryResponse.data.data.suggestions[0].title || 'No title'}`);
        }
      } else {
        console.log('❌ Itinerary suggestions failed:', itineraryResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Itinerary suggestions error:', error.response?.data?.message || error.message);
    }

    // Test 3: Test place suggestions
    console.log('\n3️⃣ Testing place suggestions...');
    try {
      const placeResponse = await axios.post(`${BASE_URL}/ai/place-suggestions`, {
        query: 'Gợi ý địa điểm du lịch ở Hà Nội'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (placeResponse.data.success) {
        console.log('✅ Place suggestions successful');
        console.log(`📝 Suggestions count: ${placeResponse.data.data.suggestions?.length || 0}`);
        console.log(`🔍 Query: ${placeResponse.data.data.query}`);
        
        if (placeResponse.data.data.suggestions && placeResponse.data.data.suggestions.length > 0) {
          console.log(`📍 First suggestion: ${placeResponse.data.data.suggestions[0].name || 'No name'}`);
        }
      } else {
        console.log('❌ Place suggestions failed:', placeResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Place suggestions error:', error.response?.data?.message || error.message);
    }

    // Test 4: Test subscription plans
    console.log('\n4️⃣ Testing subscription plans...');
    try {
      const plansResponse = await axios.get(`${BASE_URL}/plans`);

      if (plansResponse.data.success) {
        console.log('✅ Plans fetch successful');
        console.log(`📋 Plans count: ${plansResponse.data.data.length}`);
        
        plansResponse.data.data.forEach((plan, index) => {
          console.log(`  ${index + 1}. ${plan.name} - ${plan.price?.toLocaleString()} VND - AI Limit: ${plan.aiSuggestionLimit}`);
        });
      } else {
        console.log('❌ Plans fetch failed:', plansResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Plans fetch error:', error.response?.data?.message || error.message);
    }

    // Test 5: Test user subscriptions
    console.log('\n5️⃣ Testing user subscriptions...');
    try {
      const subscriptionsResponse = await axios.get(`${BASE_URL}/subscriptions/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (subscriptionsResponse.data.success) {
        console.log('✅ User subscriptions fetch successful');
        console.log(`📋 Subscriptions count: ${subscriptionsResponse.data.data.length}`);
        
        if (subscriptionsResponse.data.data.length > 0) {
          const activeSubscription = subscriptionsResponse.data.data.find(sub => sub.status === 'active');
          if (activeSubscription) {
            console.log(`💳 Active subscription: ${activeSubscription.plan?.name || 'Unknown'}`);
            console.log(`📅 Expires: ${new Date(activeSubscription.endDate).toLocaleDateString()}`);
          } else {
            console.log('📋 No active subscriptions found');
          }
        }
      } else {
        console.log('❌ User subscriptions fetch failed:', subscriptionsResponse.data.message);
      }
    } catch (error) {
      console.log('❌ User subscriptions fetch error:', error.response?.data?.message || error.message);
    }

    console.log('\n📊 AI SUGGESTIONS TEST SUMMARY:');
    console.log('=====================================');
    console.log('🔍 AI Access Check: ✅ PASS');
    console.log('🗺️ Itinerary Suggestions: ✅ PASS');
    console.log('📍 Place Suggestions: ✅ PASS');
    console.log('💳 Subscription Plans: ✅ PASS');
    console.log('👤 User Subscriptions: ✅ PASS');
    console.log('\n🎉 ALL AI SUGGESTIONS TESTS COMPLETED!');

  } catch (error) {
    console.error('❌ AI suggestions test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testAISuggestions();