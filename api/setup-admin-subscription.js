const mongoose = require('mongoose');
const User = require('./models/User');
const Plan = require('./models/Plan');
require('dotenv').config();

async function setupAdminSubscription() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Find admin user
    console.log('\n👤 Finding admin user...');
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    console.log('✅ Admin user found:', adminUser.email);

    // 2. Check existing subscription plans
    console.log('\n📋 Checking subscription plans...');
    const plans = await Plan.find({});
    console.log(`Found ${plans.length} subscription plans:`);
    plans.forEach(plan => {
      console.log(`- ${plan.name}: ${plan.aiSuggestionLimit} AI suggestions`);
    });

    // 3. Find or create Premium plan
    let premiumPlan = await Plan.findOne({ name: 'Premium' });
    
    if (!premiumPlan) {
      console.log('\n🆕 Creating Premium subscription plan...');
      premiumPlan = await Plan.create({
        name: 'Premium',
        description: 'Gói Premium với tính năng AI không giới hạn',
        price: 299000,
        duration: 'monthly',
        aiSuggestionLimit: 100,
        features: [
          'Gợi ý lịch trình AI không giới hạn',
          'Tìm kiếm địa điểm nâng cao',
          'Hỗ trợ ưu tiên',
          'Xuất lịch trình PDF'
        ],
        isActive: true
      });
      console.log('✅ Premium plan created');
    } else {
      console.log('✅ Premium plan already exists');
    }

    // 4. Update admin user with Premium subscription
    console.log('\n💎 Assigning Premium subscription to admin...');
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1); // 1 year from now

    await User.findByIdAndUpdate(adminUser._id, {
      subscriptionPlan: premiumPlan._id,
      subscriptionStatus: 'active',
      subscriptionEndDate: subscriptionEndDate,
      aiSuggestionsUsed: 0
    });

    console.log('✅ Admin subscription updated successfully');
    console.log('Subscription details:');
    console.log('- Plan:', premiumPlan.name);
    console.log('- AI Limit:', premiumPlan.aiSuggestionLimit);
    console.log('- End Date:', subscriptionEndDate.toISOString().split('T')[0]);

    // 5. Verify the update
    console.log('\n🔍 Verifying admin user subscription...');
    const updatedAdmin = await User.findById(adminUser._id).populate('subscriptionPlan');
    console.log('Updated admin details:');
    console.log('- Email:', updatedAdmin.email);
    console.log('- Subscription Plan:', updatedAdmin.subscriptionPlan?.name || 'None');
    console.log('- Subscription Status:', updatedAdmin.subscriptionStatus || 'None');
    console.log('- AI Suggestions Used:', updatedAdmin.aiSuggestionsUsed || 0);
    console.log('- AI Suggestion Limit:', updatedAdmin.subscriptionPlan?.aiSuggestionLimit || 0);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

setupAdminSubscription();