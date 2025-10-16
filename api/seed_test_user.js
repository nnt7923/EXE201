const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Plan = require('./models/Plan');
const Subscription = require('./models/Subscription');

async function seedTestUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau');
    console.log('✅ Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'testuser@example.com' });
    if (existingUser) {
      console.log('✅ Test user already exists');
      
      // Check if user has subscription
      const subscription = await Subscription.findOne({ user: existingUser._id, status: 'active' });
      if (subscription) {
        console.log('✅ Test user already has active subscription');
        return;
      }
    }

    // Create test user if not exists
    let testUser = existingUser;
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      testUser = new User({
        name: 'Test User',
        email: 'testuser@example.com',
        password: hashedPassword,
        role: 'user',
        isVerified: true
      });

      await testUser.save();
      console.log('✅ Test user created successfully!');
    }

    // Create or find a test plan
    let testPlan = await Plan.findOne({ name: 'Premium Plan' });
    if (!testPlan) {
      testPlan = new Plan({
        name: 'Premium Plan',
        description: 'Premium subscription plan for testing',
        price: 99000,
        durationInDays: 30,
        aiSuggestionLimit: 100,
        features: ['AI suggestions', 'Premium support']
      });
      await testPlan.save();
      console.log('✅ Test plan created successfully!');
    }

    // Create active subscription for test user
    const subscriptionCount = await Subscription.countDocuments();
    const subscriptionNumber = `SUB${Date.now()}${String(subscriptionCount + 1).padStart(3, '0')}`;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month from now

    const subscription = new Subscription({
      subscriptionNumber,
      user: testUser._id,
      plan: testPlan._id,
      customerInfo: {
        name: 'Test User',
        phone: '0123456789',
        email: 'testuser@example.com'
      },
      pricing: {
        planPrice: testPlan.price,
        serviceFee: testPlan.price * 0.05,
        taxes: testPlan.price * 0.08,
        totalAmount: testPlan.price * 1.13
      },
      status: 'active',
      paymentStatus: 'paid',
      paymentMethod: 'bank_transfer',
      startDate,
      endDate
    });

    await subscription.save();
    console.log('✅ Test subscription created successfully!');
    console.log('Test User Credentials:');
    console.log('Email: testuser@example.com');
    console.log('Password: password123');
    console.log('Subscription Status: active');
    console.log('AI Suggestion Limit:', testPlan.aiSuggestionLimit);

  } catch (error) {
    console.error('❌ Error seeding test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedTestUser();