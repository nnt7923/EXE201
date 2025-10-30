const mongoose = require('mongoose');
const Plan = require('./models/Plan');
require('dotenv').config();

async function removePremiumPlan() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Tìm và xóa Premium Plan
    const premiumPlan = await Plan.findOne({ name: 'Premium Plan' });
    if (premiumPlan) {
      await Plan.deleteOne({ _id: premiumPlan._id });
      console.log(`🗑️ Deleted Premium Plan (ID: ${premiumPlan._id})`);
    } else {
      console.log('❌ Premium Plan not found');
    }
    
    // Kiểm tra kết quả
    const remainingPlans = await Plan.find({}).sort({ displayOrder: 1, price: 1 });
    console.log('\n📋 Remaining plans:');
    remainingPlans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.name} - ${plan.price.toLocaleString('vi-VN')}đ`);
    });
    
    // Kiểm tra không còn plans trùng giá
    const priceGroups = {};
    remainingPlans.forEach(plan => {
      if (!priceGroups[plan.price]) {
        priceGroups[plan.price] = [];
      }
      priceGroups[plan.price].push(plan);
    });
    
    console.log('\n🔍 Price duplication check:');
    let hasDuplicates = false;
    Object.keys(priceGroups).forEach(price => {
      if (priceGroups[price].length > 1) {
        console.log(`⚠️ Price ${price}đ still has ${priceGroups[price].length} plans`);
        hasDuplicates = true;
      }
    });
    
    if (!hasDuplicates) {
      console.log('✅ No duplicate prices found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

removePremiumPlan();