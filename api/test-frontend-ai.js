const axios = require('axios');

async function testFrontendAI() {
  console.log('🧪 Testing Frontend AI Integration...\n');
  
  const baseURL = 'https://an-gi-o-dau-api-64eh.onrender.com/api';
  
  try {
    // 1. Test login
    console.log('🔐 1. Testing login...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // 2. Test AI suggestion with same format as frontend
    console.log('\n🤖 2. Testing AI suggestion (frontend format)...');
    const aiResponse = await axios.post(`${baseURL}/ai/itinerary-suggestions`, {
      destination: 'Hà Nội',
      duration: 2,
      budget: 'MEDIUM',
      interests: ['Ẩm thực', 'Lịch sử']
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('AI Response Status:', aiResponse.status);
    console.log('AI Response Success:', aiResponse.data.success);
    
    if (aiResponse.data.success) {
      console.log('✅ AI suggestion successful');
      console.log('Response structure:');
      console.log('- data keys:', Object.keys(aiResponse.data.data || {}));
      console.log('- title:', aiResponse.data.data.title);
      console.log('- content length:', aiResponse.data.data.content?.length || 0);
      console.log('- estimated cost:', aiResponse.data.data.estimatedCost);
      console.log('- tips count:', aiResponse.data.data.tips?.length || 0);
    } else {
      console.log('❌ AI suggestion failed:', aiResponse.data.message);
    }
    
    // 3. Test with exact same data structure as frontend sends
    console.log('\n🎯 3. Testing with exact frontend data structure...');
    const frontendData = {
      destination: 'Đà Nẵng',
      duration: 3,
      budget: 'HIGH',
      interests: ['Thiên nhiên', 'Về đêm']
    };
    
    const frontendResponse = await axios.post(`${baseURL}/ai/itinerary-suggestions`, frontendData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (frontendResponse.data.success) {
      console.log('✅ Frontend format test successful');
      console.log('Response data:', {
        title: frontendResponse.data.data.title,
        hasContent: !!frontendResponse.data.data.content,
        contentLength: frontendResponse.data.data.content?.length || 0,
        estimatedCost: frontendResponse.data.data.estimatedCost,
        tipsCount: frontendResponse.data.data.tips?.length || 0
      });
    } else {
      console.log('❌ Frontend format test failed:', frontendResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testFrontendAI();