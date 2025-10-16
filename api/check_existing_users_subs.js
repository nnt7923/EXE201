const mongoose = require('mongoose');
const User = require('./models/User');
const Subscription = require('./models/Subscription');

async function checkExistingUsersSubs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau');
    console.log('✅ Connected to MongoDB');
    
    const users = await User.find({}, 'email name role');
    console.log('\n📋 Checking subscriptions for all users:');
    
    for (const user of users) {
      console.log(`\n👤 User: ${user.email} (${user.name})`);
      
      const subscription = await Subscription.findOne({ user: user._id }).populate('plan');
      if (subscription) {
        const now = new Date();
        const isActive = subscription.status === 'active' && 
                        subscription.startDate <= now && 
                        subscription.endDate >= now;
        
        console.log('  📋 Subscription:', {
          status: subscription.status,
          isActive: isActive,
          aiSuggestionLimit: subscription.aiSuggestionLimit,
          aiSuggestionsUsed: subscription.aiSuggestionsUsed,
          remaining: subscription.aiSuggestionLimit - subscription.aiSuggestionsUsed,
          startDate: subscription.startDate.toISOString().split('T')[0],
          endDate: subscription.endDate.toISOString().split('T')[0],
          plan: subscription.plan ? subscription.plan.name : 'No plan'
        });
      } else {
        console.log('  ❌ No subscription found');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkExistingUsersSubs();