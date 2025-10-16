const mongoose = require('mongoose');
const User = require('./models/User');
const Plan = require('./models/Plan');
const Subscription = require('./models/Subscription');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/an-gi-o-dau', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createSubscriptionForUser() {
  try {
    console.log('✅ Connected to MongoDB');

    // Tìm user
    const user = await User.findOne({ email: 'truongnn23790@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    console.log('👤 Found user:', user.email);

    // Tạo hoặc tìm plan Premium
    let plan = await Plan.findOne({ name: 'Premium' });
    if (!plan) {
      plan = new Plan({
        name: 'Premium',
        description: 'Gói Premium với đầy đủ tính năng AI',
        price: 299000,
        duration: 30,
        features: ['AI suggestions', 'Unlimited itineraries', 'Priority support'],
        aiSuggestionLimit: 100,
        isActive: true
      });
      await plan.save();
      console.log('📦 Created Premium plan');
    } else {
      console.log('📦 Found existing Premium plan');
    }

    // Tạo subscription với tất cả các trường bắt buộc
    const subscription = new Subscription({
      subscriptionNumber: `SUB-${Date.now()}`,
      user: user._id,
      plan: plan._id,
      customerInfo: {
        name: user.name,
        email: user.email,
        phone: user.phone || '0123456789' // Số điện thoại mặc định nếu không có
      },
      pricing: {
        planPrice: plan.price,
        totalAmount: plan.price
      },
      status: 'active',
      paymentStatus: 'paid', // Quan trọng: đặt trạng thái đã thanh toán
      paymentMethod: 'bank_transfer',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 ngày
    });

    await subscription.save();
    console.log('✅ Created subscription successfully');
    console.log('💰 Payment status:', subscription.paymentStatus);
    console.log('📅 Valid until:', subscription.endDate);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

createSubscriptionForUser();