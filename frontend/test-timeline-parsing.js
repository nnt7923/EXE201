// Test script để kiểm tra JSON parsing trong browser
// Chạy script này trong browser console để test

// Test data giống như AI response
const testJsonContent = `{
  "content": "# Lịch trình Hòa Lạc - 1 ngày\\n\\n## Ngày 1: Thứ Sáu, 31 tháng 10, 2025\\n\\n### Sáng:\\n- **8:00 - 9:00**: Khởi hành từ Hà Nội đến Hòa Lạc\\n- **9:00 - 10:30**: Tham quan Khu công nghệ cao Hòa Lạc\\n\\n### Trưa:\\n- **11:00 - 12:00**: Thăm quan Đại học FPT\\n- **12:00 - 13:30**: Ăn trưa tại nhà hàng địa phương\\n\\n### Chiều:\\n- **14:00 - 16:00**: Khám phá khu vực xung quanh\\n- **16:00 - 17:00**: Quay về Hà Nội"
}`;

const testPlainContent = `# Lịch trình Hòa Lạc - 1 ngày

## Ngày 1: Thứ Sáu, 31 tháng 10, 2025

### Sáng:
- **8:00 - 9:00**: Khởi hành từ Hà Nội đến Hòa Lạc
- **9:00 - 10:30**: Tham quan Khu công nghệ cao Hòa Lạc

### Trưa:
- **11:00 - 12:00**: Thăm quan Đại học FPT
- **12:00 - 13:30**: Ăn trưa tại nhà hàng địa phương

### Chiều:
- **14:00 - 16:00**: Khám phá khu vực xung quanh
- **16:00 - 17:00**: Quay về Hà Nội`;

// Function để test parsing (copy từ code)
function testParseAiContentToTimeline(content) {
  console.log('🧪 Testing parseAiContentToTimeline with content:', content.substring(0, 100) + '...');
  
  // Try to parse as JSON first (new format)
  try {
    const jsonData = JSON.parse(content);
    if (jsonData.content) {
      console.log('✅ Successfully parsed as JSON, using content field');
      content = jsonData.content;
    }
  } catch (error) {
    console.log('ℹ️ AI content is not JSON, parsing as plain text');
  }
  
  const timeline = [];
  const lines = content.split('\n');
  let currentDay = null;
  let currentTime = '08:00';
  
  console.log('📝 Processing lines:', lines.length);
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    console.log(`Line ${index}: "${trimmedLine}"`);
    
    // Check for day headers
    if (trimmedLine.match(/^#+\s*Ngày \d+/i) || trimmedLine.match(/^Ngày \d+/i)) {
      if (currentDay) {
        timeline.push(currentDay);
      }
      currentDay = {
        day: trimmedLine.replace(/^#+\s*/, ''),
        activities: []
      };
      console.log('📅 Found day:', currentDay.day);
    }
    // Check for time-based activities
    else if (trimmedLine.match(/^\*?\*?\s*\d{1,2}:\d{2}/)) {
      const timeMatch = trimmedLine.match(/(\d{1,2}:\d{2})\s*-?\s*(\d{1,2}:\d{2})?[:\-\s]*(.+)/);
      if (timeMatch && currentDay) {
        const activity = {
          time: timeMatch[1],
          startTime: timeMatch[1],
          endTime: timeMatch[2] || '',
          description: timeMatch[3].replace(/^\*+\s*/, '').trim(),
          type: 'sightseeing'
        };
        currentDay.activities.push(activity);
        console.log('⏰ Found activity:', activity);
      }
    }
  });
  
  if (currentDay) {
    timeline.push(currentDay);
  }
  
  console.log('📊 Final timeline:', timeline);
  return timeline;
}

// Test với JSON content
console.log('=== Testing JSON Content ===');
testParseAiContentToTimeline(testJsonContent);

console.log('\n=== Testing Plain Content ===');
testParseAiContentToTimeline(testPlainContent);