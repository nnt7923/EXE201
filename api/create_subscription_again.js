const mongoose = require('mongoose');
const User = require('./models/User');
const Plan = require('./models/Plan');
const Subscription = require('./models/Subscription');

async function createSubscriptionAgain() {
  try {
    await mongoose.connect('mongodb://localhost:27017/an-gi-o-dau-platform');
    console.log('✅ Connected to MongoDB');

    // Find user
    const user = await User.findOne({ email: 'ngoquocan712@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    console.log('✅ User found:', user.name);

    // Find plan
    const plan = await Plan.findOne({ name: 'Chuyên nghiệp' });
    if (!plan) {
      console.log('❌ Plan not found');
      return;
    }
    console.log('✅ Plan found:', plan.name, 'AI Limit:', plan.aiSuggestionLimit);

    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({ user: user._id });
    if (existingSubscription) {
      console.log('⚠️ Subscription already exists, deleting it first...');
      await Subscription.deleteOne({ _id: existingSubscription._id });
    }

    // Create new subscription
    const subscription = new Subscription({
      subscriptionNumber: 'SUB-' + Date.now(),
      user: user._id,
      plan: plan._id,
      customerInfo: {
        name: user.name,
        email: user.email,
        phone: '0123456789'
      },
      pricing: {
        planPrice: plan.price,
        totalAmount: plan.price
      },
      status: 'active',
      paymentStatus: 'paid',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    await subscription.save();
    console.log('✅ Subscription created successfully!');
    console.log('Subscription ID:', subscription._id);
    console.log('Status:', subscription.status);
    console.log('Payment Status:', subscription.paymentStatus);
    console.log('End Date:', subscription.endDate);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createSubscriptionAgain();