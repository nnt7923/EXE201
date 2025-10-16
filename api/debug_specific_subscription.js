const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Plan = require('./models/Plan');
const Subscription = require('./models/Subscription');

async function debugSpecificSubscription() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check the specific subscription
    const subscriptionId = '68f0bc2318b71411685acc1a';
    console.log(`\n=== SUBSCRIPTION ${subscriptionId} ===`);
    
    const subscription = await Subscription.findById(subscriptionId);
    if (subscription) {
      console.log('Subscription found:');
      console.log(`  ID: ${subscription._id}`);
      console.log(`  User: ${subscription.user}`);
      console.log(`  Plan ID: ${subscription.plan}`);
      console.log(`  Status: ${subscription.status}`);
      console.log(`  Payment Status: ${subscription.paymentStatus}`);
      console.log(`  End Date: ${subscription.endDate}`);

      // Check if plan exists
      if (subscription.plan) {
        console.log('\n=== CHECKING PLAN ===');
        const plan = await Plan.findById(subscription.plan);
        if (plan) {
          console.log('Plan found:');
          console.log(`  ID: ${plan._id}`);
          console.log(`  Name: ${plan.name}`);
          console.log(`  AI Suggestion Limit: ${plan.aiSuggestionLimit}`);
        } else {
          console.log('❌ Plan not found with ID:', subscription.plan);
        }

        // Try populate
        console.log('\n=== TRYING POPULATE ===');
        const populatedSubscription = await Subscription.findById(subscriptionId).populate('plan');
        console.log('Populated plan:', populatedSubscription.plan);
      } else {
        console.log('❌ Subscription has no plan ID');
      }
    } else {
      console.log('❌ Subscription not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

debugSpecificSubscription();