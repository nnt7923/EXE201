const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

async function forceDeleteSubscription() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau');
    console.log('✅ Connected to MongoDB');

    // Get the subscriptions collection directly
    const db = mongoose.connection.db;
    const subscriptionsCollection = db.collection('subscriptions');

    // Find all subscriptions for the user
    console.log('\n🔍 Finding all subscriptions for user 68ef55e2912dcc3428322fbd...');
    const userSubscriptions = await subscriptionsCollection.find({ 
      user: new mongoose.Types.ObjectId('68ef55e2912dcc3428322fbd')
    }).toArray();
    
    console.log(`📊 User subscriptions found: ${userSubscriptions.length}`);
    
    userSubscriptions.forEach((sub, index) => {
      console.log(`\n--- User Subscription ${index + 1} ---`);
      console.log(`ID: ${sub._id}`);
      console.log(`Plan: ${sub.plan}`);
      console.log(`Status: ${sub.status}`);
      console.log(`Payment Status: ${sub.paymentStatus}`);
      console.log(`End Date: ${sub.endDate}`);
    });

    // Force delete the specific old subscription
    const oldSubscriptionId = '68f0bc2318b71411685acc1a';
    console.log(`\n🗑️ Force deleting old subscription: ${oldSubscriptionId}`);
    
    const deleteResult = await subscriptionsCollection.deleteOne({
      _id: new mongoose.Types.ObjectId(oldSubscriptionId)
    });
    
    console.log(`Delete result: ${JSON.stringify(deleteResult)}`);
    
    if (deleteResult.deletedCount > 0) {
      console.log('✅ Old subscription deleted successfully');
    } else {
      console.log('❌ Old subscription not found for deletion');
    }

    // Verify subscriptions after deletion
    console.log('\n🔍 Checking subscriptions after deletion...');
    const remainingSubscriptions = await subscriptionsCollection.find({ 
      user: new mongoose.Types.ObjectId('68ef55e2912dcc3428322fbd')
    }).toArray();
    
    console.log(`📊 Remaining user subscriptions: ${remainingSubscriptions.length}`);
    
    remainingSubscriptions.forEach((sub, index) => {
      console.log(`\n--- Remaining Subscription ${index + 1} ---`);
      console.log(`ID: ${sub._id}`);
      console.log(`Plan: ${sub.plan}`);
      console.log(`Status: ${sub.status}`);
      console.log(`Payment Status: ${sub.paymentStatus}`);
    });

    // Also check ALL subscriptions in the database
    console.log('\n🔍 Checking ALL subscriptions in database...');
    const allSubscriptions = await subscriptionsCollection.find({}).toArray();
    
    console.log(`📊 Total subscriptions in database: ${allSubscriptions.length}`);
    
    allSubscriptions.forEach((sub, index) => {
      console.log(`${index + 1}. ID: ${sub._id}, User: ${sub.user}, Status: ${sub.status}, Plan: ${sub.plan}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

forceDeleteSubscription();