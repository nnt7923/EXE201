const mongoose = require('mongoose');
const Plan = require('./models/Plan');
require('dotenv').config();

async function createSamplePlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Xóa tất cả plans hiện tại
    await Plan.deleteMany({});
    console.log('🗑️ Cleared existing plans');
    
    // Tạo plans mẫu
    const samplePlans = [
      {
        name: 'Cơ bản',
        description: 'Gói cơ bản miễn phí',
        price: 0,
        features: ['Tạo lịch trình cơ bản', 'Tìm kiếm địa điểm', 'Lưu lịch trình'],
        aiSuggestionLimit: 5,
        displayOrder: 1,
        isActive: true
      },
      {
        name: 'Chuyên nghiệp',
        description: 'Gói chuyên nghiệp với AI',
        price: 99000,
        features: ['Tất cả tính năng cơ bản', 'AI suggestions', 'Hỗ trợ ưu tiên'],
        aiSuggestionLimit: 50,
        displayOrder: 2,
        isActive: true
      },
      {
        name: 'Không giới hạn',
        description: 'Gói không giới hạn với tất cả tính năng',
        price: 299000,
        features: ['Tất cả tính năng', 'AI không giới hạn', 'Hỗ trợ 24/7'],
        aiSuggestionLimit: 999,
        displayOrder: 4,
        isActive: true
      }
    ];
    
    // Tạo plans
    for (const planData of samplePlans) {
      const plan = new Plan(planData);
      await plan.save();
      console.log(`✅ Created plan: ${plan.name} - ${plan.price}đ`);
    }
    
    // Kiểm tra kết quả
    const allPlans = await Plan.find({}).sort({ displayOrder: 1 });
    console.log('\n📋 All plans created:');
    allPlans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.name} - ${plan.price}đ (Active: ${plan.isActive})`);
    });
    
    // Tìm plans trùng giá
    const priceGroups = {};
    allPlans.forEach(plan => {
      if (!priceGroups[plan.price]) {
        priceGroups[plan.price] = [];
      }
      priceGroups[plan.price].push(plan);
    });
    
    console.log('\n🔍 Duplicate price analysis:');
    Object.keys(priceGroups).forEach(price => {
      if (priceGroups[price].length > 1) {
        console.log(`\n⚠️ Price ${price}đ has ${priceGroups[price].length} plans:`);
        priceGroups[price].forEach(plan => {
          console.log(`  - ${plan.name} (ID: ${plan._id})`);
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

createSamplePlans();