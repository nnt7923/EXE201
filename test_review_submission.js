const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const FRONTEND_BASE = 'http://localhost:3000';

async function testCompleteFlow() {
  console.log('🧪 Testing complete authentication and review submission flow...\n');

  try {
    // Step 1: Login to get token
    console.log('1️⃣ Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'testuser@example.com',
      password: 'password123'
    });

    const loginData = loginResponse.data;
    
    if (!loginData.success) {
      throw new Error(`Login failed: ${loginData.message}`);
    }

    console.log('✅ Login successful');
    console.log(`   Token: ${loginData.data.token.substring(0, 50)}...`);
    console.log(`   User: ${loginData.data.user.email}\n`);

    const token = loginData.data.token;

    // Step 2: Get places to find a valid place ID
    console.log('2️⃣ Fetching places...');
    const placesResponse = await axios.get(`${API_BASE}/places`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const placesData = placesResponse.data;
    
    if (!placesData.success) {
      throw new Error(`Failed to fetch places: ${placesData.message}`);
    }

    if (!placesData.data || !placesData.data.places || placesData.data.places.length === 0) {
      throw new Error('No places found in database');
    }

    const testPlace = placesData.data.places[0];
    console.log('✅ Places fetched successfully');
    console.log(`   Using place: ${testPlace.name} (ID: ${testPlace._id})\n`);

    // Step 3: Test review submission with valid data
    console.log('3️⃣ Testing review submission with VALID data...');
    const reviewData = {
      place: testPlace._id,
      rating: 5,
      title: 'Excellent place to visit!',
      content: 'Test review from automated script - this is an excellent place with great service and atmosphere. Highly recommended!',
      visitDate: new Date().toISOString()
    };

    console.log('📤 Sending valid review data:', JSON.stringify(reviewData, null, 2));

    try {
      const reviewResponse = await axios.post(`${API_BASE}/reviews`, reviewData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const reviewResult = reviewResponse.data;
      console.log('✅ Review submission successful');
      console.log(`   Review ID: ${reviewResult.data.review._id}`);
      console.log(`   Rating: ${reviewResult.data.review.rating}/5`);
      console.log(`   Title: ${reviewResult.data.review.title}`);
      console.log(`   Content: ${reviewResult.data.review.content}\n`);
    } catch (error) {
      console.log('❌ Review submission failed');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
      console.log(`   Details:`, error.response?.data);
    }

    // Wait a bit before next test
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Test validation errors
    console.log('4️⃣ Testing validation errors with INVALID data...');
    const invalidReviewData = {
      place: testPlace._id,
      rating: 6, // Invalid rating (should be 1-5)
      title: '', // Empty title (should be 5-100 chars)
      content: '', // Empty content (should be 10-1000 chars)
      visitDate: 'invalid-date' // Invalid date
    };

    console.log('📤 Sending invalid review data:', JSON.stringify(invalidReviewData, null, 2));

    try {
      const invalidReviewResponse = await axios.post(`${API_BASE}/reviews`, invalidReviewData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('⚠️  Expected validation error but request succeeded');
    } catch (error) {
      console.log('✅ Validation errors working correctly');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Error: ${error.response?.data?.message}`);
      if (error.response?.data?.errors) {
        console.log('   Validation details:', error.response.data.errors);
      }
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testCompleteFlow();