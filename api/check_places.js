const fs = require('fs');

// Đọc file seed_places.js
const content = fs.readFileSync('./seed_places.js', 'utf8');

// Tìm phần samplePlaces
const startIndex = content.indexOf('const samplePlaces = [');
const endIndex = content.indexOf('];', startIndex) + 2;

if (startIndex === -1 || endIndex === -1) {
  console.log('Không tìm thấy samplePlaces array');
  process.exit(1);
}

const placesCode = content.substring(startIndex, endIndex);

try {
  // Evaluate code để lấy mảng places
  let samplePlaces;
  eval(placesCode);
  
  console.log(`Tổng số places: ${samplePlaces.length}`);
  
  // Kiểm tra từng place
  samplePlaces.forEach((place, index) => {
    if (!place || typeof place !== 'object') {
      console.log(`❌ Place tại index ${index} không phải là object:`, place);
      return;
    }
    
    if (!place.name) {
      console.log(`❌ Place tại index ${index} thiếu thuộc tính 'name':`, place);
      return;
    }
    
    if (!place.category) {
      console.log(`❌ Place "${place.name}" tại index ${index} thiếu thuộc tính 'category'`);
    }
    
    if (!place.location || !place.location.coordinates) {
      console.log(`❌ Place "${place.name}" tại index ${index} thiếu thuộc tính 'location.coordinates'`);
    }
  });
  
  console.log('✅ Kiểm tra hoàn tất');
  
} catch (error) {
  console.error('❌ Lỗi khi parse places:', error.message);
  console.log('Vị trí lỗi có thể ở gần dòng:', error.stack);
}