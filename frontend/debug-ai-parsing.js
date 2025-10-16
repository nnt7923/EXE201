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
    
    // Đăng nhập để lấy token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'ngoquocan712@gmail.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, token received');
    
    // Lấy lịch trình AI
    const itineraryId = '68f15b46b8521bfa081a32ed';
    console.log(`📋 Fetching itinerary: ${itineraryId}`);
    
    const itineraryResponse = await axios.get(`http://localhost:5000/api/itineraries/${itineraryId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const itinerary = itineraryResponse.data;
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