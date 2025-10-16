const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Plan = require('./models/Plan');
const Subscription = require('./models/Subscription');

const fixBrokenSubscriptions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Tìm plan "Chuyên nghiệp" để làm plan mặc định
    const defaultPlan = await Plan.findOne({ name: 'Chuyên nghiệp' });
    if (!defaultPlan) {
      console.log('❌ Default plan "Chuyên nghiệp" not found');
      return;
    }
    console.log('📋 Found default plan:', defaultPlan.name, 'ID:', defaultPlan._id);

    // Tìm tất cả subscriptions có plan reference bị broken
    const allSubscriptions = await Subscription.find({});
    const brokenSubscriptions = [];
    
    for (const sub of allSubscriptions) {
      if (sub.plan) {
        const planExists = await Plan.findById(sub.plan);
        if (!planExists) {
          brokenSubscriptions.push(sub);
        }
      }
    }

    console.log(`\n🔍 Found ${brokenSubscriptions.length} broken subscriptions`);

    // Sửa từng subscription bị broken
    for (const sub of brokenSubscriptions) {
      console.log(`\n🔧 Fixing subscription ${sub._id}...`);
      console.log('- Old plan ID:', sub.plan);
      console.log('- Customer:', sub.customerInfo.name, sub.customerInfo.email);
      
      // Cập nhật plan reference
      sub.plan = defaultPlan._id;
      await sub.save();
      
      console.log('✅ Updated plan ID to:', defaultPlan._id);
    }

    // Verify fixes
    console.log('\n🔍 Verifying fixes...');
    const verifySubscriptions = await Subscription.find({
      _id: { $in: brokenSubscriptions.map(s => s._id) }
    }).populate('plan');

    for (const sub of verifySubscriptions) {
      console.log(`✅ Subscription ${sub._id} now linked to plan: ${sub.plan.name}`);
    }

    console.log(`\n🎉 Fixed ${brokenSubscriptions.length} broken subscriptions!`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

fixBrokenSubscriptions();