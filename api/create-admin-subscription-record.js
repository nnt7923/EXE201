const mongoose = require('mongoose');
const User = require('./models/User');
const Plan = require('./models/Plan');
const Subscription = require('./models/Subscription');
require('dotenv').config();

async function createAdminSubscriptionRecord() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Find admin user
    console.log('\n👤 Finding admin user...');
    const adminUser = await User.findOne({ email: 'admin@example.com' }).populate('subscriptionPlan');
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    console.log('✅ Admin user found:', adminUser.email);
    console.log('Current subscription plan:', adminUser.subscriptionPlan?.name);

    // 2. Check if subscription record already exists
    console.log('\n🔍 Checking existing subscription records...');
    const existingSubscription = await Subscription.findOne({ user: adminUser._id });
    if (existingSubscription) {
      console.log('✅ Subscription record already exists');
      console.log('- Status:', existingSubscription.status);
      console.log('- Payment Status:', existingSubscription.paymentStatus);
      console.log('- End Date:', existingSubscription.endDate);
      return;
    }

    // 3. Create subscription record
    console.log('\n📝 Creating subscription record...');
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1); // 1 year from now

    // Generate subscription number
    const subscriptionNumber = `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const newSubscription = await Subscription.create({
      subscriptionNumber: subscriptionNumber,
      user: adminUser._id,
      plan: adminUser.subscriptionPlan._id,
      status: 'active',
      paymentStatus: 'paid',
      startDate: new Date(),
      endDate: subscriptionEndDate,
      aiUsageCount: 0,
      customerInfo: {
        name: adminUser.name,
        email: adminUser.email,
        phone: '0123456789'
      },
      pricing: {
        planPrice: adminUser.subscriptionPlan.price || 0,
        serviceFee: 0,
        taxes: 0,
        totalAmount: adminUser.subscriptionPlan.price || 0
      },
      paymentMethod: 'bank_transfer',
      notes: {
        adminNotes: 'Admin subscription setup',
        customerNotes: 'Admin subscription setup'
      }
    });

    console.log('✅ Subscription record created successfully');
    console.log('Subscription details:');
    console.log('- ID:', newSubscription._id);
    console.log('- User:', adminUser.email);
    console.log('- Plan:', adminUser.subscriptionPlan.name);
    console.log('- Status:', newSubscription.status);
    console.log('- Payment Status:', newSubscription.paymentStatus);
    console.log('- End Date:', newSubscription.endDate.toISOString().split('T')[0]);

    // 4. Verify the subscription works with checkAiAccess
    console.log('\n🔍 Verifying subscription with AI access check...');
    const verifySubscription = await Subscription.findOne({
      user: adminUser._id,
      status: 'active',
      paymentStatus: 'paid',
      endDate: { $gt: new Date() }
    }).populate('plan');

    if (verifySubscription) {
      console.log('✅ Subscription verification successful');
      console.log('- Plan name:', verifySubscription.plan.name);
      console.log('- AI Limit:', verifySubscription.plan.aiSuggestionLimit);
      console.log('- AI Usage:', verifySubscription.aiUsageCount || 0);
      console.log('- Remaining:', verifySubscription.plan.aiSuggestionLimit - (verifySubscription.aiUsageCount || 0));
    } else {
      console.log('❌ Subscription verification failed');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createAdminSubscriptionRecord();