const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const User = require('./models/User');
const SubscriptionPlan = require('./models/SubscriptionPlan');
require('dotenv').config();

async function investigatePaymentChanges() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công');

    // Tìm user ngoquocan712@gmail.com
    const user = await User.findOne({ email: 'ngoquocan712@gmail.com' });
    console.log(`\n👤 User: ${user.name} (${user.email})`);
    console.log(`   - User ID: ${user._id}`);
    console.log(`   - Subscription Status: ${user.subscriptionStatus}`);

    // Tìm tất cả payments của user này
    const userPayments = await Payment.find({ user: user._id })
      .populate('subscriptionPlan', 'name price')
      .sort({ createdAt: -1 });

    console.log(`\n💳 Tổng số payments của user: ${userPayments.length}`);
    
    userPayments.forEach((payment, index) => {
      console.log(`\n${index + 1}. Payment ID: ${payment._id}`);
      console.log(`   - Plan: ${payment.subscriptionPlan?.name} (${payment.subscriptionPlan?.price} VND)`);
      console.log(`   - Amount: ${payment.amount} VND`);
      console.log(`   - Status: ${payment.status}`);
      console.log(`   - Created: ${payment.createdAt}`);
      console.log(`   - Updated: ${payment.updatedAt}`);
      console.log(`   - Bank: ${payment.bankTransferInfo?.bankName}`);
      console.log(`   - Account Holder: ${payment.bankTransferInfo?.accountHolder}`);
      console.log(`   - Transfer Amount: ${payment.bankTransferInfo?.transferAmount}`);
    });

    // Kiểm tra xem có payment nào bị duplicate không
    const duplicateCheck = await Payment.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: {
            user: '$user',
            amount: '$amount',
            status: '$status'
          },
          count: { $sum: 1 },
          payments: { $push: '$_id' }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicateCheck.length > 0) {
      console.log(`\n⚠️ Phát hiện duplicate payments:`);
      duplicateCheck.forEach(dup => {
        console.log(`   - Amount: ${dup._id.amount}, Status: ${dup._id.status}, Count: ${dup.count}`);
        console.log(`   - Payment IDs: ${dup.payments.join(', ')}`);
      });
    } else {
      console.log(`\n✅ Không có duplicate payments`);
    }

    // Kiểm tra tất cả payments trong hệ thống
    console.log(`\n📊 TỔNG QUAN TẤT CẢ PAYMENTS:`);
    const allPayments = await Payment.find({})
      .populate('user', 'name email')
      .populate('subscriptionPlan', 'name price')
      .sort({ createdAt: -1 });

    console.log(`   - Tổng số payments: ${allPayments.length}`);
    
    allPayments.forEach((payment, index) => {
      console.log(`\n${index + 1}. ${payment.user?.name} (${payment.user?.email})`);
      console.log(`   - Payment ID: ${payment._id}`);
      console.log(`   - Plan: ${payment.subscriptionPlan?.name} (${payment.subscriptionPlan?.price} VND)`);
      console.log(`   - Amount: ${payment.amount} VND`);
      console.log(`   - Status: ${payment.status}`);
      console.log(`   - Created: ${payment.createdAt}`);
    });

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Đã ngắt kết nối MongoDB');
  }
}

investigatePaymentChanges();