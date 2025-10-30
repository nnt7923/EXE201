const mongoose = require('mongoose');
const Subscription = require('./models/Subscription');
const Plan = require('./models/Plan');
require('dotenv').config();

async function checkSubscriptionPricing() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all plans
    const plans = await Plan.find({}).sort({ price: 1 });
    console.log('📋 Available plans:');
    plans.forEach((plan, index) => {
      console.log(`  ${index + 1}. ${plan.name}: ${plan.price}đ`);
    });

    // Get all subscriptions with their pricing details
    const subscriptions = await Subscription.find({})
      .populate('plan', 'name price')
      .sort({ createdAt: -1 });
    
    console.log(`\n📊 Found ${subscriptions.length} subscriptions:`);
    
    subscriptions.forEach((sub, index) => {
      console.log(`\n${index + 1}. ${sub.subscriptionNumber || sub._id}`);
      console.log(`   - Current Plan: ${sub.plan ? sub.plan.name : 'No plan'} (${sub.plan ? sub.plan.price : 'N/A'}đ)`);
      console.log(`   - Pricing Info:`);
      console.log(`     * Total Amount: ${sub.pricing?.totalAmount || 'N/A'}đ`);
      console.log(`     * Plan Price: ${sub.pricing?.planPrice || 'N/A'}đ`);
      console.log(`     * Discount: ${sub.pricing?.discount || 0}đ`);
      console.log(`   - Status: ${sub.status}`);
      console.log(`   - Payment Status: ${sub.paymentStatus}`);
    });

    // Analyze pricing distribution
    console.log('\n📈 Pricing Analysis:');
    const pricingGroups = {
      free: subscriptions.filter(s => (s.pricing?.totalAmount || 0) === 0),
      professional: subscriptions.filter(s => (s.pricing?.totalAmount || 0) > 0 && (s.pricing?.totalAmount || 0) <= 99000),
      unlimited: subscriptions.filter(s => (s.pricing?.totalAmount || 0) > 99000)
    };

    console.log(`- Free (0đ): ${pricingGroups.free.length} subscriptions`);
    console.log(`- Professional (1-99,000đ): ${pricingGroups.professional.length} subscriptions`);
    console.log(`- Unlimited (>99,000đ): ${pricingGroups.unlimited.length} subscriptions`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

checkSubscriptionPricing();