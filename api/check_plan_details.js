const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Plan = require('./models/Plan');
const Subscription = require('./models/Subscription');

async function checkPlanDetails() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check all plans
    console.log('\n=== ALL PLANS ===');
    const allPlans = await Plan.find({});
    console.log('Total plans found:', allPlans.length);
    
    allPlans.forEach(plan => {
      console.log(`Plan: ${plan.name}`);
      console.log(`  ID: ${plan._id}`);
      console.log(`  AI Suggestion Limit: ${plan.aiSuggestionLimit}`);
      console.log(`  Features: ${JSON.stringify(plan.features)}`);
      console.log('---');
    });

    // Check the specific subscription
    console.log('\n=== SUBSCRIPTION DETAILS ===');
    const subscription = await Subscription.findOne({
      user: '68ef55e2912dcc3428322fbd',
      status: 'active',
      paymentStatus: 'paid',
      endDate: { $gt: new Date() }
    });

    if (subscription) {
      console.log('Subscription found:');
      console.log(`  ID: ${subscription._id}`);
      console.log(`  User: ${subscription.user}`);
      console.log(`  Plan ID: ${subscription.plan}`);
      console.log(`  Status: ${subscription.status}`);
      console.log(`  Payment Status: ${subscription.paymentStatus}`);
      console.log(`  End Date: ${subscription.endDate}`);

      // Try to populate plan
      console.log('\n=== POPULATED SUBSCRIPTION ===');
      const populatedSubscription = await Subscription.findById(subscription._id).populate('plan', 'name aiSuggestionLimit features');
      
      if (populatedSubscription) {
        console.log('Populated subscription:');
        console.log(`  Plan: ${populatedSubscription.plan}`);
        if (populatedSubscription.plan) {
          console.log(`  Plan Name: ${populatedSubscription.plan.name}`);
          console.log(`  AI Suggestion Limit: ${populatedSubscription.plan.aiSuggestionLimit}`);
          console.log(`  Features: ${JSON.stringify(populatedSubscription.plan.features)}`);
        } else {
          console.log('  ❌ Plan is null after population!');
        }
      }
    } else {
      console.log('❌ No subscription found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

checkPlanDetails();