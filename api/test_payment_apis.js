const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const User = require('./models/User');
const SubscriptionPlan = require('./models/SubscriptionPlan');
require('dotenv').config();

async function testPaymentAPIs() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công');

    console.log('\n🔍 KIỂM TRA TOÀN BỘ PAYMENT APIs');
    console.log('='.repeat(50));

    // 1. Kiểm tra data integrity
    console.log('\n1️⃣ KIỂM TRA DATA INTEGRITY');
    console.log('-'.repeat(30));
    
    const allPayments = await Payment.find({});
    console.log(`📊 Tổng số payments: ${allPayments.length}`);
    
    let validPayments = 0;
    let invalidPayments = 0;
    
    for (const payment of allPayments) {
      // Kiểm tra user reference
      const user = await User.findById(payment.user);
      const plan = await SubscriptionPlan.findById(payment.subscriptionPlan);
      
      if (user && plan) {
        validPayments++;
      } else {
        invalidPayments++;
        console.log(`❌ Invalid payment: ${payment._id}`);
        console.log(`   - User exists: ${!!user}`);
        console.log(`   - Plan exists: ${!!plan}`);
      }
    }
    
    console.log(`✅ Valid payments: ${validPayments}`);
    console.log(`❌ Invalid payments: ${invalidPayments}`);

    // 2. Test admin pending payments query
    console.log('\n2️⃣ TEST ADMIN PENDING PAYMENTS QUERY');
    console.log('-'.repeat(30));
    
    const pendingPayments = await Payment.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('subscriptionPlan', 'name price durationInDays')
      .sort({ createdAt: -1 });

    console.log(`📊 Pending payments: ${pendingPayments.length}`);
    
    if (pendingPayments.length > 0) {
      console.log('📋 Chi tiết pending payments:');
      pendingPayments.forEach((payment, index) => {
        console.log(`${index + 1}. ${payment.user?.name} (${payment.user?.email})`);
        console.log(`   - Plan: ${payment.subscriptionPlan?.name} - ${payment.subscriptionPlan?.price} VND`);
        console.log(`   - Amount: ${payment.amount} VND`);
        console.log(`   - Status: ${payment.status}`);
        console.log(`   - Created: ${payment.createdAt}`);
        console.log(`   - Bank: ${payment.bankTransferInfo?.bankName}`);
        console.log(`   - Proof: ${payment.proofOfPayment ? 'Yes' : 'No'}`);
      });
    }

    // 3. Test confirmed payments
    console.log('\n3️⃣ TEST CONFIRMED PAYMENTS');
    console.log('-'.repeat(30));
    
    const confirmedPayments = await Payment.find({ status: 'confirmed' })
      .populate('user', 'name email')
      .populate('subscriptionPlan', 'name price')
      .populate('confirmedBy', 'name email')
      .sort({ confirmedAt: -1 });

    console.log(`📊 Confirmed payments: ${confirmedPayments.length}`);
    
    if (confirmedPayments.length > 0) {
      console.log('📋 Chi tiết confirmed payments:');
      confirmedPayments.slice(0, 3).forEach((payment, index) => {
        console.log(`${index + 1}. ${payment.user?.name} (${payment.user?.email})`);
        console.log(`   - Plan: ${payment.subscriptionPlan?.name}`);
        console.log(`   - Confirmed by: ${payment.confirmedBy?.name || 'N/A'}`);
        console.log(`   - Confirmed at: ${payment.confirmedAt || 'N/A'}`);
      });
    }

    // 4. Test rejected payments
    console.log('\n4️⃣ TEST REJECTED PAYMENTS');
    console.log('-'.repeat(30));
    
    const rejectedPayments = await Payment.find({ status: 'rejected' })
      .populate('user', 'name email')
      .populate('subscriptionPlan', 'name price')
      .sort({ rejectedAt: -1 });

    console.log(`📊 Rejected payments: ${rejectedPayments.length}`);

    // 5. Kiểm tra subscription plans
    console.log('\n5️⃣ KIỂM TRA SUBSCRIPTION PLANS');
    console.log('-'.repeat(30));
    
    const plans = await SubscriptionPlan.find({ isActive: true });
    console.log(`📊 Active plans: ${plans.length}`);
    
    plans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.name}`);
      console.log(`   - Price: ${plan.price} VND`);
      console.log(`   - Duration: ${plan.durationInDays} days`);
      console.log(`   - AI Limit: ${plan.aiSuggestionLimit === -1 ? 'Unlimited' : plan.aiSuggestionLimit}`);
    });

    // 6. Kiểm tra users với pending_payment status
    console.log('\n6️⃣ KIỂM TRA USERS VỚI PENDING_PAYMENT STATUS');
    console.log('-'.repeat(30));
    
    const pendingUsers = await User.find({ subscriptionStatus: 'pending_payment' })
      .select('name email subscriptionStatus subscriptionPlan createdAt');
    
    console.log(`📊 Users với pending_payment: ${pendingUsers.length}`);
    
    if (pendingUsers.length > 0) {
      console.log('📋 Chi tiết pending users:');
      for (const user of pendingUsers) {
        const userPayment = await Payment.findOne({ user: user._id, status: 'pending' });
        console.log(`- ${user.name} (${user.email})`);
        console.log(`  Status: ${user.subscriptionStatus}`);
        console.log(`  Has pending payment: ${userPayment ? 'Yes' : 'No'}`);
        if (userPayment) {
          console.log(`  Payment amount: ${userPayment.amount} VND`);
        }
      }
    }

    // 7. Kiểm tra payment statistics
    console.log('\n7️⃣ PAYMENT STATISTICS');
    console.log('-'.repeat(30));
    
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    console.log('📊 Payment statistics by status:');
    stats.forEach(stat => {
      console.log(`- ${stat._id}: ${stat.count} payments, ${stat.totalAmount.toLocaleString()} VND`);
    });

    console.log('\n✅ KIỂM TRA HOÀN TẤT');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Đã ngắt kết nối MongoDB');
  }
}

testPaymentAPIs();