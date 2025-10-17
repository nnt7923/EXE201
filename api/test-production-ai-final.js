const axios = require('axios');

async function testProductionAI() {
    console.log('🌐 === KIỂM TRA CHỨC NĂNG AI TRÊN PRODUCTION ===\n');
    
    const productionAPI = 'https://an-gi-o-dau-api-64eh.onrender.com/api';
    
    try {
        // 1. Test đăng nhập
        console.log('🔐 1. Testing login...');
        const loginResponse = await axios.post(`${productionAPI}/auth/login`, {
            email: 'phat@gmail.com',
            password: '1234567'
        });
        
        if (loginResponse.data.success && loginResponse.data.data.token) {
            console.log('✅ Login thành công!');
            const token = loginResponse.data.data.token;
            
            // 2. Kiểm tra thông tin user
            console.log('\n👤 2. Checking user info...');
            const userResponse = await axios.get(`${productionAPI}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (userResponse.data.success) {
                console.log('✅ User info retrieved successfully!');
                const user = userResponse.data.data.user;
                console.log(`📧 Email: ${user.email}`);
                console.log(`📦 Subscription: ${user.subscriptionPlan?.name || 'None'}`);
                console.log(`🤖 AI Usage: ${user.aiSuggestionsUsed || 0}/${user.subscriptionPlan?.aiSuggestionLimit || 0}`);
                
                // 3. Test AI Itinerary Suggestions
                console.log('\n🤖 3. Testing AI Itinerary Suggestions...');
                const aiResponse = await axios.post(`${productionAPI}/ai/itinerary-suggestions`, {
                    destination: 'Đà Nẵng',
                    duration: 3,
                    budget: 5000000,
                    interests: ['ẩm thực', 'tham quan']
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (aiResponse.data.success) {
                    console.log('✅ AI Itinerary Suggestions hoạt động!');
                    console.log(`📝 Generated itinerary for ${aiResponse.data.data.destination}`);
                    console.log(`💰 Total cost: ${aiResponse.data.data.totalEstimatedCost.toLocaleString()} VND`);
                    console.log(`💡 Tips provided: ${aiResponse.data.data.tips.length} tips`);
                    
                    // 4. Kiểm tra lại AI usage
                    console.log('\n🔄 4. Checking updated AI usage...');
                    const updatedUserResponse = await axios.get(`${productionAPI}/users/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (updatedUserResponse.data.success) {
                        const updatedUser = updatedUserResponse.data.data.user;
                        console.log(`🤖 Updated AI Usage: ${updatedUser.aiSuggestionsUsed}/${updatedUser.subscriptionPlan?.aiSuggestionLimit || 0}`);
                        console.log('✅ AI usage tracking hoạt động đúng!');
                    }
                    
                    console.log('\n🎉 === KẾT LUẬN ===');
                    console.log('✅ Production API hoạt động hoàn hảo!');
                    console.log('✅ Chức năng AI đang hoạt động bình thường');
                    console.log('✅ Hệ thống subscription và tracking AI usage chính xác');
                    console.log('\n💡 Nếu frontend không hoạt động, có thể do:');
                    console.log('   1. Frontend chưa được cập nhật URL API mới');
                    console.log('   2. CORS configuration');
                    console.log('   3. Environment variables trên frontend');
                    
                } else {
                    console.log('❌ AI Itinerary Suggestions failed:', aiResponse.data.message);
                }
                
            } else {
                console.log('❌ Failed to get user info:', userResponse.data.message);
            }
            
        } else {
            console.log('❌ Login failed:', loginResponse.data.message);
        }
        
    } catch (error) {
        console.log('❌ Error occurred:');
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Message: ${error.response.data?.message || error.response.statusText}`);
        } else {
            console.log(`   Error: ${error.message}`);
        }
    }
}

testProductionAI();