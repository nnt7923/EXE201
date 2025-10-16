const mongoose = require('mongoose');
const Subscription = require('./models/Subscription');

async function checkSubscription() {
  try {
    await mongoose.connect('mongodb://localhost:27017/an-gi-o-dau-platform');
    console.log('Connected to MongoDB');
    
    const subscription = await Subscription.findOne({
      user: '68ef55e2912dcc3428322fbd',
      status: 'active',
      paymentStatus: 'paid',
      endDate: { $gt: new Date() }
    }).populate('plan', 'name aiSuggestionLimit features');
    
    console.log('Subscription found:', !!subscription);
    if (subscription) {
      console.log('Subscription details:');
      console.log('- ID:', subscription._id);
      console.log('- Status:', subscription.status);
      console.log('- Payment Status:', subscription.paymentStatus);
      console.log('- End Date:', subscription.endDate);
      console.log('- Plan:', subscription.plan);
      console.log('- Plan ID:', subscription.plan ? subscription.plan._id : 'null');
      console.log('- Plan name:', subscription.plan ? subscription.plan.name : 'null');
      console.log('- AI Limit:', subscription.plan ? subscription.plan.aiSuggestionLimit : 'null');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSubscription();