// Script để chuyển đổi dữ liệu từ an-gi-o-dau.places.json sang format seed_places
const fs = require('fs');
const path = require('path');

// Đọc dữ liệu từ file JSON
const placesData = require('./an-gi-o-dau.places.json');

// Hàm chuyển đổi subcategory thành tags phù hợp
function generateTags(category, subcategory, name) {
  const tags = [];
  
  // Thêm category làm tag
  if (category) tags.push(category);
  
  // Thêm subcategory làm tag nếu khác "Khác"
  if (subcategory && subcategory !== 'Khác') {
    tags.push(subcategory.toLowerCase());
  }
  
  // Thêm một số tags dựa trên tên
  const nameLower = name.toLowerCase();
  if (nameLower.includes('coffee') || nameLower.includes('cà phê')) tags.push('cà phê');
  if (nameLower.includes('nhà trọ')) tags.push('nhà trọ', 'sinh viên');
  if (nameLower.includes('mixue')) tags.push('trà sữa', 'giá rẻ');
  if (nameLower.includes('hồ câu')) tags.push('giải trí', 'câu cá');
  if (nameLower.includes('siêu thị')) tags.push('mua sắm');
  if (nameLower.includes('bbq') || nameLower.includes('nướng')) tags.push('bbq', 'nướng');
  
  return [...new Set(tags)]; // Loại bỏ duplicate
}

// Hàm tạo pricing dựa trên category
function generatePricing(category, subcategory) {
  switch (category) {
    case 'restaurant':
      if (subcategory === 'Bún chả' || subcategory === 'Phở') {
        return { minPrice: 30000, maxPrice: 80000, currency: 'VND' };
      }
      return { minPrice: 50000, maxPrice: 200000, currency: 'VND' };
    
    case 'cafe':
      return { minPrice: 25000, maxPrice: 80000, currency: 'VND' };
    
    case 'accommodation':
      return { minPrice: 800000, maxPrice: 2500000, currency: 'VND' };
    
    case 'entertainment':
      if (subcategory === 'Hồ câu') {
        return { minPrice: 50000, maxPrice: 150000, currency: 'VND' };
      }
      if (subcategory === 'Siêu thị') {
        return { minPrice: 10000, maxPrice: 500000, currency: 'VND' };
      }
      return { minPrice: 30000, maxPrice: 100000, currency: 'VND' };
    
    case 'study':
      return { minPrice: 0, maxPrice: 50000, currency: 'VND' };
    
    default:
      return { minPrice: 20000, maxPrice: 100000, currency: 'VND' };
  }
}

// Chuyển đổi dữ liệu
const convertedPlaces = placesData.map(place => {
  const tags = generateTags(place.category, place.subcategory, place.name);
  const pricing = generatePricing(place.category, place.subcategory);
  
  // Lấy URL hình ảnh đầu tiên nếu có
  const imageUrl = place.images && place.images.length > 0 ? place.images[0].url : '/placeholder.jpg';
  
  return {
    name: place.name,
    category: place.category,
    subcategory: place.subcategory,
    description: place.description || `Mô tả cho ${place.name}`,
    location: {
      type: 'Point',
      coordinates: place.location.coordinates
    },
    address: {
      street: place.address.street,
      ward: place.address.ward,
      district: place.address.district,
      city: place.address.city
    },
    pricing: pricing,
    tags: tags,
    images: [{ url: imageUrl, alt: `Hình ảnh ${place.name}` }]
  };
});

console.log(`Đã chuyển đổi ${convertedPlaces.length} địa điểm`);

// Đọc file seed_places.js hiện tại
const seedPlacesPath = path.join(__dirname, 'api', 'seed_places.js');
let seedContent = fs.readFileSync(seedPlacesPath, 'utf8');

// Tìm vị trí của mảng samplePlaces
const startMarker = 'const samplePlaces = [';
const endMarker = '];';

const startIndex = seedContent.indexOf(startMarker);
const endIndex = seedContent.indexOf(endMarker, startIndex) + endMarker.length;

if (startIndex === -1 || endIndex === -1) {
  console.error('Không tìm thấy mảng samplePlaces trong file seed_places.js');
  process.exit(1);
}

// Tạo nội dung mới cho mảng samplePlaces
const existingPlacesContent = seedContent.substring(startIndex + startMarker.length, endIndex - endMarker.length);

// Chuyển đổi các địa điểm mới thành chuỗi JavaScript
const newPlacesString = convertedPlaces.map(place => {
  return `  {
    name: '${place.name.replace(/'/g, "\\'")}',
    category: '${place.category}',
    subcategory: '${place.subcategory}',
    description: '${place.description.replace(/'/g, "\\'")}',
    location: { type: 'Point', coordinates: [${place.location.coordinates[0]}, ${place.location.coordinates[1]}] },
    address: { street: '${place.address.street.replace(/'/g, "\\'")}', ward: '${place.address.ward.replace(/'/g, "\\'")}', district: '${place.address.district.replace(/'/g, "\\'")}', city: '${place.address.city.replace(/'/g, "\\'")}' },
    pricing: { minPrice: ${place.pricing.minPrice}, maxPrice: ${place.pricing.maxPrice}, currency: '${place.pricing.currency}' },
    tags: [${place.tags.map(tag => `'${tag.replace(/'/g, "\\'")}'`).join(', ')}],
    images: [{ url: '${place.images[0].url.replace(/'/g, "\\'")}', alt: '${place.images[0].alt.replace(/'/g, "\\'")}' }]
  }`;
}).join(',\n');

// Tạo nội dung mới cho file
const newSamplePlacesContent = `const samplePlaces = [${existingPlacesContent},
${newPlacesString}
];`;

// Thay thế nội dung trong file
const newSeedContent = seedContent.substring(0, startIndex) + newSamplePlacesContent + seedContent.substring(endIndex);

// Ghi file mới
fs.writeFileSync(seedPlacesPath, newSeedContent, 'utf8');

console.log(`✅ Đã thêm ${convertedPlaces.length} địa điểm mới vào file seed_places.js`);
console.log('📍 Các địa điểm đã được thêm:');
convertedPlaces.forEach((place, index) => {
  console.log(`${index + 1}. ${place.name} (${place.category})`);
});