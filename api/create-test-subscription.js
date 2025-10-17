const mongoose = require('mongoose');
const User = require('./models/User');
const Plan = require('./models/Plan');
const Subscription = require('./models/Subscription');
require('dotenv').config();

// Kết nối database từ .env
mongoose.connect(process.env.MONGODB_URI);

async function createTestSubscription() {
  try {
    console.log('🔌 Đã kết nối database');

    // Tìm user test
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('❌ Không tìm thấy user test');
      return;
    }
    console.log('👤 Tìm thấy user test:', testUser.name);

    // Tìm plan Premium
    let premiumPlan = await Plan.findOne({ name: 'Premium' });
    if (!premiumPlan) {
      console.log('📦 Tạo plan Premium...');
      premiumPlan = new Plan({
        name: 'Premium',
        price: 99000,
        duration: 30, // 30 ngày
        aiSuggestionsLimit: 100,
        features: ['AI suggestions', 'Premium support'],
        isActive: true
      });
      await premiumPlan.save();
      console.log('✅ Đã tạo plan Premium');
    } else {
      console.log('📦 Tìm thấy plan Premium:', premiumPlan.name);
    }

    // Kiểm tra subscription hiện tại
    const existingSubscription = await Subscription.findOne({ user: testUser._id });
    if (existingSubscription) {
      console.log('💳 User đã có subscription, đang cập nhật...');
      
      // Cập nhật subscription
      existingSubscription.plan = premiumPlan._id;
      existingSubscription.status = 'active';
      existingSubscription.paymentStatus = 'paid';
      existingSubscription.startDate = new Date();
      existingSubscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 ngày
      await existingSubscription.save();
      
      console.log('✅ Đã cập nhật subscription');
    } else {
      console.log('💳 Tạo subscription mới...');
      
      // Tạo subscription mới
      const newSubscription = new Subscription({
        user: testUser._id,
        plan: premiumPlan._id,
        subscriptionNumber: `SUB${Date.now()}`,
        customerInfo: {
          name: testUser.name,
          email: testUser.email,
          phone: '0123456789'
        },
        pricing: {
          planPrice: premiumPlan.price,
          serviceFee: 0,
          taxes: 0,
          totalAmount: premiumPlan.price
        },
        status: 'active',
        paymentStatus: 'paid',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 ngày
      });
      
      await newSubscription.save();
      console.log('✅ Đã tạo subscription mới');
    }

    // Cập nhật user với subscription info
    testUser.subscriptionPlan = premiumPlan._id;
    testUser.subscriptionStatus = 'active';
    testUser.subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    testUser.aiSuggestionsUsed = 0;
    await testUser.save();

    console.log('✅ Đã cập nhật thông tin subscription cho user');
    console.log('📧 Email:', testUser.email);
    console.log('📦 Plan:', premiumPlan.name);
    console.log('📅 End Date:', testUser.subscriptionEndDate);

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối database');
  }
}

createTestSubscription();