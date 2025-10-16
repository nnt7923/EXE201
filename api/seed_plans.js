const mongoose = require('mongoose');
const Plan = require('./models/Plan');
require('dotenv').config();

const samplePlans = [
  {
    name: 'Cơ bản',
    description: 'Gói cơ bản cho sinh viên mới bắt đầu khám phá khu vực Hòa Lạc',
    price: 0,
    features: [
      'Xem thông tin cơ bản về địa điểm',
      'Tìm kiếm địa điểm theo danh mục',
      'Xem đánh giá từ cộng đồng',
      'Tạo tối đa 2 lịch trình cơ bản'
    ],
    aiSuggestionLimit: 2,
    displayOrder: 1
  },
  {
    name: 'Chuyên nghiệp',
    description: 'Gói phù hợp cho sinh viên thường xuyên khám phá và cần gợi ý AI',
    price: 99000,
    features: [
      'Tất cả tính năng gói Cơ bản',
      'Gợi ý lịch trình thông minh bằng AI',
      'Tạo không giới hạn lịch trình',
      'Ưu tiên hỗ trợ khách hàng',
      'Thông báo về địa điểm mới'
    ],
    aiSuggestionLimit: 20,
    displayOrder: 2
  },
  {
    name: 'Không giới hạn',
    description: 'Gói cao cấp với tất cả tính năng và hỗ trợ ưu tiên',
    price: 199000,
    features: [
      'Tất cả tính năng gói Chuyên nghiệp',
      'Gợi ý AI không giới hạn',
      'Tư vấn cá nhân hóa',
      'Truy cập sớm tính năng mới',
      'Hỗ trợ 24/7',
      'Báo cáo chi tiết về hoạt động'
    ],
    aiSuggestionLimit: 999999, // Large number to represent unlimited
    displayOrder: 3
  }
];

async function seedPlans() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau');
    console.log('✅ Connected to MongoDB');

    // Clear existing plans
    await Plan.deleteMany({});
    console.log('🗑️ Cleared existing plans');

    // Insert sample plans
    const createdPlans = await Plan.insertMany(samplePlans);
    console.log(`✅ Created ${createdPlans.length} sample plans:`);
    
    createdPlans.forEach(plan => {
      console.log(`   - ${plan.name}: ${plan.price.toLocaleString('vi-VN')} VND/tháng`);
    });

    console.log('\n🎉 Plans seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📝 Database connection closed');
  }
}

// Run the seeding function
if (require.main === module) {
  seedPlans();
}

module.exports = { seedPlans, samplePlans };