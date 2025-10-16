const mongoose = require('mongoose');
require('dotenv').config();

const Subscription = require('./models/Subscription');
const Plan = require('./models/Plan');

async function debugSubscriptionPlans() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau');
    console.log('✅ Đã kết nối MongoDB');

    // Lấy tất cả subscription
    const subscriptions = await Subscription.find().limit(10);
    console.log(`\n📋 Kiểm tra ${subscriptions.length} subscription đầu tiên:`);

    for (const sub of subscriptions) {
      console.log(`\n🔍 Subscription: ${sub.subscriptionNumber}`);
      console.log(`   Plan ID: ${sub.plan}`);
      console.log(`   Plan type: ${typeof sub.plan}`);
      console.log(`   Plan null?: ${sub.plan === null}`);
      console.log(`   Plan undefined?: ${sub.plan === undefined}`);
      
      if (sub.plan) {
        // Kiểm tra xem plan ID có tồn tại không
        const planExists = await Plan.findById(sub.plan);
        console.log(`   Plan exists: ${!!planExists}`);
        if (planExists) {
          console.log(`   Plan name: ${planExists.name}`);
        }
      }
    }

    // Kiểm tra với populate
    console.log('\n📋 Kiểm tra với populate:');
    const populatedSubs = await Subscription.find()
      .populate('plan', 'name price')
      .limit(5);

    for (const sub of populatedSubs) {
      console.log(`\n🔍 Subscription: ${sub.subscriptionNumber}`);
      console.log(`   Plan populated: ${JSON.stringify(sub.plan)}`);
    }

    // Đếm các loại plan
    const nullPlanCount = await Subscription.countDocuments({ plan: null });
    const undefinedPlanCount = await Subscription.countDocuments({ plan: { $exists: false } });
    const totalCount = await Subscription.countDocuments();

    console.log(`\n📊 Thống kê:`);
    console.log(`   Tổng subscription: ${totalCount}`);
    console.log(`   Plan null: ${nullPlanCount}`);
    console.log(`   Plan undefined: ${undefinedPlanCount}`);

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nĐã ngắt kết nối MongoDB');
  }
}

debugSubscriptionPlans();