const axios = require('axios');

const testAiAccess = async () => {
  try {
    console.log('🔐 Logging in...');
    
    // Login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Test AI access check
    console.log('🤖 Testing AI access check...');
    const accessResponse = await axios.get('http://localhost:5000/api/ai/check-access', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ AI Access Response:', JSON.stringify(accessResponse.data, null, 2));

  } catch (error) {
    if (error.response) {
      console.log('❌ Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
};

testAiAccess();