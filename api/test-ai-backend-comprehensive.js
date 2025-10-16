const axios = require('axios');
const mongoose = require('mongoose');
const AISuggestion = require('./models/AISuggestion');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

let authToken = '';

async function login() {
  try {
    console.log('🔐 Logging in test user...');
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
    
    if (response.data.success && response.data.data.token) {
      authToken = response.data.data.token;
      console.log('✅ Login successful');
      console.log('👤 User:', response.data.data.user.email);
      console.log('🎫 Token received');
      return true;
    } else {
      console.log('❌ Login failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.response?.data?.message || error.response?.data?.msg || error.message);
    return false;
  }
}

async function testAIAccess() {
  try {
    console.log('\n🔍 Testing AI access check...');
    const response = await axios.get(`${BASE_URL}/ai/check-access`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.success) {
      console.log('✅ AI access granted');
      console.log('📊 AI Limit:', response.data.data.aiLimit);
      console.log('💳 Subscription:', response.data.data.subscription.plan);
      return true;
    } else {
      console.log('❌ AI access denied:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ AI access error:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testItinerarySuggestions() {
  try {
    console.log('\n🗺️ Testing itinerary suggestions...');
    
    const requestData = {
      destination: 'Hà Nội',
      duration: 3,
      budget: 'MEDIUM',
      interests: ['Ẩm thực', 'Văn hóa', 'Lịch sử']
    };
    
    console.log('📤 Request data:', requestData);
    
    const startTime = Date.now();
    const response = await axios.post(`${BASE_URL}/ai/itinerary-suggestions`, requestData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    const endTime = Date.now();
    
    if (response.data.success) {
      console.log('✅ Itinerary suggestions generated');
      console.log('⏱️ Response time:', endTime - startTime, 'ms');
      console.log('📋 Title:', response.data.data.title);
      console.log('📝 Content length:', response.data.data.content?.length || 0, 'characters');
      console.log('💳 AI Limit remaining:', response.data.aiLimit);
      return response.data.data;
    } else {
      console.log('❌ Itinerary suggestions failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Itinerary suggestions error:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testPlaceSuggestions() {
  try {
    console.log('\n🏛️ Testing place suggestions...');
    
    const requestData = {
      query: 'Hà Nội'
    };
    
    console.log('📤 Request data:', requestData);
    
    const startTime = Date.now();
    const response = await axios.post(`${BASE_URL}/ai/place-suggestions`, requestData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    const endTime = Date.now();
    
    if (response.data.success) {
      console.log('✅ Place suggestions generated');
      console.log('⏱️ Response time:', endTime - startTime, 'ms');
      console.log('📍 Places count:', response.data.data?.length || 0);
      console.log('💳 AI Limit remaining:', response.data.aiLimit);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('🏛️ First place:', response.data.data[0].name);
      }
      
      return response.data.data;
    } else {
      console.log('❌ Place suggestions failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Place suggestions error:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testCachePerformance() {
  try {
    console.log('\n⚡ Testing cache performance...');
    
    // Connect to MongoDB to check cache
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing cache for clean test
    await AISuggestion.deleteMany({ userId: { $regex: /test/ } });
    console.log('🧹 Cleared test cache');
    
    const requestData = {
      destination: 'Đà Nẵng',
      duration: 2,
      budget: 'HIGH',
      interests: ['Biển', 'Ẩm thực']
    };
    
    // First request (should create cache)
    console.log('\n🔄 First request (creating cache)...');
    const startTime1 = Date.now();
    const response1 = await axios.post(`${BASE_URL}/ai/itinerary-suggestions`, requestData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    const endTime1 = Date.now();
    const time1 = endTime1 - startTime1;
    
    // Second request (should use cache)
    console.log('\n🔄 Second request (using cache)...');
    const startTime2 = Date.now();
    const response2 = await axios.post(`${BASE_URL}/ai/itinerary-suggestions`, requestData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    const endTime2 = Date.now();
    const time2 = endTime2 - startTime2;
    
    console.log('📊 Performance comparison:');
    console.log(`   First request: ${time1}ms`);
    console.log(`   Second request: ${time2}ms`);
    console.log(`   Speed improvement: ${((time1 - time2) / time1 * 100).toFixed(1)}%`);
    
    // Check cache in database
    const cacheEntries = await AISuggestion.find({});
    console.log(`💾 Cache entries in DB: ${cacheEntries.length}`);
    
    if (cacheEntries.length > 0) {
      const entry = cacheEntries[0];
      console.log(`📈 Usage count: ${entry.usageCount}`);
      console.log(`🕒 Last used: ${entry.lastUsed}`);
    }
    
    await mongoose.disconnect();
    
    return {
      firstRequestTime: time1,
      secondRequestTime: time2,
      speedImprovement: ((time1 - time2) / time1 * 100).toFixed(1),
      cacheEntries: cacheEntries.length
    };
    
  } catch (error) {
    console.log('❌ Cache performance test error:', error.message);
    return null;
  }
}

async function testErrorHandling() {
  try {
    console.log('\n🚨 Testing error handling...');
    
    // Test without authentication
    console.log('🔒 Testing without authentication...');
    try {
      await axios.post(`${BASE_URL}/ai/itinerary-suggestions`, {
        destination: 'Test',
        duration: 1,
        budget: 'LOW',
        interests: ['Test']
      });
      console.log('❌ Should have failed without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected unauthorized request');
      } else {
        console.log('⚠️ Unexpected error:', error.response?.status);
      }
    }
    
    // Test with invalid data
    console.log('📝 Testing with invalid data...');
    try {
      const response = await axios.post(`${BASE_URL}/ai/itinerary-suggestions`, {
        // Missing required fields
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('❌ Should have failed with invalid data');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected invalid data');
      } else {
        console.log('⚠️ Unexpected error:', error.response?.status);
      }
    }
    
    // Test with invalid token
    console.log('🎫 Testing with invalid token...');
    try {
      await axios.post(`${BASE_URL}/ai/itinerary-suggestions`, {
        destination: 'Test',
        duration: 1,
        budget: 'LOW',
        interests: ['Test']
      }, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      console.log('❌ Should have failed with invalid token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected invalid token');
      } else {
        console.log('⚠️ Unexpected error:', error.response?.status);
      }
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error handling test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive AI backend tests...\n');
  
  const results = {
    login: false,
    aiAccess: false,
    itinerarySuggestions: null,
    placeSuggestions: null,
    cachePerformance: null,
    errorHandling: false
  };
  
  // Test 1: Login
  results.login = await login();
  if (!results.login) {
    console.log('\n❌ Cannot proceed without login');
    return results;
  }
  
  // Test 2: AI Access
  results.aiAccess = await testAIAccess();
  if (!results.aiAccess) {
    console.log('\n❌ Cannot proceed without AI access');
    return results;
  }
  
  // Test 3: Itinerary Suggestions
  results.itinerarySuggestions = await testItinerarySuggestions();
  
  // Test 4: Place Suggestions
  results.placeSuggestions = await testPlaceSuggestions();
  
  // Test 5: Cache Performance
  results.cachePerformance = await testCachePerformance();
  
  // Test 6: Error Handling
  results.errorHandling = await testErrorHandling();
  
  // Summary
  console.log('\n📊 TEST SUMMARY:');
  console.log('================');
  console.log('🔐 Login:', results.login ? '✅ PASS' : '❌ FAIL');
  console.log('🔍 AI Access:', results.aiAccess ? '✅ PASS' : '❌ FAIL');
  console.log('🗺️ Itinerary Suggestions:', results.itinerarySuggestions ? '✅ PASS' : '❌ FAIL');
  console.log('🏛️ Place Suggestions:', results.placeSuggestions ? '✅ PASS' : '❌ FAIL');
  console.log('⚡ Cache Performance:', results.cachePerformance ? '✅ PASS' : '❌ FAIL');
  console.log('🚨 Error Handling:', results.errorHandling ? '✅ PASS' : '❌ FAIL');
  
  if (results.cachePerformance) {
    console.log('\n⚡ CACHE PERFORMANCE:');
    console.log(`   Speed improvement: ${results.cachePerformance.speedImprovement}%`);
    console.log(`   Cache entries: ${results.cachePerformance.cacheEntries}`);
  }
  
  const passCount = Object.values(results).filter(r => r !== null && r !== false).length;
  const totalTests = 6;
  
  console.log(`\n🎯 OVERALL: ${passCount}/${totalTests} tests passed`);
  
  if (passCount === totalTests) {
    console.log('🎉 ALL TESTS PASSED! AI backend is working perfectly with MongoDB Atlas!');
  } else {
    console.log('⚠️ Some tests failed. Please check the logs above.');
  }
  
  return results;
}

// Run tests
runAllTests().catch(console.error);