const mongoose = require('mongoose');
const Subscription = require('./models/Subscription');
const Plan = require('./models/Plan');
const User = require('./models/User');
require('dotenv').config();

async function checkSubscriptions() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check existing subscriptions
    const subscriptions = await Subscription.find({})
      .populate('user', 'name email')
      .populate('plan', 'name price')
      .sort({ createdAt: -1 });
    
    console.log(`📊 Found ${subscriptions.length} subscriptions in database`);
    
    if (subscriptions.length > 0) {
      console.log('📋 Existing subscriptions:');
      subscriptions.forEach((sub, index) => {
        console.log(`  ${index + 1}. ${sub.subscriptionNumber || sub._id}`);
        console.log(`     - User: ${sub.user ? sub.user.name : 'No user'}`);
        console.log(`     - Plan: ${sub.plan ? sub.plan.name : 'No plan'}`);
        console.log(`     - Status: ${sub.status}`);
        console.log(`     - Payment Status: ${sub.paymentStatus}`);
        console.log(`     - Created: ${sub.createdAt}`);
        console.log('');
      });
    } else {
      console.log('❌ No subscriptions found in database');
      console.log('💡 This is why admin panel shows "Gói không xác định"');
    }

    // Also check plans and users
    const planCount = await Plan.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log(`📈 Database summary:`);
    console.log(`   - Plans: ${planCount}`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Subscriptions: ${subscriptions.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

checkSubscriptions();