const mongoose = require('mongoose');
const User = require('./models/User');
const Payment = require('./models/Payment');
require('dotenv').config();

async function checkUser() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công');

    const email = 'ngoquocan712@gmail.com';
    
    // Tìm user
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log(`❌ Không tìm thấy user với email: ${email}`);
      return;
    }
    
    console.log(`✅ Tìm thấy user:`);
    console.log(`- ID: ${user._id}`);
    console.log(`- Name: ${user.name}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Role: ${user.role}`);
    console.log(`- Subscription Status: ${user.subscriptionStatus || 'N/A'}`);
    console.log(`- Payment Status: ${user.paymentStatus || 'N/A'}`);
    console.log(`- Subscription Plan: ${user.subscriptionPlan || 'N/A'}`);
    console.log(`- Subscription End Date: ${user.subscriptionEndDate || 'N/A'}`);
    console.log(`- Created At: ${user.createdAt}`);
    
    // Tìm payments của user này
    const payments = await Payment.find({ user: user._id }).sort({ createdAt: -1 });
    
    console.log(`\n💰 Payments của user (${payments.length} records):`);
    if (payments.length === 0) {
      console.log('❌ Không có payment records nào');
    } else {
      payments.forEach((payment, index) => {
        console.log(`\n${index + 1}. Payment ID: ${payment._id}`);
        console.log(`   - Amount: ${payment.amount}`);
        console.log(`   - Status: ${payment.status}`);
        console.log(`   - Method: ${payment.method}`);
        console.log(`   - Plan ID: ${payment.planId}`);
        console.log(`   - Created At: ${payment.createdAt}`);
        console.log(`   - Updated At: ${payment.updatedAt}`);
        if (payment.bankTransferDetails) {
          console.log(`   - Bank Transfer Details:`);
          console.log(`     * Bank: ${payment.bankTransferDetails.bankName}`);
          console.log(`     * Account: ${payment.bankTransferDetails.accountNumber}`);
          console.log(`     * Transfer Date: ${payment.bankTransferDetails.transferDate}`);
          console.log(`     * Transfer Amount: ${payment.bankTransferDetails.transferAmount}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Đã ngắt kết nối MongoDB');
  }
}

checkUser();