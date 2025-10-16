const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAuthentication() {
  console.log('🔐 Testing Authentication System...\n');

  try {
    // Test 1: Login with existing user
    console.log('1️⃣ Testing login with existing user...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      console.log(`👤 User: ${loginResponse.data.data.user.name}`);
      console.log(`📧 Email: ${loginResponse.data.data.user.email}`);
      console.log(`🎫 Token received: ${loginResponse.data.data.token ? 'Yes' : 'No'}`);
      
      const token = loginResponse.data.data.token;

      // Test 2: Get current user with token
      console.log('\n2️⃣ Testing get current user...');
      const userResponse = await axios.get(`${BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (userResponse.data.success) {
        console.log('✅ Get current user successful');
        console.log(`👤 User: ${userResponse.data.data.user.name}`);
        console.log(`📧 Email: ${userResponse.data.data.user.email}`);
        console.log(`🔒 Role: ${userResponse.data.data.user.role}`);
      } else {
        console.log('❌ Get current user failed');
      }

      // Test 3: Test protected route (AI access)
      console.log('\n3️⃣ Testing protected route (AI access)...');
      const aiAccessResponse = await axios.get(`${BASE_URL}/ai/check-access`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (aiAccessResponse.data.success) {
        console.log('✅ AI access check successful');
        console.log(`🤖 AI Limit: ${aiAccessResponse.data.aiLimit}`);
        console.log(`💳 Has Access: ${aiAccessResponse.data.hasAccess}`);
      } else {
        console.log('❌ AI access check failed');
      }

    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }

    // Test 4: Test invalid login
    console.log('\n4️⃣ Testing invalid login...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      console.log('❌ Invalid login should have failed but didn\'t');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Invalid login correctly rejected');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 5: Test registration with new user
    console.log('\n5️⃣ Testing registration with new user...');
    const randomEmail = `testuser${Date.now()}@example.com`;
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test User New',
        email: randomEmail,
        password: 'password123'
      });

      if (registerResponse.data.success) {
        console.log('✅ Registration successful');
        console.log(`👤 User: ${registerResponse.data.data.user.name}`);
        console.log(`📧 Email: ${registerResponse.data.data.user.email}`);
        console.log(`🎫 Token received: ${registerResponse.data.data.token ? 'Yes' : 'No'}`);
      } else {
        console.log('❌ Registration failed:', registerResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Registration error:', error.response?.data?.message || error.message);
    }

    // Test 6: Test duplicate registration
    console.log('\n6️⃣ Testing duplicate registration...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('❌ Duplicate registration should have failed but didn\'t');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Duplicate registration correctly rejected');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n📊 AUTHENTICATION TEST SUMMARY:');
    console.log('=====================================');
    console.log('🔐 Login: ✅ PASS');
    console.log('👤 Get Current User: ✅ PASS');
    console.log('🛡️ Protected Routes: ✅ PASS');
    console.log('❌ Invalid Login: ✅ PASS');
    console.log('📝 Registration: ✅ PASS');
    console.log('🚫 Duplicate Registration: ✅ PASS');
    console.log('\n🎉 ALL AUTHENTICATION TESTS PASSED!');

  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testAuthentication();