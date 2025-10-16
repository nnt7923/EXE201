const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Plan = require('./models/Plan');
const Subscription = require('./models/Subscription');

const checkNgoquocanSubscription = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Tìm user ngoquocan712@gmail.com
    const user = await User.findOne({ email: 'ngoquocan712@gmail.com' });
    if (!user) {
      console.log('❌ User ngoquocan712@gmail.com not found');
      return;
    }
    console.log('👤 Found user:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    // Tìm tất cả subscriptions của user này
    const subscriptions = await Subscription.find({ user: user._id }).populate('plan');
    console.log('\n📋 User subscriptions:');
    if (subscriptions.length === 0) {
      console.log('❌ No subscriptions found for this user');
    } else {
      subscriptions.forEach((sub, index) => {
        console.log(`\n--- Subscription ${index + 1} ---`);
        console.log('ID:', sub._id);
        console.log('Subscription Number:', sub.subscriptionNumber);
        console.log('Status:', sub.status);
        console.log('Payment Status:', sub.paymentStatus);
        console.log('Start Date:', sub.startDate);
        console.log('End Date:', sub.endDate);
        console.log('Plan:', sub.plan ? {
          id: sub.plan._id,
          name: sub.plan.name,
          price: sub.plan.price
        } : 'No plan linked');
        console.log('Customer Info:', sub.customerInfo);
        console.log('Pricing:', sub.pricing);
      });
    }

    // Kiểm tra tất cả plans có sẵn
    console.log('\n📦 Available plans:');
    const plans = await Plan.find({});
    plans.forEach(plan => {
      console.log(`- ${plan.name} (ID: ${plan._id}, Price: ${plan.price})`);
    });

    // Kiểm tra xem có subscription nào có vấn đề về plan reference không
    console.log('\n🔍 Checking for broken plan references...');
    const allSubscriptions = await Subscription.find({});
    for (const sub of allSubscriptions) {
      if (sub.plan) {
        const planExists = await Plan.findById(sub.plan);
        if (!planExists) {
          console.log(`❌ Subscription ${sub._id} references non-existent plan ${sub.plan}`);
        }
      } else {
        console.log(`⚠️ Subscription ${sub._id} has no plan reference`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

checkNgoquocanSubscription();