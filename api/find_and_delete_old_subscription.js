const mongoose = require('mongoose');
const Subscription = require('./models/Subscription');
const Plan = require('./models/Plan');

// Load environment variables
require('dotenv').config();

async function findAndDeleteOldSubscription() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log('🔗 Using MONGODB_URI:', process.env.MONGODB_URI ? 'Cloud database' : 'Local fallback');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau');
    console.log('✅ Connected to MongoDB');

    // Find ALL subscriptions for the user
    console.log('\n🔍 Finding all subscriptions for user 68ef55e2912dcc3428322fbd...');
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
      console.log(`End Date: ${sub.endDate}`);
    });

    // Delete the specific old subscription
    const oldSubscriptionId = '68f0bc2318b71411685acc1a';
    console.log(`\n🗑️ Deleting old subscription: ${oldSubscriptionId}`);
    
    const deleteResult = await Subscription.findByIdAndDelete(oldSubscriptionId);
    
    if (deleteResult) {
      console.log('✅ Old subscription deleted successfully');
    } else {
      console.log('❌ Old subscription not found for deletion');
    }

    // Verify subscriptions after deletion
    console.log('\n🔍 Checking subscriptions after deletion...');
    const remainingSubscriptions = await Subscription.find({ 
      user: '68ef55e2912dcc3428322fbd' 
    }).populate('plan');
    
    console.log(`📊 Remaining user subscriptions: ${remainingSubscriptions.length}`);
    
    remainingSubscriptions.forEach((sub, index) => {
      console.log(`\n--- Remaining Subscription ${index + 1} ---`);
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

findAndDeleteOldSubscription();