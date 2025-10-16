const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Plan = require('./models/Plan');
const Subscription = require('./models/Subscription');

const createTestSubscription = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Tìm user test
    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }
    console.log('👤 Found test user:', user._id);

    // Tìm plan "Chuyên nghiệp"
    const plan = await Plan.findOne({ name: 'Chuyên nghiệp' });
    if (!plan) {
      console.log('❌ Plan "Chuyên nghiệp" not found');
      return;
    }
    console.log('📋 Found plan:', plan.name, 'AI Limit:', plan.aiSuggestionLimit);

    // Xóa subscription cũ nếu có
    await Subscription.deleteMany({ user: user._id });
    console.log('🗑️ Deleted old subscriptions');

    // Tạo subscription mới
    const subscription = new Subscription({
      user: user._id,
      plan: plan._id,
      status: 'active',
      paymentStatus: 'paid',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
      subscriptionNumber: `SUB-TEST-${Date.now()}`,
      customerInfo: {
        name: user.name,
        email: user.email,
        phone: '0123456789',
        address: 'Test Address'
      },
      pricing: {
        planPrice: plan.price,
        serviceFee: 0,
        taxes: 0,
        totalAmount: plan.price
      }
    });

    await subscription.save();
    console.log('✅ Test subscription created:', {
      id: subscription._id,
      user: subscription.user,
      plan: subscription.plan,
      status: subscription.status,
      paymentStatus: subscription.paymentStatus,
      endDate: subscription.endDate
    });

    // Verify subscription với populate
    const verifySubscription = await Subscription.findById(subscription._id).populate('plan');
    console.log('🔍 Verified subscription:', {
      id: verifySubscription._id,
      planName: verifySubscription.plan.name,
      aiLimit: verifySubscription.plan.aiSuggestionLimit,
      status: verifySubscription.status,
      paymentStatus: verifySubscription.paymentStatus
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createTestSubscription();