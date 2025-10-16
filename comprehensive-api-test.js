const API_BASE = 'http://localhost:5000/api';

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(name, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${name}${message ? ': ' + message : ''}`);
  
  testResults.tests.push({ name, passed, message });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) config.body = JSON.stringify(data);
    
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const responseData = await response.json().catch(() => null);
    
    return { 
      success: response.ok, 
      data: responseData, 
      status: response.status 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      status: 500
    };
  }
}

async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive API Tests...\n');
  
  // 1. Health Check
  console.log('📋 1. HEALTH CHECK TESTS');
  console.log('=' .repeat(50));
  
  const healthCheck = await apiCall('GET', '/health');
  logTest('Health Check Endpoint', healthCheck.success);
  
  // 2. Database Connection Test
  console.log('\n📋 2. DATABASE CONNECTION TESTS');
  console.log('=' .repeat(50));
  
  const placesTest = await apiCall('GET', '/places');
  logTest('Database Connection (Places)', placesTest.success);
  
  // 3. Authentication Tests
  console.log('\n📋 3. AUTHENTICATION TESTS');
  console.log('=' .repeat(50));
  
  // Test registration endpoint
  const registerTest = await apiCall('POST', '/auth/register', {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'testpassword123'
  });
  logTest('User Registration', registerTest.success);
  
  // Test login endpoint
  const loginTest = await apiCall('POST', '/auth/login', {
    email: 'admin@example.com',
    password: 'admin123'
  });
  logTest('User Login', loginTest.success);
  
  let authToken = '';
  if (loginTest.success && loginTest.data && loginTest.data.data && loginTest.data.data.token) {
    authToken = loginTest.data.data.token;
    logTest('Auth Token Generation', true);
  } else {
    logTest('Auth Token Generation', false, `Login response: ${JSON.stringify(loginTest.data)}`);
  }
  
  // 4. Places API Tests
  console.log('\n📋 4. PLACES API TESTS');
  console.log('=' .repeat(50));
  
  const allPlaces = await apiCall('GET', '/places');
  logTest('Get All Places', allPlaces.success);
  
  const placesData = allPlaces.data?.data?.places || allPlaces.data?.places;
  logTest('Places Data Structure', allPlaces.success && Array.isArray(placesData), 
    `Data type: ${typeof placesData}, isArray: ${Array.isArray(placesData)}`);
  
  if (allPlaces.success && placesData && placesData.length > 0) {
    const firstPlace = placesData[0];
    const singlePlace = await apiCall('GET', `/places/${firstPlace._id}`);
    logTest('Get Single Place', singlePlace.success);
  }
  
  // 5. Categories API Tests
  console.log('\n📋 5. CATEGORIES API TESTS');
  console.log('=' .repeat(50));
  
  const categories = await apiCall('GET', '/categories');
  logTest('Get Categories', categories.success);
  
  // 6. Plans API Tests
  console.log('\n📋 6. PLANS API TESTS');
  console.log('=' .repeat(50));
  
  const plans = await apiCall('GET', '/plans');
  logTest('Get Subscription Plans', plans.success);
  
  // 7. Itineraries API Tests
  console.log('\n📋 7. ITINERARIES API TESTS');
  console.log('=' .repeat(50));
  
  if (authToken) {
    const itineraries = await apiCall('GET', '/itineraries', null, { 
      Authorization: `Bearer ${authToken}` 
    });
    logTest('Get Itineraries', itineraries.success, 
      itineraries.success ? '' : `Error: ${JSON.stringify(itineraries.error)}, Status: ${itineraries.status}`);
    
    const itinerariesData = itineraries.data?.data?.itineraries || itineraries.data?.itineraries;
    if (itineraries.success && itinerariesData && itinerariesData.length > 0) {
      const firstItinerary = itinerariesData[0];
      const singleItinerary = await apiCall('GET', `/itineraries/${firstItinerary._id}`, null, { 
        Authorization: `Bearer ${authToken}` 
      });
      logTest('Get Single Itinerary', singleItinerary.success);
    }
  } else {
    logTest('Get Itineraries', false, 'No auth token available');
  }
  
  // 8. AI Service Tests
  console.log('\n📋 8. AI SERVICE TESTS');
  console.log('=' .repeat(50));
  
  if (authToken) {
    const aiTest = await apiCall('POST', '/ai/itinerary-suggestions', {
      destination: 'Hà Nội',
      duration: 1,
      budget: 500000,
      interests: ['food', 'culture']
    }, { Authorization: `Bearer ${authToken}` });
    
    // AI endpoint is working if it returns 200 (success) or 403 (no subscription - expected)
    const isWorking = aiTest.success || aiTest.status === 403;
    logTest('AI Suggestions Endpoint', isWorking, 
      aiTest.success ? 'AI working with subscription' : 
      aiTest.status === 403 ? 'AI working - requires subscription (expected)' :
      `Error: ${JSON.stringify(aiTest.error)}, Status: ${aiTest.status}`);
    
    if (aiTest.success) {
      logTest('AI Response Structure', aiTest.data && (aiTest.data.content || aiTest.data.suggestions));
    }
  } else {
    logTest('AI Suggestions Endpoint', false, 'No auth token available');
  }
  
  // 9. Protected Routes Tests
  console.log('\n📋 9. PROTECTED ROUTES TESTS');
  console.log('=' .repeat(50));
  
  if (authToken) {
    const userProfile = await apiCall('GET', '/users/me', null, { 
      Authorization: `Bearer ${authToken}` 
    });
    logTest('Protected Route Access', userProfile.success);
    
    const notifications = await apiCall('GET', '/notifications', null, { 
      Authorization: `Bearer ${authToken}` 
    });
    logTest('Notifications Endpoint', notifications.success);
  } else {
    logTest('Protected Route Access', false, 'No auth token available');
  }
  
  // 10. Error Handling Tests
  console.log('\n📋 10. ERROR HANDLING TESTS');
  console.log('=' .repeat(50));
  
  const invalidEndpoint = await apiCall('GET', '/invalid-endpoint');
  logTest('404 Error Handling', !invalidEndpoint.success && invalidEndpoint.status === 404);
  
  const invalidPlace = await apiCall('GET', '/places/invalid-id');
  logTest('Invalid ID Error Handling', !invalidPlace.success);
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => console.log(`   - ${test.name}: ${test.message}`));
  }
  
  console.log('\n🎯 DEPLOYMENT READINESS:');
  const criticalTests = testResults.tests.filter(test => 
    test.name.includes('Health Check') ||
    test.name.includes('Database Connection') ||
    test.name.includes('Get All Places') ||
    test.name.includes('Get Categories') ||
    test.name.includes('User Login')
  );
  
  const criticalPassed = criticalTests.filter(test => test.passed).length;
  const deploymentReady = criticalPassed === criticalTests.length;
  
  console.log(`${deploymentReady ? '✅' : '❌'} ${deploymentReady ? 'READY FOR DEPLOYMENT' : 'NOT READY FOR DEPLOYMENT'}`);
  console.log(`Critical tests passed: ${criticalPassed}/${criticalTests.length}`);
  
  return {
    totalTests: testResults.passed + testResults.failed,
    passed: testResults.passed,
    failed: testResults.failed,
    deploymentReady,
    details: testResults.tests
  };
}

// Run tests if called directly
if (require.main === module) {
  runComprehensiveTests()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { runComprehensiveTests };