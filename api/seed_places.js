
// api/seed_places.js
const mongoose = require('mongoose');
const Place = require('./models/Place');
const User = require('./models/User');
require('dotenv').config(); // Make sure to use the .env file

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined in your .env file.');
  process.exit(1);
}

const samplePlaces = [
  {
    name: 'Nhà Hàng Sen Vàng Hòa Lạc',
    category: 'restaurant',
    subcategory: 'Món Việt',
    description: 'Nhà hàng chuyên các món ăn truyền thống Việt Nam, không gian rộng rãi, thoáng đãng. Lý tưởng cho các buổi tiệc gia đình và hội họp.',
    location: { type: 'Point', coordinates: [105.534444, 20.970833] },
    address: { street: 'Gần Cầu Vai Réo', ward: 'Phú Cát', district: 'Quốc Oai', city: 'Hà Nội' },
    pricing: { minPrice: 150000, maxPrice: 500000, currency: 'VND' },
    tags: ['món việt', 'gia đình', 'rộng rãi'],
    images: [{ url: 'https://images.foody.vn/res/g1/7644/prof/s/foody-mobile-sen-vang-jpg-404-635709683662699943.jpg', alt: 'Không gian nhà hàng Sen Vàng' }]
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
    images: [{ url: 'https://images.foody.vn/res/g75/742117/s800/foody-twitter-beans-coffee-lang-ha-800-637059425729435942.jpg', alt: 'Quầy pha chế của Twitter Beans Coffee' }]
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
    subcategory: 'Cà phê sân vườn',
    description: 'Kiến trúc nhà gỗ 2 tầng độc đáo, có hồ cá Koi và không gian sân vườn yên tĩnh, sang trọng.',
    location: { type: 'Point', coordinates: [105.5231, 21.0250] },
    address: { street: 'Quốc lộ 21', ward: 'Thạch Hoà', district: 'Thạch Thất', city: 'Hà Nội' },
    pricing: { minPrice: 50000, maxPrice: 100000, currency: 'VND' },
    tags: ['sân vườn', 'hồ cá koi', 'yên tĩnh'],
    images: [{ url: 'https://cdn.pastaxi-dot-com.gateway.web.vn/content/uploads/2022/12/bay-coffee-hoa-lac-thach-that-ha-noi-1.jpg', alt: 'Toàn cảnh Bay Coffee' }]
  },
  {
    name: 'Lẩu nấm Ashima',
    category: 'restaurant',
    subcategory: 'Lẩu',
    description: 'Thưởng thức tinh hoa lẩu nấm thiên nhiên trong không gian sang trọng và ấm cúng. Nơi tuyệt vời cho những bữa ăn bổ dưỡng.',
    location: { type: 'Point', coordinates: [105.5150, 21.0200] },
    address: { street: 'Đại lộ Thăng Long', ward: 'Tân Xã', district: 'Thạch Thất', city: 'Hà Nội' },
    pricing: { minPrice: 250000, maxPrice: 600000, currency: 'VND' },
    tags: ['lẩu nấm', 'sang trọng', 'bổ dưỡng'],
    images: [{ url: 'https://static.riviu.co/960/image/2021/03/18/c79dd56f311a2d4549b6428f2556a3af.jpeg', alt: 'Nồi lẩu nấm Ashima' }]
  },
  {
    name: 'Phở Lý Quốc Sư - Hòa Lạc',
    category: 'restaurant',
    subcategory: 'Phở',
    description: 'Thương hiệu phở gia truyền nổi tiếng với hương vị nước dùng đậm đà, thịt bò tươi ngon.',
    location: { type: 'Point', coordinates: [105.5215, 21.0245] },
    address: { street: 'Khu Đô thị Đại học Quốc gia', ward: 'Thạch Hoà', district: 'Thạch Thất', city: 'Hà Nội' },
    pricing: { minPrice: 50000, maxPrice: 70000, currency: 'VND' },
    tags: ['phở', 'gia truyền', 'bữa sáng'],
    images: [{ url: 'https://cdn.tgdd.vn/Files/2022/01/25/1412805/top-15-quan-pho-ly-quoc-su-ngon-chuan-vi-ha-noi-nhat-202201251315272203.jpg', alt: 'Bát phở Lý Quốc Sư' }]
  },
];

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
    console.log(`✅ Found user: ${author.name}. All new places will be created by this user.`);

    console.log('Starting to seed places...');
    for (const placeData of samplePlaces) {
      const existingPlace = await Place.findOne({ name: placeData.name });
      if (existingPlace) {
        console.log(`- Place "${placeData.name}" already exists. Skipping.`);
      } else {
        const place = new Place({
          ...placeData,
          createdBy: author._id,
          isVerified: true,
          isActive: true,
        });
        await place.save();
        console.log(`+ Added place: "${place.name}"`);
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
