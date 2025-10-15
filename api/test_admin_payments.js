const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const User = require('./models/User');
const SubscriptionPlan = require('./models/SubscriptionPlan');
require('dotenv').config();

async function testAdminPayments() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công');

    // Tìm payment của user ngoquocan712@gmail.com
    console.log('\n🔍 Tìm payment của ngoquocan712@gmail.com...');
    
    const user = await User.findOne({ email: 'ngoquocan712@gmail.com' });
    if (!user) {
      console.log('❌ Không tìm thấy user');
      return;
    }
    
    console.log(`✅ Tìm thấy user: ${user.name} (${user.email})`);
    console.log(`   - User ID: ${user._id}`);
    console.log(`   - Subscription Status: ${user.subscriptionStatus}`);
    console.log(`   - Subscription Plan: ${user.subscriptionPlan}`);

    // Tìm payment record
    const payment = await Payment.findOne({ user: user._id });
    if (!payment) {
      console.log('❌ Không tìm thấy payment record');
      return;
    }
    
    console.log(`\n✅ Tìm thấy payment record:`);
    console.log(`   - Payment ID: ${payment._id}`);
    console.log(`   - User: ${payment.user}`);
    console.log(`   - Subscription Plan ID: ${payment.subscriptionPlan}`);
    console.log(`   - Amount: ${payment.amount}`);
    console.log(`   - Status: ${payment.status}`);
    console.log(`   - Created: ${payment.createdAt}`);

    // Kiểm tra subscription plan có tồn tại không
    if (payment.subscriptionPlan) {
      console.log(`\n🔍 Kiểm tra subscription plan ${payment.subscriptionPlan}...`);
      const plan = await SubscriptionPlan.findById(payment.subscriptionPlan);
      if (plan) {
        console.log(`✅ Tìm thấy subscription plan:`);
        console.log(`   - Plan ID: ${plan._id}`);
        console.log(`   - Name: ${plan.name}`);
        console.log(`   - Price: ${plan.price}`);
        console.log(`   - Duration: ${plan.durationInDays} days`);
        console.log(`   - Active: ${plan.isActive}`);
      } else {
        console.log(`❌ Không tìm thấy subscription plan với ID: ${payment.subscriptionPlan}`);
      }
    } else {
      console.log(`❌ Payment không có subscriptionPlan ID`);
    }

    // Test query giống như trong API admin/pending
    console.log('\n🔍 Testing admin pending payments query với populate...');
    
    const pendingPayments = await Payment.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('subscriptionPlan', 'name price durationInDays')
      .sort({ createdAt: -1 });

    console.log(`📊 Tìm thấy ${pendingPayments.length} pending payments:`);
    
    if (pendingPayments.length > 0) {
      pendingPayments.forEach((payment, index) => {
        console.log(`\n${index + 1}. Payment ID: ${payment._id}`);
        console.log(`   - User: ${payment.user ? payment.user.name : 'N/A'} (${payment.user ? payment.user.email : 'N/A'})`);
        console.log(`   - Plan: ${payment.subscriptionPlan ? payment.subscriptionPlan.name : 'N/A'}`);
        console.log(`   - Plan Price: ${payment.subscriptionPlan ? payment.subscriptionPlan.price : 'N/A'}`);
        console.log(`   - Plan Duration: ${payment.subscriptionPlan ? payment.subscriptionPlan.durationInDays : 'N/A'}`);
        console.log(`   - Amount: ${payment.amount}`);
        console.log(`   - Status: ${payment.status}`);
        console.log(`   - Created: ${payment.createdAt}`);
      });
    }
    
    // Kiểm tra tất cả subscription plans
    console.log('\n🔍 Kiểm tra tất cả subscription plans...');
    const allPlans = await SubscriptionPlan.find({});
    console.log(`📊 Tìm thấy ${allPlans.length} subscription plans:`);
    allPlans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.name} - ${plan.price} VND - ${plan.durationInDays} days - Active: ${plan.isActive}`);
    });
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Đã ngắt kết nối MongoDB');
  }
}

testAdminPayments();