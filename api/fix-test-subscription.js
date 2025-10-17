const mongoose = require('mongoose');
const User = require('./models/User');
const Subscription = require('./models/Subscription');
const Plan = require('./models/Plan');

async function fixTestSubscription() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://truongnnhe172873_db_user:0000asdAtashigi@exe201.1ooncox.mongodb.net/?retryWrites=true&w=majority&appName=EXE201');
    
    console.log('🔍 Finding test user...');
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('❌ Test user not found');
      process.exit(1);
    }
    
    console.log('✅ Test user found:', testUser._id);
    
    console.log('🔍 Finding subscription for this user...');
    const subscription = await Subscription.findOne({ 
      'customerInfo.email': 'test@example.com' 
    }).populate('plan');
    
    if (!subscription) {
      console.log('❌ No subscription found for test user');
      process.exit(1);
    }
    
    console.log('✅ Subscription found:', subscription._id);
    console.log('📋 Subscription details:');
    console.log('- Plan:', subscription.plan?.name);
    console.log('- Status:', subscription.status);
    console.log('- End Date:', subscription.endDate);
    
    console.log('🔗 Linking subscription to user...');
    testUser.subscription = subscription._id;
    await testUser.save();
    
    console.log('✅ Subscription successfully linked to user!');
    
    // Verify the link
    const updatedUser = await User.findById(testUser._id);
    console.log('🔍 Verification - User subscription ID:', updatedUser.subscription);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixTestSubscription();