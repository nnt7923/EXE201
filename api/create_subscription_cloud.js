const mongoose = require('mongoose');
const User = require('./models/User');
const Plan = require('./models/Plan');
const Subscription = require('./models/Subscription');
require('dotenv').config();

// Kết nối MongoDB Cloud
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau';
console.log('🔗 Connecting to:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createSubscriptionOnCloud() {
  try {
    console.log('✅ Connected to MongoDB Cloud');

    // Tìm user
    const user = await User.findOne({ email: 'truongnn23790@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    console.log('👤 User found:', user.email);

    // Tìm hoặc tạo plan Premium
    let plan = await Plan.findOne({ name: 'Premium' });
    if (!plan) {
      console.log('📦 Creating Premium plan...');
      plan = new Plan({
        name: 'Premium',
        description: 'Premium plan with AI features',
        price: 99000,
        features: ['AI suggestions', 'Unlimited itineraries', 'Priority support'],
        aiSuggestionLimit: 100,
        isActive: true
      });
      await plan.save();
      console.log('✅ Premium plan created');
    } else {
      console.log('📦 Premium plan found:', plan.name);
    }

    // Kiểm tra subscription hiện tại
    const existingSub = await Subscription.findOne({ user: user._id });
    if (existingSub) {
      console.log('📋 Existing subscription found:', existingSub.status);
      console.log('- Plan:', existingSub.plan);
      console.log('- Payment Status:', existingSub.paymentStatus);
      console.log('- Start Date:', existingSub.startDate);
      console.log('- End Date:', existingSub.endDate);
      return;
    }

    // Tạo subscription mới
    console.log('🆕 Creating new subscription...');
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30); // 30 ngày

    const subscription = new Subscription({
      subscriptionNumber: `SUB-${Date.now()}`,
      user: user._id,
      plan: plan._id,
      customerInfo: {
        name: user.name,
        email: user.email,
        phone: '0123456789' // Default phone
      },
      pricing: {
        planPrice: plan.price,
        serviceFee: 0,
        taxes: 0,
        totalAmount: plan.price
      },
      status: 'active',
      paymentStatus: 'paid',
      startDate: startDate,
      endDate: endDate
    });

    await subscription.save();
    console.log('✅ Subscription created successfully:');
    console.log('- User:', user.email);
    console.log('- Plan:', plan.name);
    console.log('- Status:', subscription.status);
    console.log('- Payment Status:', subscription.paymentStatus);
    console.log('- Start Date:', subscription.startDate);
    console.log('- End Date:', subscription.endDate);
    console.log('- AI Limit:', plan.aiSuggestionLimit);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

createSubscriptionOnCloud();