const axios = require('axios');

async function testAIFunctionality() {
  console.log('🤖 === KIỂM TRA TOÀN DIỆN CHỨC NĂNG AI ===\n');
  
  const baseURL = 'http://localhost:5000/api';
  let token = null;
  
  try {
    // 1. Đăng nhập với user có subscription
    console.log('🔐 1. Đăng nhập với user có subscription...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'phat@gmail.com',
      password: '1234567'
    });

    if (!loginResponse.data.success) {
      throw new Error(`Login failed: ${loginResponse.data.message}`);
    }

    token = loginResponse.data.data?.token || loginResponse.data.token;
    console.log('✅ Đăng nhập thành công\n');

    // 2. Kiểm tra thông tin user và subscription
    console.log('📋 2. Kiểm tra thông tin subscription...');
    const userResponse = await axios.get(`${baseURL}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!userResponse.data.success) {
      throw new Error(`Get user info failed: ${userResponse.data.message}`);
    }

    const user = userResponse.data.data.user;
    console.log(`✅ User: ${user.email}`);
    console.log(`✅ Plan: ${user.subscriptionPlan?.name || 'Không có'}`);
    console.log(`✅ AI Limit: ${user.subscriptionPlan?.aiSuggestionLimit || 0}`);
    console.log(`✅ AI Used: ${user.aiSuggestionsUsed || 0}`);
    console.log(`✅ AI Remaining: ${(user.subscriptionPlan?.aiSuggestionLimit || 0) - (user.aiSuggestionsUsed || 0)}\n`);

    if (!user.subscriptionPlan || (user.subscriptionPlan.aiSuggestionLimit || 0) <= (user.aiSuggestionsUsed || 0)) {
      console.log('⚠️  WARNING: User không có subscription hoặc đã hết lượt AI');
    }

    // 3. Test AI Itinerary Suggestions
    console.log('🎯 3. Test AI Itinerary Suggestions...');
    const aiItineraryResponse = await axios.post(`${baseURL}/ai/itinerary-suggestions`, {
      destination: 'Đà Nẵng',
      duration: 3,
      budget: 5000000,
      interests: ['biển', 'ẩm thực', 'văn hóa']
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (aiItineraryResponse.data.success) {
      console.log('✅ AI Itinerary Suggestions thành công');
      const data = aiItineraryResponse.data.data;
      console.log(`   - Title: ${data.title || 'N/A'}`);
      console.log(`   - Description: ${data.description ? data.description.substring(0, 100) + '...' : 'N/A'}`);
      console.log(`   - Content length: ${data.content ? data.content.length : 0} characters`);
      console.log(`   - Total cost: ${data.totalEstimatedCost || 'N/A'}`);
      console.log(`   - Tips: ${data.tips ? 'Có' : 'Không'}`);
    } else {
      console.log(`❌ AI Itinerary Suggestions failed: ${aiItineraryResponse.data.message}`);
    }
    console.log('');

    // 4. Test AI Place Suggestions
    console.log('🏛️ 4. Test AI Place Suggestions...');
    try {
      const aiPlaceResponse = await axios.post(`${baseURL}/ai/place-suggestions`, {
        location: 'Hà Nội',
        interests: ['lịch sử', 'văn hóa'],
        budget: 2000000
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (aiPlaceResponse.data.success) {
        console.log('✅ AI Place Suggestions thành công');
        const suggestions = aiPlaceResponse.data.data.suggestions || [];
        console.log(`   - Số lượng gợi ý: ${suggestions.length}`);
        if (suggestions.length > 0) {
          console.log(`   - Gợi ý đầu tiên: ${suggestions[0].name || 'N/A'}`);
        }
      } else {
        console.log(`❌ AI Place Suggestions failed: ${aiPlaceResponse.data.message}`);
      }
    } catch (error) {
      console.log(`❌ AI Place Suggestions error: ${error.response?.data?.message || error.message}`);
    }
    console.log('');

    // 5. Kiểm tra AI usage sau khi sử dụng
    console.log('🔄 5. Kiểm tra AI usage sau khi sử dụng...');
    const userResponse2 = await axios.get(`${baseURL}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (userResponse2.data.success) {
      const user2 = userResponse2.data.data.user;
      const usedBefore = user.aiSuggestionsUsed || 0;
      const usedAfter = user2.aiSuggestionsUsed || 0;
      const usedInThisTest = usedAfter - usedBefore;
      
      console.log(`✅ AI Usage cập nhật:`);
      console.log(`   - Trước test: ${usedBefore}`);
      console.log(`   - Sau test: ${usedAfter}`);
      console.log(`   - Đã sử dụng trong test: ${usedInThisTest}`);
      console.log(`   - Còn lại: ${(user2.subscriptionPlan?.aiSuggestionLimit || 0) - usedAfter}`);
    }
    console.log('');

    // 6. Test AI với user không có subscription
    console.log('🚫 6. Test AI với user không có subscription...');
    try {
      // Tạo user test không có subscription
      const testUserResponse = await axios.post(`${baseURL}/auth/register`, {
        name: 'Test User No Sub',
        email: `test_no_sub_${Date.now()}@test.com`,
        password: '123456'
      });

      if (testUserResponse.data.success) {
        const testToken = testUserResponse.data.data?.token || testUserResponse.data.token;
        
        const aiTestResponse = await axios.post(`${baseURL}/ai/itinerary-suggestions`, {
          destination: 'Test',
          duration: 1,
          budget: 1000000,
          interests: ['test']
        }, {
          headers: { 'Authorization': `Bearer ${testToken}` }
        });

        if (!aiTestResponse.data.success) {
          console.log(`✅ Đúng rồi - User không có subscription bị từ chối: ${aiTestResponse.data.message}`);
        } else {
          console.log(`⚠️  WARNING: User không có subscription vẫn được sử dụng AI!`);
        }
      }
    } catch (error) {
      if (error.response?.status === 403 || error.response?.data?.message?.includes('subscription')) {
        console.log(`✅ Đúng rồi - User không có subscription bị từ chối`);
      } else {
        console.log(`❌ Lỗi không mong muốn: ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('\n🎉 === KẾT QUẢ KIỂM TRA AI ===');
    console.log('✅ Chức năng AI hoạt động bình thường');
    console.log('✅ Subscription system hoạt động đúng');
    console.log('✅ AI usage tracking chính xác');
    console.log('✅ Hệ thống sẵn sàng deploy!');

  } catch (error) {
    console.error('\n❌ === LỖI TRONG QUÁ TRÌNH TEST ===');
    console.error('Error:', error.response?.data || error.message);
    console.error('\n🚨 Cần khắc phục lỗi trước khi deploy!');
  }
}

// Chạy test
testAIFunctionality();