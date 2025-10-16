const mongoose = require('mongoose');
require('dotenv').config();

const Subscription = require('./models/Subscription');
const Plan = require('./models/Plan');

async function fixSubscriptionPlans() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau');
    console.log('✅ Đã kết nối MongoDB');

    // Lấy tất cả các gói có sẵn
    const plans = await Plan.find().sort({ price: 1 });
    console.log('📋 Các gói có sẵn:');
    plans.forEach(plan => {
      console.log(`  - ${plan.name}: ${plan.price} VND (ID: ${plan._id})`);
    });

    // Lấy tất cả subscription
    const subscriptions = await Subscription.find();
    console.log(`\n🔍 Kiểm tra ${subscriptions.length} subscription...`);

    let fixedCount = 0;

    for (const subscription of subscriptions) {
      if (subscription.plan) {
        // Kiểm tra xem plan có tồn tại không
        const planExists = await Plan.findById(subscription.plan);
        
        if (!planExists) {
          console.log(`❌ Subscription ${subscription.subscriptionNumber} có plan ID không hợp lệ: ${subscription.plan}`);
          
          // Tìm plan phù hợp dựa trên giá trong pricing
          const planPrice = subscription.pricing?.planPrice;
          let newPlan = null;
          
          if (planPrice) {
            // Tìm plan có giá chính xác
            newPlan = plans.find(plan => plan.price === planPrice);
            
            if (!newPlan) {
              // Nếu không tìm thấy, chọn plan gần nhất
              newPlan = plans.reduce((prev, curr) => 
                Math.abs(curr.price - planPrice) < Math.abs(prev.price - planPrice) ? curr : prev
              );
            }
          } else {
            // Nếu không có thông tin giá, gán plan cơ bản
            newPlan = plans.find(plan => plan.name === 'Cơ bản') || plans[0];
          }
          
          if (newPlan) {
            subscription.plan = newPlan._id;
            await subscription.save();
            console.log(`✅ Đã gán plan "${newPlan.name}" cho subscription ${subscription.subscriptionNumber}`);
            fixedCount++;
          }
        }
      } else {
        console.log(`⚠️  Subscription ${subscription.subscriptionNumber} không có plan`);
        
        // Gán plan cơ bản cho subscription không có plan
        const basicPlan = plans.find(plan => plan.name === 'Cơ bản') || plans[0];
        if (basicPlan) {
          subscription.plan = basicPlan._id;
          await subscription.save();
          console.log(`✅ Đã gán plan cơ bản cho subscription ${subscription.subscriptionNumber}`);
          fixedCount++;
        }
      }
    }

    console.log(`\n✅ Hoàn thành! Đã sửa ${fixedCount} subscription`);

    // Kiểm tra lại với populate
    console.log('\n📋 Kiểm tra lại với populate:');
    const populatedSubs = await Subscription.find()
      .populate('plan', 'name price')
      .limit(5);

    for (const sub of populatedSubs) {
      console.log(`   ${sub.subscriptionNumber}: ${sub.plan ? sub.plan.name : 'NULL'}`);
    }

  } catch (error) {
    console.error('❌ Lỗi khi sửa chữa dữ liệu:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nĐã ngắt kết nối MongoDB');
  }
}

fixSubscriptionPlans();