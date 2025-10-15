const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const User = require('./models/User');
const SubscriptionPlan = require('./models/SubscriptionPlan');
require('dotenv').config();

async function fixPaymentPlan() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công');

    // Tìm user và payment
    const user = await User.findOne({ email: 'ngoquocan712@gmail.com' });
    const payment = await Payment.findOne({ user: user._id });
    
    console.log(`📋 Payment hiện tại:`);
    console.log(`   - Payment ID: ${payment._id}`);
    console.log(`   - Amount: ${payment.amount}`);
    console.log(`   - Invalid Plan ID: ${payment.subscriptionPlan}`);
    
    // Tìm plan phù hợp dựa trên amount (29000 = Cơ bản)
    const correctPlan = await SubscriptionPlan.findOne({ price: payment.amount });
    
    if (!correctPlan) {
      console.log('❌ Không tìm thấy plan phù hợp với amount');
      return;
    }
    
    console.log(`\n✅ Tìm thấy plan phù hợp:`);
    console.log(`   - Plan ID: ${correctPlan._id}`);
    console.log(`   - Name: ${correctPlan.name}`);
    console.log(`   - Price: ${correctPlan.price}`);
    
    // Cập nhật payment record
    payment.subscriptionPlan = correctPlan._id;
    await payment.save();
    
    console.log(`\n✅ Đã cập nhật payment record với plan ID đúng`);
    
    // Verify update
    const updatedPayment = await Payment.findById(payment._id)
      .populate('user', 'name email')
      .populate('subscriptionPlan', 'name price durationInDays');
      
    console.log(`\n📋 Payment sau khi cập nhật:`);
    console.log(`   - Payment ID: ${updatedPayment._id}`);
    console.log(`   - User: ${updatedPayment.user.name} (${updatedPayment.user.email})`);
    console.log(`   - Plan: ${updatedPayment.subscriptionPlan.name}`);
    console.log(`   - Plan Price: ${updatedPayment.subscriptionPlan.price}`);
    console.log(`   - Amount: ${updatedPayment.amount}`);
    console.log(`   - Status: ${updatedPayment.status}`);
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Đã ngắt kết nối MongoDB');
  }
}

fixPaymentPlan();