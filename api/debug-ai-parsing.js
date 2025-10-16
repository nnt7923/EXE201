// Debug script để kiểm tra AI content và parsing
const axios = require('axios');

// Function parseAiContentToTimeline (copy từ frontend)
function parseAiContentToTimeline(aiContent) {
  if (!aiContent) return [];
  
  try {
    const lines = aiContent.split('\n');
    const days = [];
    let currentDay = null;
    let currentActivity = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // Detect day headers (e.g., "Ngày 1:", "Day 1:", etc.)
      const dayMatch = trimmedLine.match(/^(Ngày|Day)\s*(\d+)[:：]/i);
      if (dayMatch) {
        if (currentDay) {
          days.push(currentDay);
        }
        currentDay = {
          day: trimmedLine,
          activities: []
        };
        continue;
      }
      
      // Detect time patterns (e.g., "08:00 - 09:00", "8:00-9:00", etc.)
      const timeMatch = trimmedLine.match(/^(\d{1,2}):?(\d{0,2})\s*[-–—]\s*(\d{1,2}):?(\d{0,2})/);
      if (timeMatch && currentDay) {
        if (currentActivity) {
          currentDay.activities.push(currentActivity);
        }
        
        const startHour = timeMatch[1].padStart(2, '0');
        const startMin = timeMatch[2] || '00';
        const endHour = timeMatch[3].padStart(2, '0');
        const endMin = timeMatch[4] || '00';
        
        currentActivity = {
          time: trimmedLine,
          startTime: `${startHour}:${startMin}`,
          endTime: `${endHour}:${endMin}`,
          description: '',
          type: 'general'
        };
        continue;
      }
      
      // Add description to current activity
      if (currentActivity && trimmedLine) {
        if (currentActivity.description) {
          currentActivity.description += ' ' + trimmedLine;
        } else {
          currentActivity.description = trimmedLine;
        }
      }
    }
    
    // Add last activity and day
    if (currentActivity && currentDay) {
      currentDay.activities.push(currentActivity);
    }
    if (currentDay) {
      days.push(currentDay);
    }
    
    return days;
  } catch (error) {
    console.error('Error parsing AI content:', error);
    return [];
  }
}

async function debugAiParsing() {
  try {
    console.log('🔍 Debugging AI content parsing...');
    
    // Thử các thông tin đăng nhập khác nhau
    let token;
    const loginAttempts = [
       { email: 'ngoquocan712@gmail.com', password: '123456' },
       { email: 'ngoquocan712@gmail.com', password: 'password123' },
       { email: 'admin@example.com', password: 'admin123' },
       { email: 'test@example.com', password: 'password123' }
     ];
    
    for (const credentials of loginAttempts) {
      try {
        console.log(`🔐 Trying login with: ${credentials.email}`);
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', credentials);
        token = loginResponse.data.data.token;
        console.log(`✅ Login successful with: ${credentials.email}`);
        break;
      } catch (error) {
        console.log(`❌ Login failed with: ${credentials.email}`);
      }
    }
    
    if (!token) {
       console.log('❌ All login attempts failed');
       return;
     }
    
    // Lấy tất cả lịch trình của user hiện tại
     console.log('📋 Fetching all itineraries...');
     
     const allItinerariesResponse = await axios.get('http://localhost:5000/api/itineraries', {
       headers: { Authorization: `Bearer ${token}` }
     });
     
     const allItineraries = allItinerariesResponse.data.data.itineraries;
     console.log(`📊 Found ${allItineraries.length} itineraries`);
     
     // Tìm lịch trình AI
     const aiItinerary = allItineraries.find(it => it.isAiGenerated === true);
     
     if (!aiItinerary) {
       console.log('❌ No AI-generated itinerary found');
       console.log('📋 Available itineraries:');
       allItineraries.forEach((it, index) => {
         console.log(`  ${index + 1}. ${it.title} (ID: ${it._id}, isAiGenerated: ${it.isAiGenerated})`);
       });
       
       console.log('\n🔧 Creating a new AI itinerary for testing...');
       const createResponse = await axios.post('http://localhost:5000/api/itineraries', {
         title: 'Test AI Itinerary - Hòa Lạc 1 ngày',
         destination: 'Hòa Lạc',
         startDate: '2025-01-31',
         endDate: '2025-01-31',
         isAiGenerated: true,
         aiContent: `Ngày 1: Khám phá Hòa Lạc

08:00 - 09:00: Khởi hành từ Hà Nội
Xuất phát từ trung tâm Hà Nội, di chuyển bằng xe máy hoặc ô tô đến Hòa Lạc. Quãng đường khoảng 30km, mất khoảng 1 tiếng.

09:00 - 10:30: Tham quan Khu công nghệ cao Hòa Lạc
Khám phá khu vực công nghệ cao, tìm hiểu về các dự án phát triển và kiến trúc hiện đại.

10:30 - 12:00: Thăm quan Đại học FPT
Tham quan campus đại học với kiến trúc đẹp và môi trường học tập hiện đại.

12:00 - 13:30: Ăn trưa tại nhà hàng địa phương
Thưởng thức các món ăn đặc sản vùng ngoại thành Hà Nội.

13:30 - 15:00: Tham quan làng nghề truyền thống
Khám phá các làng nghề gần đó như làng gốm, làng dệt.

15:00 - 16:30: Thư giãn tại công viên
Nghỉ ngơi và thư giãn tại các khu vực xanh trong khu vực.

16:30 - 18:00: Trở về Hà Nội
Kết thúc chuyến đi và trở về trung tâm thành phố.`
       }, {
         headers: { Authorization: `Bearer ${token}` }
       });
       
       console.log('✅ Created new AI itinerary:', createResponse.data.data.title);
        var itinerary = createResponse.data.data;
      } else {
        console.log(`✅ Found AI itinerary: ${aiItinerary.title} (ID: ${aiItinerary._id})`);
        var itinerary = aiItinerary;
      }
    console.log('\n📊 ITINERARY INFO:');
    console.log('- ID:', itinerary._id);
    console.log('- Title:', itinerary.title);
    console.log('- isAiGenerated:', itinerary.isAiGenerated);
    console.log('- Has aiContent:', !!itinerary.aiContent);
    console.log('- aiContent length:', itinerary.aiContent?.length || 0);
    
    if (itinerary.aiContent) {
      console.log('\n📝 AI CONTENT PREVIEW (first 500 chars):');
      console.log(itinerary.aiContent.substring(0, 500));
      console.log('\n...\n');
      
      console.log('📝 AI CONTENT PREVIEW (last 500 chars):');
      console.log(itinerary.aiContent.substring(itinerary.aiContent.length - 500));
      
      console.log('\n🔧 PARSING RESULT:');
      const timeline = parseAiContentToTimeline(itinerary.aiContent);
      console.log('- Days found:', timeline.length);
      
      timeline.forEach((day, index) => {
        console.log(`\nDay ${index + 1}: ${day.day}`);
        console.log(`- Activities: ${day.activities.length}`);
        day.activities.forEach((activity, actIndex) => {
          console.log(`  ${actIndex + 1}. ${activity.time} - ${activity.description.substring(0, 100)}...`);
        });
      });
      
      if (timeline.length === 0) {
        console.log('\n❌ PARSING FAILED - No timeline generated');
        console.log('🔍 Analyzing content structure...');
        
        const lines = itinerary.aiContent.split('\n');
        console.log(`- Total lines: ${lines.length}`);
        console.log('- First 10 lines:');
        lines.slice(0, 10).forEach((line, index) => {
          console.log(`  ${index + 1}: "${line.trim()}"`);
        });
      }
    } else {
      console.log('❌ No AI content found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugAiParsing();