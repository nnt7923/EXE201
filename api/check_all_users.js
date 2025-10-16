require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Subscription = require('./models/Subscription');

async function checkAllUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau');
    console.log('✅ Connected to MongoDB');
    
    const users = await User.find({}, 'email name role createdAt');
    console.log('\n📋 All users in database:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.name} (${user.role})`);
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
    }
    
    // Check specifically for test user
    const testUser = await User.findOne({ email: 'testuser@example.com' });
    if (testUser) {
      console.log('\n👤 Test user found:', {
        id: testUser._id,
        email: testUser.email,
        name: testUser.name,
        role: testUser.role
      });
      
      // Check subscription
      const subscription = await Subscription.findOne({ user: testUser._id }).populate('plan');
      if (subscription) {
        console.log('\n📋 Test user subscription:', {
          status: subscription.status,
          aiSuggestionLimit: subscription.aiSuggestionLimit,
          aiSuggestionsUsed: subscription.aiSuggestionsUsed,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          plan: subscription.plan ? subscription.plan.name : 'No plan'
        });
      } else {
        console.log('\n❌ No subscription found for test user');
      }
    } else {
      console.log('\n❌ Test user not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

checkAllUsers();