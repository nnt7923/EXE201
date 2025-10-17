const axios = require('axios');

async function checkProductionStatus() {
    console.log('🔍 Kiểm tra trạng thái Production API...\n');
    
    const productionAPI = 'https://an-gi-o-dau-api-64eh.onrender.com';
    
    try {
        console.log('📡 Đang ping production API...');
        const response = await axios.get(`${productionAPI}/api/health`, {
            timeout: 30000 // 30 seconds timeout
        });
        
        console.log('✅ Production API đang hoạt động!');
        console.log('📊 Response status:', response.status);
        console.log('📋 Response data:', response.data);
        
        // Test login endpoint
        console.log('\n🔐 Testing login endpoint...');
        const loginResponse = await axios.post(`${productionAPI}/api/auth/login`, {
            email: 'phat@gmail.com',
            password: '1234567'
        });
        
        console.log('✅ Login thành công!');
        console.log('🎫 Token received:', loginResponse.data.token ? 'Yes' : 'No');
        
    } catch (error) {
        console.log('❌ Production API gặp lỗi:');
        console.log('🔍 Error details:');
        
        if (error.response) {
            console.log('   - Status:', error.response.status);
            console.log('   - Status Text:', error.response.statusText);
            console.log('   - Data:', error.response.data);
        } else if (error.request) {
            console.log('   - No response received');
            console.log('   - Request timeout or network error');
        } else {
            console.log('   - Error:', error.message);
        }
        
        console.log('\n💡 Có thể nguyên nhân:');
        console.log('   1. Service đang sleep (free tier)');
        console.log('   2. Deployment đang có vấn đề');
        console.log('   3. Environment variables chưa được cấu hình đúng');
        console.log('   4. Database connection issues');
        
        console.log('\n🔧 Giải pháp:');
        console.log('   1. Đợi vài phút để service wake up');
        console.log('   2. Kiểm tra Render dashboard');
        console.log('   3. Redeploy service nếu cần');
    }
}

checkProductionStatus();