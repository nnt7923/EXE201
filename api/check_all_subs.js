const mongoose = require('mongoose');
const Subscription = require('./models/Subscription');
const Plan = require('./models/Plan');
const User = require('./models/User');

async function checkAllSubscriptions() {
  try {
    await mongoose.connect('mongodb://localhost:27017/an-gi-o-dau-platform');
    console.log('Connected to MongoDB');
    
    const allSubs = await Subscription.find({});
    console.log('Total subscriptions in database:', allSubs.length);
    
    for (let i = 0; i < allSubs.length; i++) {
      const sub = allSubs[i];
      console.log(`\nSubscription ${i + 1}:`);
      console.log('- ID:', sub._id);
      console.log('- User ID:', sub.user);
      console.log('- Plan ID:', sub.plan);
      console.log('- Status:', sub.status);
      console.log('- Payment Status:', sub.paymentStatus);
      console.log('- End Date:', sub.endDate);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAllSubscriptions();