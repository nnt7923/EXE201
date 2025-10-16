const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Plan = require('./models/Plan');
const Subscription = require('./models/Subscription');

const createSubscriptionForTruong = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Tìm user truongnn23790@gmail.com
    const user = await User.findOne({ email: 'truongnn23790@gmail.com' });
    if (!user) {
      console.log('❌ User truongnn23790@gmail.com not found');
      return;
    }
    console.log('👤 Found user:', user._id, user.name);

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
      subscriptionNumber: `SUB-${Date.now()}`,
      customerInfo: {
        name: user.name || 'Ngo Ngoc Truong',
        email: user.email,
        phone: '0123456789'
      },
      pricing: {
        planPrice: plan.price || 99000,
        totalAmount: plan.price || 99000
      },
      aiUsageCount: 2 // Đã sử dụng 2 lượt
    });

    await subscription.save();
    console.log('✅ Subscription created:', {
      id: subscription._id,
      user: subscription.user,
      plan: subscription.plan,
      status: subscription.status,
      paymentStatus: subscription.paymentStatus,
      endDate: subscription.endDate,
      aiUsed: subscription.aiUsageCount
    });

    // Verify subscription
    const verifySubscription = await Subscription.findById(subscription._id).populate('plan');
    console.log('🔍 Verified subscription:', {
      id: verifySubscription._id,
      planName: verifySubscription.plan.name,
      aiUsed: verifySubscription.aiUsageCount,
      status: verifySubscription.status,
      paymentStatus: verifySubscription.paymentStatus
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

createSubscriptionForTruong();