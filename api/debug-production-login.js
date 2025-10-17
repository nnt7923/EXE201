const axios = require('axios');

async function debugLogin() {
    console.log('🔍 === DEBUG PRODUCTION LOGIN ===\n');
    
    const productionAPI = 'https://an-gi-o-dau-api-64eh.onrender.com/api';
    
    try {
        console.log('📡 Testing login endpoint...');
        console.log(`🌐 URL: ${productionAPI}/auth/login`);
        console.log('📧 Email: phat@gmail.com');
        console.log('🔑 Password: 1234567\n');
        
        const response = await axios.post(`${productionAPI}/auth/login`, {
            email: 'phat@gmail.com',
            password: '1234567'
        });
        
        console.log('✅ Response received!');
        console.log('📊 Status:', response.status);
        console.log('📋 Full response data:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ Login error occurred:');
        
        if (error.response) {
            console.log('📊 Status:', error.response.status);
            console.log('📋 Response data:', JSON.stringify(error.response.data, null, 2));
            console.log('📝 Headers:', error.response.headers);
        } else if (error.request) {
            console.log('📡 No response received');
            console.log('🔍 Request details:', error.request);
        } else {
            console.log('⚠️ Error message:', error.message);
        }
    }
}

debugLogin();