const axios = require('axios');

async function debugAIResponse() {
    console.log('🔍 === DEBUG AI RESPONSE ===\n');
    
    const productionAPI = 'https://an-gi-o-dau-api-64eh.onrender.com/api';
    
    try {
        // 1. Login
        const loginResponse = await axios.post(`${productionAPI}/auth/login`, {
            email: 'phat@gmail.com',
            password: '1234567'
        });
        
        if (loginResponse.data.success && loginResponse.data.data.token) {
            const token = loginResponse.data.data.token;
            console.log('✅ Login successful');
            
            // 2. Test AI
            console.log('\n🤖 Testing AI Itinerary Suggestions...');
            const aiResponse = await axios.post(`${productionAPI}/ai/itinerary-suggestions`, {
                destination: 'Đà Nẵng',
                duration: 3,
                budget: 5000000,
                interests: ['ẩm thực', 'tham quan']
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('✅ AI Response received!');
            console.log('📊 Status:', aiResponse.status);
            console.log('📋 Full AI response:', JSON.stringify(aiResponse.data, null, 2));
            
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

debugAIResponse();