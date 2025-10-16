const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Plan = require('./models/Plan');
const Subscription = require('./models/Subscription');
const User = require('./models/User');

async function cleanSubscriptions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const userId = '68ef55e2912dcc3428322fbd';

    // Delete ALL subscriptions for this user
    console.log('\n=== DELETING ALL SUBSCRIPTIONS ===');
    const deleteResult = await Subscription.deleteMany({ user: userId });
    console.log(`Deleted ${deleteResult.deletedCount} subscriptions`);

    // Find the "Chuyên nghiệp" plan
    console.log('\n=== FINDING PLAN ===');
    const plan = await Plan.findOne({ name: 'Chuyên nghiệp' });
    if (!plan) {
      console.log('❌ Plan "Chuyên nghiệp" not found');
      return;
    }
    console.log(`✅ Found plan: ${plan.name} (ID: ${plan._id})`);

    // Create new subscription
    console.log('\n=== CREATING NEW SUBSCRIPTION ===');
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 days from now

    const newSubscription = new Subscription({
      subscriptionNumber: `SUB-${Date.now()}`,
      user: userId,
      plan: plan._id,
      customerInfo: {
        name: 'Ngô Quốc Ân',
        email: 'ngoquocan712@gmail.com',
        phone: '0123456789'
      },
      pricing: {
        planPrice: 99000,
        serviceFee: 0,
        taxes: 0,
        totalAmount: 99000
      },
      status: 'active',
      paymentStatus: 'paid',
      startDate: new Date(),
      endDate: endDate
    });

    await newSubscription.save();
    console.log(`✅ Created new subscription: ${newSubscription._id}`);

    // Verify the new subscription with populate
    console.log('\n=== VERIFYING NEW SUBSCRIPTION ===');
    const verifySubscription = await Subscription.findById(newSubscription._id).populate('plan', 'name aiSuggestionLimit features');
    
    if (verifySubscription && verifySubscription.plan) {
      console.log('✅ Subscription verified:');
      console.log(`  ID: ${verifySubscription._id}`);
      console.log(`  User: ${verifySubscription.user}`);
      console.log(`  Plan: ${verifySubscription.plan.name}`);
      console.log(`  AI Suggestion Limit: ${verifySubscription.plan.aiSuggestionLimit}`);
      console.log(`  Status: ${verifySubscription.status}`);
      console.log(`  Payment Status: ${verifySubscription.paymentStatus}`);
      console.log(`  End Date: ${verifySubscription.endDate}`);
    } else {
      console.log('❌ Failed to verify subscription');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

cleanSubscriptions();