const axios = require('axios');

async function debugUsersMe() {
    console.log('🔍 === DEBUG /users/me ENDPOINT ===\n');
    
    const productionAPI = 'https://an-gi-o-dau-api-64eh.onrender.com/api';
    
    try {
        // 1. Login first
        console.log('🔐 1. Login...');
        const loginResponse = await axios.post(`${productionAPI}/auth/login`, {
            email: 'phat@gmail.com',
            password: '1234567'
        });
        
        if (loginResponse.data.success && loginResponse.data.data.token) {
            const token = loginResponse.data.data.token;
            console.log('✅ Login successful, token received');
            
            // 2. Test /users/me
            console.log('\n👤 2. Testing /users/me...');
            const userResponse = await axios.get(`${productionAPI}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('✅ /users/me response received!');
            console.log('📊 Status:', userResponse.status);
            console.log('📋 Full response data:', JSON.stringify(userResponse.data, null, 2));
            
        } else {
            console.log('❌ Login failed');
        }
        
    } catch (error) {
        console.log('❌ Error occurred:');
        
        if (error.response) {
            console.log('📊 Status:', error.response.status);
            console.log('📋 Response data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('⚠️ Error message:', error.message);
        }
    }
}

debugUsersMe();