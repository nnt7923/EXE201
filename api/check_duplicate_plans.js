const mongoose = require('mongoose');
const Plan = require('./models/Plan');

async function checkPlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-app');
    console.log('Connected to MongoDB');
    
    // Kiểm tra tất cả collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(col => console.log(`- ${col.name}`));
    
    // Kiểm tra plans collection
    const plans = await Plan.find({}).sort({ price: 1 });
    console.log(`\nFound ${plans.length} plans:`);
    console.log('=============');
    
    plans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.name}`);
      console.log(`   - Price: ${plan.price}đ`);
      console.log(`   - Description: ${plan.description}`);
      console.log(`   - Active: ${plan.isActive}`);
      console.log(`   - ID: ${plan._id}`);
      console.log('');
    });
    
    // Tìm plans trùng giá
    const priceGroups = {};
    plans.forEach(plan => {
      if (!priceGroups[plan.price]) {
        priceGroups[plan.price] = [];
      }
      priceGroups[plan.price].push(plan);
    });
    
    console.log('Duplicate prices:');
    Object.keys(priceGroups).forEach(price => {
      if (priceGroups[price].length > 1) {
        console.log(`\nPrice ${price}đ has ${priceGroups[price].length} plans:`);
        priceGroups[price].forEach(plan => {
          console.log(`  - ${plan.name} (ID: ${plan._id})`);
        });
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkPlans();