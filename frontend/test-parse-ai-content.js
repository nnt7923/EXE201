// Test script để kiểm tra function parseAiContentToTimeline

// Real AI content từ backend logs
const realAiContent = `
**Ngày 1:**
- 06:00 - 07:00: Khởi hành từ Hòa Lạc đi Hà Nội (ước tính 1 giờ di chuyển bằng ô tô)
- 07:00 - 08:30: Ăn sáng Phở Bò tại Phở Thìn (13 Lò Đúc, Hai Bà Trưng) - Một trong những quán phở nổi tiếng nhất Hà Nội với nước dùng đậm đà.
- 08:30 - 10:00: Khám phá Phố Cổ Hà Nội (Hàng Bạc, Hàng Gai, Hàng Đào) - Dạo bộ và cảm nhận nhịp sống của khu phố cổ kính.
- 10:00 - 11:30: Thưởng thức Bánh Mì Pâté tại Bánh Mì 25 (25 Hàng Cá, Hoàn Kiếm) - Bánh mì pâté truyền thống với nhân đầy đặn và giòn tan.
- 11:30 - 13:00: Ăn trưa Bún Đậu Mắm Tôm tại Bún Đậu Mắm Tôm Ngõ Gạch (Ngõ Gạch, Hoàn Kiếm) - Trải nghiệm món bún đậu mắm tôm chuẩn vị, đầy đủ nem, chả cốm, dồi sụn.
- 13:30 - 14:30: Thưởng thức Cà Phê Trứng tại Café Giảng (39 Nguyễn Hữu Huân, Hoàn Kiếm) - Một trong những quán cà phê trứng lâu đời và nổi tiếng nhất Hà Nội.
- 14:30 - 15:30: Dạo quanh Hồ Hoàn Kiếm và Cầu Thê Húc - Tận hưởng không khí trong lành và vẻ đẹp biểu tượng của thủ đô.
- 15:30 - 16:30: Trải nghiệm ẩm thực đường phố khác (Chè bốn mùa Hàng Cân, Kem Tràng Tiền) - Tiếp tục hành trình khám phá các món ăn vặt đặc trưng của Hà Nội.
- 16:30 - 18:00: Mua sắm quà lưu niệm ẩm thực tại Hàng Đường (Ô Mai Hồng Lam, Bánh Cốm Nguyên Ninh) - Chọn mua những món quà mang hương vị Hà Nội cho người thân.
- 18:00 - 19:30: Ăn tối Lẩu Bò Nhúng Dấm tại Quán Gầm Cầu (Cầu Gỗ, Hoàn Kiếm) - Một bữa tối ấm cúng và đầy đủ hương vị truyền thống.
- 19:30 - 21:00: Di chuyển về lại Hòa Lạc (ước tính 1.5 giờ di chuyển bằng ô tô)
- 21:00: Kết thúc hành trình tại Hòa Lạc
`;

// Mock AI content từ backend
const mockAiContent = `
**Ngày 1:**
- 08:00 - 10:00: Tham quan trung tâm thành phố
- 10:30 - 12:00: Khám phá các điểm du lịch nổi tiếng  
- 12:00 - 13:30: Ăn trưa tại nhà hàng địa phương
- 14:00 - 16:00: Tham quan bảo tàng lịch sử
- 16:30 - 18:00: Dạo phố cổ và mua sắm
- 18:30 - 20:00: Ăn tối và thưởng thức ẩm thực địa phương
- 20:30 - 22:00: Nghỉ ngơi tại khách sạn
`;

// Copy function parseAiContentToTimeline từ frontend
const parseAiContentToTimeline = (content) => {
  if (!content) return [];
  const lines = content.split('\n').filter(line => line.trim());
  const timeline = [];
  let currentDay = 'Ngày 1'; // Default day for single-day itineraries
  let currentDayActivities = [];
  let currentActivity = {};
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Detect day headers (Ngày 1, Ngày 2, etc.)
    if (trimmedLine.match(/^(\*\*)?Ngày \d+/i)) {
      // Save previous day if exists
      if (currentDay && currentDayActivities.length > 0) {
        timeline.push({
          day: currentDay,
          activities: [...currentDayActivities]
        });
      }
      
      currentDay = trimmedLine.replace(/\*\*/g, '').replace(':', '').trim();
      currentDayActivities = [];
      continue;
    }
    
    // Detect time-based activities (- 08:00 - 10:00: Description)
    const timeActivityMatch = trimmedLine.match(/^-\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2}):\s*(.+)/);
    if (timeActivityMatch) {
      const [, startTime, endTime, description] = timeActivityMatch;
      currentDayActivities.push({
        time: `${startTime} - ${endTime}`,
        startTime: startTime,
        endTime: endTime,
        description: description.trim(),
        type: 'general'
      });
      continue;
    }
    
    // Detect markdown headers with time periods (# Sáng (7:30 - 9:00 AM), # Chiều, etc.)
    if (trimmedLine.match(/^#+\s*(Sáng|Chiều|Tối|Trưa|Giữa sáng|Tối muộn)/i)) {
      // Save previous activity if exists
      if (currentActivity.time && currentActivity.description) {
        currentDayActivities.push({
          time: currentActivity.time,
          startTime: currentActivity.startTime || '09:00',
          endTime: currentActivity.endTime || '11:00',
          description: currentActivity.description,
          type: currentActivity.type || 'general'
        });
      }
      
      // Extract time period and time range if available
      const timeMatch = trimmedLine.match(/^#+\s*(Sáng|Chiều|Tối|Trưa|Giữa sáng|Tối muộn)(?:\s*\(([^)]+)\))?/i);
      if (timeMatch) {
        const timePeriod = timeMatch[1];
        const timeRange = timeMatch[2];
        
        currentActivity = {
          time: timePeriod,
          startTime: timeRange ? timeRange.split('-')[0]?.trim() : getTimeFromPeriod(timePeriod),
          endTime: timeRange ? timeRange.split('-')[1]?.trim() : getEndTimeFromPeriod(timePeriod),
          type: 'general'
        };
      }
      continue;
    }
    
    // Collect description lines for current activity
    if (trimmedLine && !trimmedLine.startsWith('#') && !trimmedLine.startsWith('**')) {
      if (currentActivity.time) {
        currentActivity.description = (currentActivity.description || '') + ' ' + trimmedLine.replace(/^-\s*/, '').trim();
      }
    }
  }
  
  // Save last activity if exists
  if (currentActivity.time && currentActivity.description) {
    currentDayActivities.push({
      time: currentActivity.time,
      startTime: currentActivity.startTime || '09:00',
      endTime: currentActivity.endTime || '11:00',
      description: currentActivity.description,
      type: currentActivity.type || 'general'
    });
  }
  
  // Save last day if exists
  if (currentDay && currentDayActivities.length > 0) {
    timeline.push({
      day: currentDay,
      activities: [...currentDayActivities]
    });
  }
  
  return timeline;
};

// Helper functions
const getTimeFromPeriod = (period) => {
  const periodMap = {
    'Sáng': '08:00',
    'Buổi sáng': '08:00',
    'Trưa': '12:00',
    'Chiều': '14:00',
    'Buổi chiều': '14:00',
    'Tối': '18:00',
    'Buổi tối': '18:00',
    'Giữa sáng': '10:00',
    'Tối muộn': '21:00'
  };
  return periodMap[period] || '09:00';
};

const getEndTimeFromPeriod = (period) => {
  const periodMap = {
    'Sáng': '11:00',
    'Buổi sáng': '11:00',
    'Trưa': '13:00',
    'Chiều': '17:00',
    'Buổi chiều': '17:00',
    'Tối': '21:00',
    'Buổi tối': '21:00',
    'Giữa sáng': '12:00',
    'Tối muộn': '23:00'
  };
  return periodMap[period] || '11:00';
};

// Test the function with real AI content
console.log('🧪 Testing parseAiContentToTimeline function with REAL AI content...');
console.log('📝 Input AI Content (Real):');
console.log(realAiContent);
console.log('\n📅 Parsed Timeline (Real):');
const realTimeline = parseAiContentToTimeline(realAiContent);
console.log(JSON.stringify(realTimeline, null, 2));

console.log('\n📊 Summary (Real):');
console.log('- Days found:', realTimeline.length);
realTimeline.forEach((day, index) => {
  console.log(`- ${day.day}: ${day.activities.length} activities`);
  day.activities.forEach((activity, actIndex) => {
    console.log(`  ${actIndex + 1}. ${activity.time}: ${activity.description}`);
  });
});

console.log('\n\n🧪 Testing parseAiContentToTimeline function with MOCK content...');
console.log('📝 Input AI Content (Mock):');
console.log(mockAiContent);
console.log('\n📅 Parsed Timeline (Mock):');
const mockTimeline = parseAiContentToTimeline(mockAiContent);
console.log(JSON.stringify(mockTimeline, null, 2));

console.log('\n📊 Summary (Mock):');
console.log('- Days found:', mockTimeline.length);
mockTimeline.forEach((day, index) => {
  console.log(`- ${day.day}: ${day.activities.length} activities`);
  day.activities.forEach((activity, actIndex) => {
    console.log(`  ${actIndex + 1}. ${activity.time}: ${activity.description}`);
  });
});