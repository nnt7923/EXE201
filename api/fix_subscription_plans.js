const mongoose = require('mongoose');
const Subscription = require('./models/Subscription');
const Plan = require('./models/Plan');
require('dotenv').config();

async function fixSubscriptionPlans() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all available plans
    const plans = await Plan.find({}).sort({ price: 1 });
    console.log(`📋 Found ${plans.length} plans:`);
    plans.forEach((plan, index) => {
      console.log(`  ${index + 1}. ${plan.name} (${plan.price}đ) - ID: ${plan._id}`);
    });

    if (plans.length === 0) {
      console.log('❌ No plans found! Cannot fix subscriptions.');
      return;
    }

    // Get plans by price for easy reference
    const basicPlan = plans.find(p => p.price === 0);           // 0đ
    const professionalPlan = plans.find(p => p.price === 99000); // 99,000đ  
    const unlimitedPlan = plans.find(p => p.price === 299000);   // 299,000đ

    // Get all subscriptions
    const subscriptions = await Subscription.find({})
      .populate('plan', 'name price');
    
    console.log(`\n📊 Found ${subscriptions.length} subscriptions`);
    
    let fixedCount = 0;
    
    for (const subscription of subscriptions) {
      let assignedPlan;
      const totalAmount = subscription.pricing?.totalAmount || 0;
      
      console.log(`\n🔍 Processing ${subscription.subscriptionNumber || subscription._id}:`);
      console.log(`   - Total Amount: ${totalAmount}đ`);
      
      // Assign plan based on actual pricing logic
      if (totalAmount === 0) {
        // Free plan
        assignedPlan = basicPlan;
        console.log(`   → Assigning: Basic Plan (Free)`);
      } else if (totalAmount > 0 && totalAmount <= 150000) {
        // Professional plan (for amounts up to 150,000đ)
        assignedPlan = professionalPlan;
        console.log(`   → Assigning: Professional Plan (99,000đ)`);
      } else {
        // Unlimited plan (for amounts > 150,000đ)
        assignedPlan = unlimitedPlan;
        console.log(`   → Assigning: Unlimited Plan (299,000đ)`);
      }
      
      // If no suitable plan found, assign basic plan
      if (!assignedPlan) {
        assignedPlan = basicPlan || plans[0];
        console.log(`   → Fallback: Assigning Basic Plan`);
      }

      // Update subscription only if plan is different
      const currentPlanId = subscription.plan?._id?.toString();
      const newPlanId = assignedPlan._id.toString();
      
      if (currentPlanId !== newPlanId) {
        await Subscription.updateOne(
          { _id: subscription._id },
          { 
            $set: { 
              plan: assignedPlan._id,
              'pricing.planPrice': assignedPlan.price
            }
          }
        );

        console.log(`   ✅ Updated: ${assignedPlan.name}`);
        fixedCount++;
      } else {
        console.log(`   ⏭️  Already correct: ${assignedPlan.name}`);
      }
    }

    console.log(`\n🎉 Successfully updated ${fixedCount} subscriptions!`);

    // Verify the fix with detailed breakdown
    console.log('\n🔍 Final verification...');
    const verifySubscriptions = await Subscription.find({})
      .populate('plan', 'name price')
      .sort({ createdAt: -1 });
    
    const planDistribution = {
      basic: 0,
      professional: 0,
      unlimited: 0
    };
    
    console.log('📋 Final subscription distribution:');
    verifySubscriptions.forEach((sub, index) => {
      const planName = sub.plan ? sub.plan.name : 'No plan';
      const totalAmount = sub.pricing?.totalAmount || 0;
      
      console.log(`  ${index + 1}. ${sub.subscriptionNumber || sub._id}`);
      console.log(`     - Plan: ${planName} (${sub.plan ? sub.plan.price : 'N/A'}đ)`);
      console.log(`     - Total Amount: ${totalAmount}đ`);
      
      // Count distribution
      if (planName === 'Cơ bản') planDistribution.basic++;
      else if (planName === 'Chuyên nghiệp') planDistribution.professional++;
      else if (planName === 'Không giới hạn') planDistribution.unlimited++;
    });

    console.log('\n📊 Plan Distribution Summary:');
    console.log(`   - Cơ bản (0đ): ${planDistribution.basic} subscriptions`);
    console.log(`   - Chuyên nghiệp (99,000đ): ${planDistribution.professional} subscriptions`);
    console.log(`   - Không giới hạn (299,000đ): ${planDistribution.unlimited} subscriptions`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

fixSubscriptionPlans();