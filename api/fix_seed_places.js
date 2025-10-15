const fs = require('fs');

// Đọc file JSON gốc
const jsonData = JSON.parse(fs.readFileSync('../an-gi-o-dau.places.json', 'utf8'));

// Dữ liệu places gốc (6 places đầu tiên)
const originalPlaces = [
  {
    name: 'Nhà Hàng Sen Vàng Hòa Lạc',
    category: 'restaurant',
    subcategory: 'Món Việt',
    description: 'Nhà hàng chuyên các món ăn truyền thống Việt Nam, không gian rộng rãi, thoáng đãng. Lý tưởng cho các buổi tiệc gia đình và hội họp.',
    location: { type: 'Point', coordinates: [105.534444, 20.970833] },
    address: { street: 'Gần Cầu Vai Réo', ward: 'Phú Cát', district: 'Quốc Oai', city: 'Hà Nội' },
    pricing: { minPrice: 150000, maxPrice: 500000, currency: 'VND' },
    tags: ['món việt', 'gia đình', 'rộng rãi'],
    images: [{ url: '/vietnamese-bun-bo-hue-restaurant.png', alt: 'Không gian nhà hàng Sen Vàng' }]
  },
  {
    name: 'Twitter Beans Coffee - KCNC Hòa Lạc',
    category: 'cafe',
    subcategory: 'Cà phê làm việc',
    description: 'Không gian yên tĩnh, hiện đại, phù hợp cho việc học tập và làm việc. Cung cấp nhiều loại đồ uống và đồ ăn nhẹ.',
    location: { type: 'Point', coordinates: [105.50997, 21.01779] },
    address: { street: 'Khu Công nghệ cao Hòa Lạc', ward: 'Tân Xã', district: 'Thạch Thất', city: 'Hà Nội' },
    pricing: { minPrice: 40000, maxPrice: 80000, currency: 'VND' },
    tags: ['yên tĩnh', 'làm việc', 'hiện đại'],
    images: [{ url: '/modern-study-cafe-with-students.png', alt: 'Quầy pha chế của Twitter Beans Coffee' }]
  },
  {
    name: '1988 BBQ Hòa Lạc',
    category: 'restaurant',
    subcategory: 'Nướng',
    description: 'Quán nướng nổi tiếng với sinh viên, giá cả phải chăng, thực đơn đa dạng các món nướng và lẩu.',
    location: { type: 'Point', coordinates: [105.5205, 21.0226] },
    address: { street: 'QL21A', ward: 'Thạch Hoà', district: 'Thạch Thất', city: 'Hà Nội' },
    pricing: { minPrice: 100000, maxPrice: 300000, currency: 'VND' },
    tags: ['bbq', 'sinh viên', 'giá rẻ'],
    images: [{ url: 'https://toplist.vn/images/800px/the-hill-bbq-restaurant-879488.jpg', alt: 'Món nướng tại 1988 BBQ' }]
  },
  {
    name: 'Bay Coffee Hòa Lạc',
    category: 'cafe',
    subcategory: 'Cà phê thường',
    description: 'Quán cà phê bình dân với giá cả phải chăng, phù hợp cho sinh viên và người dân địa phương.',
    location: { type: 'Point', coordinates: [105.5195, 21.0067] },
    address: { street: 'Đường mẫu 4', ward: 'Phường mẫu 4', district: 'Quận mẫu 4', city: 'Hà Nội' },
    pricing: { minPrice: 20000, maxPrice: 50000, currency: 'VND' },
    tags: ['cafe', 'giá rẻ'],
    images: [{ url: 'https://lh3.googleusercontent.com/p/AF1QipOSceyAMDJZNQNzyeN10brPvp8HCnx5nhnrYJt1=w408-h306-k-no', alt: 'Hình ảnh Bay Coffee Hòa Lạc' }]
  },
  {
    name: 'Bánh cuốn, bún chả A Hoàng',
    category: 'restaurant',
    subcategory: 'Món Việt',
    description: 'Quán ăn chuyên bánh cuốn và bún chả.',
    location: { type: 'Point', coordinates: [105.5195699870118, 21.006668817250116] },
    address: { street: 'Đường mẫu 5', ward: 'Phường mẫu 5', district: 'Quận mẫu 5', city: 'Hà Nội' },
    pricing: { minPrice: 30000, maxPrice: 80000, currency: 'VND' },
    tags: ['restaurant', 'bún chả'],
    images: [{ url: 'https://lh3.googleusercontent.com/p/AF1QipOSceyAMDJZNQNzyeN10brPvp8HCnx5nhnrYJt1=w408-h306-k-no', alt: 'Hình ảnh bánh cuốn, bún chả A Hoàng' }]
  },
  {
    name: 'Lẩu nấm Ashima',
    category: 'restaurant',
    subcategory: 'Lẩu',
    description: 'Nhà hàng chuyên các món lẩu nấm, không gian ấm cúng, phù hợp cho nhóm bạn.',
    location: { type: 'Point', coordinates: [105.5205, 21.0226] },
    address: { street: 'QL21A', ward: 'Thạch Hoà', district: 'Thạch Thất', city: 'Hà Nội' },
    pricing: { minPrice: 120000, maxPrice: 250000, currency: 'VND' },
    tags: ['lẩu', 'nhóm bạn'],
    images: [{ url: 'https://toplist.vn/images/800px/the-hill-bbq-restaurant-879488.jpg', alt: 'Món lẩu nấm tại Ashima' }]
  },
  {
    name: 'Phở Lý Quốc Sư - Hòa Lạc',
    category: 'restaurant',
    subcategory: 'Phở',
    description: 'Quán phở truyền thống với hương vị đậm đà, phục vụ từ sáng sớm.',
    location: { type: 'Point', coordinates: [105.5195, 21.0067] },
    address: { street: 'Đường mẫu 6', ward: 'Phường mẫu 6', district: 'Quận mẫu 6', city: 'Hà Nội' },
    pricing: { minPrice: 35000, maxPrice: 60000, currency: 'VND' },
    tags: ['phở', 'sáng sớm'],
    images: [{ url: 'https://lh3.googleusercontent.com/p/AF1QipOSceyAMDJZNQNzyeN10brPvp8HCnx5nhnrYJt1=w408-h306-k-no', alt: 'Tô phở tại Lý Quốc Sư' }]
  }
];

// Chuyển đổi dữ liệu từ JSON
function convertPlace(place) {
  const categoryMap = {
    'Ăn uống': 'restaurant',
    'Cà phê': 'cafe',
    'Giải trí': 'entertainment',
    'Học tập': 'study',
    'Lưu trú': 'accommodation'
  };

  return {
    name: place.name,
    category: categoryMap[place.category] || 'restaurant',
    subcategory: place.subcategory || 'Khác',
    description: place.description || `Mô tả cho ${place.name}`,
    location: {
      type: 'Point',
      coordinates: place.location.coordinates
    },
    address: {
      street: place.address.street || 'Không rõ tên đường',
      ward: place.address.ward || 'Không rõ phường/xã',
      district: place.address.district,
      city: place.address.city
    },
    pricing: {
      minPrice: place.pricing.minPrice,
      maxPrice: place.pricing.maxPrice,
      currency: place.pricing.currency
    },
    tags: place.tags || [categoryMap[place.category] || 'restaurant'],
    images: place.images && place.images.length > 0 ? [{
      url: place.images[0].url,
      alt: `Hình ảnh ${place.name}`
    }] : [{
      url: 'https://via.placeholder.com/400x300',
      alt: `Hình ảnh ${place.name}`
    }]
  };
}

// Chuyển đổi tất cả places từ JSON
const convertedPlaces = jsonData.map(convertPlace);

// Kết hợp places gốc và places mới
const allPlaces = [...originalPlaces, ...convertedPlaces];

// Tạo nội dung file mới
const fileContent = `// api/seed_places.js
const mongoose = require('mongoose');
const Place = require('./models/Place');
const User = require('./models/User');
require('dotenv').config(); // Make sure to use the .env file

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined in your .env file.');
  process.exit(1);
}

const samplePlaces = ${JSON.stringify(allPlaces, null, 2)};

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('Finding a user to be the author...');
    const author = await User.findOne();
    if (!author) {
      throw new Error('Database is empty or no users found. Please register at least one user before seeding places.');
    }
    console.log(\`✅ Found user: \${author.name}. All new places will be created by this user.\`);

    console.log('Starting to seed places...');
    for (const placeData of samplePlaces) {
      const existingPlace = await Place.findOne({ name: placeData.name });
      if (existingPlace) {
        console.log(\`- Place "\${placeData.name}" already exists. Skipping.\`);
      } else {
        const place = new Place({
          ...placeData,
          createdBy: author._id,
          isVerified: true,
          isActive: true,
        });
        await place.save();
        console.log(\`+ Added place: "\${place.name}"\`);
      }
    }

    console.log('✅ Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

seedDB();
`;

// Ghi file mới
fs.writeFileSync('./seed_places.js', fileContent, 'utf8');

console.log('✅ Đã tạo lại file seed_places.js thành công!');
console.log(`📊 Tổng số places: ${allPlaces.length} (${originalPlaces.length} gốc + ${convertedPlaces.length} mới)`);