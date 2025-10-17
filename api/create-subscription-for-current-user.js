const mongoose = require('mongoose');
const User = require('./models/User');
const Plan = require('./models/Plan');
const Subscription = require('./models/Subscription');
require('dotenv').config();

// Kết nối database từ .env
mongoose.connect(process.env.MONGODB_URI);

async function createSubscriptionForCurrentUser() {
  try {
    console.log('🔌 Đã kết nối database');

    // Tìm user hiện tại
    const currentUser = await User.findOne({ email: 'ngoquocan712@gmail.com' });
    if (!currentUser) {
      console.log('❌ Không tìm thấy user hiện tại');
      return;
    }
    console.log('👤 Tìm thấy user hiện tại:', currentUser.name);

    // Tìm plan Premium
    let premiumPlan = await Plan.findOne({ name: 'Premium' });
    if (!premiumPlan) {
      console.log('📦 Tạo plan Premium...');
      premiumPlan = new Plan({
        name: 'Premium',
        price: 99000,
        duration: 30,
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
    const existingSubscription = await Subscription.findOne({ user: currentUser._id });
    if (existingSubscription) {
      console.log('💳 User đã có subscription, đang cập nhật...');
      
      existingSubscription.plan = premiumPlan._id;
      existingSubscription.status = 'active';
      existingSubscription.paymentStatus = 'paid';
      existingSubscription.startDate = new Date();
      existingSubscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await existingSubscription.save();
      
      console.log('✅ Đã cập nhật subscription');
    } else {
      console.log('💳 Tạo subscription mới...');
      
      const newSubscription = new Subscription({
        user: currentUser._id,
        plan: premiumPlan._id,
        subscriptionNumber: `SUB${Date.now()}`,
        customerInfo: {
          name: currentUser.name,
          email: currentUser.email,
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
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      
      await newSubscription.save();
      console.log('✅ Đã tạo subscription mới');
    }

    // Cập nhật user với subscription info
    currentUser.subscriptionPlan = premiumPlan._id;
    currentUser.subscriptionStatus = 'active';
    currentUser.subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    currentUser.aiSuggestionsUsed = 0;
    await currentUser.save();

    console.log('✅ Đã cập nhật thông tin subscription cho user');
    console.log('📧 Email:', currentUser.email);
    console.log('📦 Plan:', premiumPlan.name);
    console.log('📅 End Date:', currentUser.subscriptionEndDate);

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối database');
  }
}

createSubscriptionForCurrentUser();