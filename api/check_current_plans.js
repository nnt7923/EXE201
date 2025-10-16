const mongoose = require('mongoose');
const Plan = require('./models/Plan');

async function checkCurrentPlans() {
  try {
    await mongoose.connect('mongodb://localhost:27017/an-gi-o-dau-platform');
    console.log('Connected to MongoDB');
    
    const plans = await Plan.find({});
    console.log(`Found ${plans.length} plan(s) in database:`);
    console.log('='.repeat(50));
    
    plans.forEach((plan, index) => {
      console.log(`Plan ${index + 1}:`);
      console.log(`  ID: ${plan._id}`);
      console.log(`  Name: "${plan.name}"`);
      console.log(`  Price: ${plan.price}`);
      console.log(`  AI Suggestion Limit: ${plan.aiSuggestionLimit}`);
      console.log(`  Features: ${JSON.stringify(plan.features)}`);
      console.log(`  Description: "${plan.description}"`);
      console.log(`  Created: ${plan.createdAt}`);
      console.log(`  Updated: ${plan.updatedAt}`);
      console.log('-'.repeat(30));
    });
    
    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCurrentPlans();