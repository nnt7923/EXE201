const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const SubscriptionPlan = require('./models/SubscriptionPlan');

async function createTestSubscriptions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau');
    console.log('✅ Connected to MongoDB');

    // Get available plans
    const plans = await SubscriptionPlan.find();
    if (plans.length === 0) {
      console.log('❌ No subscription plans found. Please run seed_plans.js first.');
      return;
    }

    console.log(`📋 Found ${plans.length} subscription plans`);

    // Create test users with subscriptions
    const testUsers = [
      {
        name: 'Nguyễn Văn A',
        email: 'user1@test.com',
        password: 'password123',
        planIndex: 0, // Basic plan
        daysFromNow: 30 // Active for 30 days
      },
      {
        name: 'Trần Thị B',
        email: 'user2@test.com', 
        password: 'password123',
        planIndex: 1, // Premium plan
        daysFromNow: 15 // Active for 15 days
      },
      {
        name: 'Lê Văn C',
        email: 'user3@test.com',
        password: 'password123',
        planIndex: 0, // Basic plan
        daysFromNow: -5 // Expired 5 days ago
      }
    ];

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⚠️ User ${userData.email} already exists, updating subscription...`);
        
        // Update existing user with subscription
        const plan = plans[userData.planIndex];
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + userData.daysFromNow);

        existingUser.subscriptionStatus = 'active';
        existingUser.subscriptionPlan = plan._id;
        existingUser.subscriptionStartDate = startDate;
        existingUser.subscriptionEndDate = endDate;
        existingUser.paymentStatus = 'confirmed';
        existingUser.aiSuggestionsLimit = plan.aiSuggestionsLimit;
        existingUser.aiSuggestionsUsed = 0;

        await existingUser.save();
        console.log(`✅ Updated subscription for ${userData.name} (${userData.email})`);
        continue;
      }

      // Create new user with subscription
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const plan = plans[userData.planIndex];
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + userData.daysFromNow);

      const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: 'user',
        isVerified: true,
        subscriptionStatus: 'active',
        subscriptionPlan: plan._id,
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        paymentStatus: 'confirmed',
        aiSuggestionsLimit: plan.aiSuggestionsLimit,
        aiSuggestionsUsed: 0,
        preferences: {
          cuisine: ['vietnamese'],
          priceRange: 'medium',
          dietaryRestrictions: []
        }
      });

      await user.save();
      console.log(`✅ Created user with subscription: ${userData.name} (${userData.email})`);
      console.log(`   Plan: ${plan.name} - End Date: ${endDate.toLocaleDateString('vi-VN')}`);
    }

    console.log('\n🎉 Test subscriptions created successfully!');
    console.log('\nYou can now test the admin dashboard with these users:');
    testUsers.forEach((user, index) => {
      const plan = plans[user.planIndex];
      const status = user.daysFromNow > 0 ? 'Còn hạn' : 'Hết hạn';
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${plan.name} - ${status}`);
    });

  } catch (error) {
    console.error('❌ Error creating test subscriptions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
}

createTestSubscriptions();