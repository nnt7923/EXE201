const mongoose = require('mongoose');
require('dotenv').config();

const SubscriptionPlan = require('./models/Plan');

async function createBasicPlan() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const plans = await SubscriptionPlan.find({});
    console.log('Current plans:');
    plans.forEach(plan => {
      console.log(`- ${plan.name}: ${plan.price}đ`);
    });
    
    // Check if Basic plan exists
    const basicPlan = plans.find(p => 
      p.name.toLowerCase().includes('basic') || 
      p.name.toLowerCase().includes('cơ bản')
    );
    
    if (!basicPlan) {
      console.log('\nCreating Basic plan...');
      const newBasicPlan = new SubscriptionPlan({
        name: 'Basic',
        description: 'Gói cơ bản miễn phí',
        price: 0,
        durationInDays: 30,
        aiSuggestionLimit: 2,
        features: ['2 gợi ý AI mỗi tháng', 'Truy cập cơ bản']
      });
      await newBasicPlan.save();
      console.log('✅ Basic plan created');
    } else {
      console.log('\n✅ Basic plan already exists:', basicPlan.name);
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createBasicPlan();