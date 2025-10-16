const mongoose = require('mongoose');
const Subscription = require('./models/Subscription');
const Plan = require('./models/Plan');

// Load environment variables
require('dotenv').config();

async function checkAllSubscriptions() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find ALL subscriptions in database
    console.log('\n📋 Finding ALL subscriptions in database...');
    const allSubscriptions = await Subscription.find({}).populate('plan');
    
    console.log(`📊 Total subscriptions found: ${allSubscriptions.length}`);
    
    allSubscriptions.forEach((sub, index) => {
      console.log(`\n--- Subscription ${index + 1} ---`);
      console.log(`ID: ${sub._id}`);
      console.log(`User: ${sub.user}`);
      console.log(`Plan: ${sub.plan ? sub.plan._id : 'null'}`);
      console.log(`Plan Name: ${sub.plan ? sub.plan.name : 'null'}`);
      console.log(`Status: ${sub.status}`);
      console.log(`Payment Status: ${sub.paymentStatus}`);
      console.log(`Created: ${sub.createdAt}`);
      console.log(`End Date: ${sub.endDate}`);
    });

    // Find subscriptions for specific user
    console.log('\n🔍 Finding subscriptions for user 68ef55e2912dcc3428322fbd...');
    const userSubscriptions = await Subscription.find({ 
      user: '68ef55e2912dcc3428322fbd' 
    }).populate('plan');
    
    console.log(`📊 User subscriptions found: ${userSubscriptions.length}`);
    
    userSubscriptions.forEach((sub, index) => {
      console.log(`\n--- User Subscription ${index + 1} ---`);
      console.log(`ID: ${sub._id}`);
      console.log(`Plan: ${sub.plan ? sub.plan._id : 'null'}`);
      console.log(`Plan Name: ${sub.plan ? sub.plan.name : 'null'}`);
      console.log(`Status: ${sub.status}`);
      console.log(`Payment Status: ${sub.paymentStatus}`);
      console.log(`AI Suggestion Limit: ${sub.plan ? sub.plan.aiSuggestionLimit : 'null'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkAllSubscriptions();