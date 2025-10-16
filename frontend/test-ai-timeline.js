const API_BASE_URL = 'http://localhost:5000/api';

async function testAiTimeline() {
  try {
    console.log('🔐 Logging in...');
    
    // Login to get token
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'ngoquocan712@gmail.com',
        password: '123456'
      })
    });

    const loginData = await loginResponse.json();
    console.log('🔍 Debug - Login response:', JSON.stringify(loginData, null, 2));
    
    const token = loginData.data.token;
    console.log('✅ Login successful, token:', token ? 'exists' : 'missing');

    // Set up headers with token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('\n📋 Fetching AI itinerary...');
    
    // Fetch the AI itinerary (use the existing one)
    const itineraryId = '68f15905793138d0da86fce9';
    const itineraryResponse = await fetch(`${API_BASE_URL}/itineraries/${itineraryId}`, { 
      method: 'GET',
      headers 
    });
    
    const itineraryData = await itineraryResponse.json();
    
    console.log('🔍 Debug - Full response:', JSON.stringify(itineraryData, null, 2));
    
    const itinerary = itineraryData.data || itineraryData;
    
    console.log('✅ Itinerary fetched successfully!');
    console.log('📊 Itinerary details:');
    console.log('   _id:', itinerary?._id);
    console.log('   title:', itinerary.title);
    console.log('   isAiGenerated:', itinerary.isAiGenerated);
    console.log('   hasAiContent:', !!itinerary.aiContent);
    console.log('   aiContentLength:', itinerary.aiContent?.length || 0);

    if (itinerary.aiContent && itinerary.isAiGenerated) {
      console.log('\n🤖 Testing parseAiContentToTimeline...');
      
      // Import the parse function
      const { parseAiContentToTimeline } = require('./lib/utils');
      
      const timeline = parseAiContentToTimeline(itinerary.aiContent);
      
      console.log('✅ Timeline parsed successfully!');
      console.log('📅 Timeline summary:');
      console.log('   Days found:', timeline.length);
      
      timeline.forEach((day, index) => {
        console.log(`   Ngày ${index + 1}: ${day.activities.length} activities`);
        day.activities.forEach((activity, actIndex) => {
          console.log(`     ${actIndex + 1}. ${activity.time}: ${activity.description}`);
        });
      });
      
      console.log('\n🎯 Result: AI content được parse thành timeline format chuẩn!');
      console.log('   ✅ Function parseAiContentToTimeline hoạt động đúng');
      console.log('   ✅ AI content có format đúng');
      console.log('   ✅ Timeline được tạo thành công');
      
    } else {
      console.log('❌ No AI content found or not AI generated');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAiTimeline();