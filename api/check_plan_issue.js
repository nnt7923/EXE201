const mongoose = require('mongoose');
const Subscription = require('./models/Subscription');
const Plan = require('./models/Plan');

// Load environment variables
require('dotenv').config();

async function checkPlanIssue() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau');
    console.log('✅ Connected to MongoDB');

    // Check the specific subscription
    const subscriptionId = '68f0bc2318b71411685acc1a';
    console.log(`\n🔍 Checking subscription: ${subscriptionId}`);
    
    const subscription = await Subscription.findById(subscriptionId);
    if (subscription) {
      console.log('📋 Subscription found:');
      console.log(`  ID: ${subscription._id}`);
      console.log(`  User: ${subscription.user}`);
      console.log(`  Plan ID: ${subscription.plan}`);
      console.log(`  Status: ${subscription.status}`);
      console.log(`  Payment Status: ${subscription.paymentStatus}`);
      console.log(`  End Date: ${subscription.endDate}`);
      
      // Check if the plan exists
      const planId = subscription.plan;
      console.log(`\n🔍 Checking plan: ${planId}`);
      
      const plan = await Plan.findById(planId);
      if (plan) {
        console.log('📋 Plan found:');
        console.log(`  ID: ${plan._id}`);
        console.log(`  Name: ${plan.name}`);
        console.log(`  AI Suggestion Limit: ${plan.aiSuggestionLimit}`);
      } else {
        console.log('❌ Plan NOT found! This is the issue.');
        
        // List all available plans
        console.log('\n📋 Available plans:');
        const allPlans = await Plan.find({});
        allPlans.forEach((p, index) => {
          console.log(`  ${index + 1}. ID: ${p._id}, Name: ${p.name}, AI Limit: ${p.aiSuggestionLimit}`);
        });
        
        // Update subscription to use a valid plan
        if (allPlans.length > 0) {
          const validPlan = allPlans.find(p => p.name === 'Chuyên nghiệp') || allPlans[0];
          console.log(`\n🔧 Updating subscription to use plan: ${validPlan.name} (${validPlan._id})`);
          
          await Subscription.findByIdAndUpdate(subscriptionId, {
            plan: validPlan._id
          });
          
          console.log('✅ Subscription updated successfully');
        }
      }
    } else {
      console.log('❌ Subscription not found');
    }

    // Also check all subscriptions for the user
    console.log('\n🔍 All subscriptions for user 68ef55e2912dcc3428322fbd:');
    const userSubscriptions = await Subscription.find({ 
      user: '68ef55e2912dcc3428322fbd' 
    }).populate('plan');
    
    userSubscriptions.forEach((sub, index) => {
      console.log(`\n--- Subscription ${index + 1} ---`);
      console.log(`ID: ${sub._id}`);
      console.log(`Plan: ${sub.plan ? sub.plan._id : 'null'}`);
      console.log(`Plan Name: ${sub.plan ? sub.plan.name : 'null'}`);
      console.log(`AI Limit: ${sub.plan ? sub.plan.aiSuggestionLimit : 'null'}`);
      console.log(`Status: ${sub.status}`);
      console.log(`Payment Status: ${sub.paymentStatus}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkPlanIssue();