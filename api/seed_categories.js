const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const categoriesData = {
  restaurant: {
    name: 'Nhà hàng',
    subcategories: [
      'Cơm tấm', 'Phở', 'Bún bò Huế', 'Bún chả', 'Bánh mì', 'Chả cá',
      'Lẩu', 'Nướng', 'Hải sản', 'Đồ chay', 'Món Nhật', 'Món Hàn',
      'Món Thái', 'Món Trung', 'Pizza', 'Burger', 'Món Âu'
    ]
  },
  cafe: {
    name: 'Cà phê',
    subcategories: [
      'Cà phê truyền thống', 'Cà phê hiện đại', 'Trà sữa', 'Sinh tố',
      'Nước ép', 'Smoothie', 'Cà phê học bài', 'Cà phê làm việc'
    ]
  },
  accommodation: {
    name: 'Nhà trọ',
    subcategories: [
      'Phòng trọ', 'Ký túc xá', 'Homestay', 'Khách sạn mini',
      'Căn hộ cho thuê', 'Nhà nguyên căn'
    ]
  },
  entertainment: {
    name: 'Giải trí',
    subcategories: [
      'Karaoke', 'Game center', 'Cinema', 'Bowling', 'Billiards',
      'Escape room', 'VR game', 'Board game cafe'
    ]
  },
  study: {
    name: 'Học tập',
    subcategories: [
      'Thư viện', 'Cà phê học bài', 'Co-working space', 'Lớp học',
      'Trung tâm ngoại ngữ', 'Luyện thi'
    ]
  }
};

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau', {});
    console.log('✅ Connected to MongoDB for seeding');

    await Category.deleteMany({});
    console.log('Cleared existing categories.');

    const categoryPromises = Object.keys(categoriesData).map(key => {
      const category = categoriesData[key];
      return Category.create({
        key: key,
        name: category.name,
        subcategories: category.subcategories
      });
    });

    await Promise.all(categoryPromises);
    console.log('✅ Categories seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

seedCategories();
