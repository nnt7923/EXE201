const mongoose = require('mongoose');
const User = require('./models/User');
const Subscription = require('./models/Subscription');
const Plan = require('./models/Plan');

async function verifyTestDetailed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://truongnnhe172873_db_user:0000asdAtashigi@exe201.1ooncox.mongodb.net/?retryWrites=true&w=majority&appName=EXE201');
    
    console.log('🔍 Finding test user...');
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('❌ Test user not found');
      process.exit(1);
    }
    
    console.log('✅ Test user found:');
    console.log('- ID:', testUser._id);
    console.log('- Email:', testUser.email);
    console.log('- Name:', testUser.name);
    console.log('- Subscription field:', testUser.subscription);
    console.log('- Subscription type:', typeof testUser.subscription);
    
    console.log('\n🔍 Finding subscription by user ID...');
    const subscriptionByUser = await Subscription.findOne({ user: testUser._id }).populate('plan');
    if (subscriptionByUser) {
      console.log('✅ Subscription found by user ID:');
      console.log('- Subscription ID:', subscriptionByUser._id);
      console.log('- Plan:', subscriptionByUser.plan?.name);
      console.log('- Status:', subscriptionByUser.status);
      console.log('- End Date:', subscriptionByUser.endDate);
    } else {
      console.log('❌ No subscription found by user ID');
    }
    
    console.log('\n🔍 Finding subscription by email...');
    const subscriptionByEmail = await Subscription.findOne({ 
      'customerInfo.email': 'test@example.com' 
    }).populate('plan');
    if (subscriptionByEmail) {
      console.log('✅ Subscription found by email:');
      console.log('- Subscription ID:', subscriptionByEmail._id);
      console.log('- Plan:', subscriptionByEmail.plan?.name);
      console.log('- Status:', subscriptionByEmail.status);
      console.log('- User field:', subscriptionByEmail.user);
    } else {
      console.log('❌ No subscription found by email');
    }
    
    // Try to update the user with the subscription ID
    if (subscriptionByUser && !testUser.subscription) {
      console.log('\n🔗 Updating user with subscription ID...');
      testUser.subscription = subscriptionByUser._id;
      await testUser.save();
      console.log('✅ User updated with subscription ID');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyTestDetailed();