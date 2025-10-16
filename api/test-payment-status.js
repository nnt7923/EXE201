const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Subscription = require('./models/Subscription');
const Plan = require('./models/Plan');

async function createTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create admin user if not exists
    let adminUser = await User.findOne({ email: 'admin@test.com' });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Create test user if not exists
    let testUser = await User.findOne({ email: 'test@test.com' });
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('test123', 12);
      testUser = await User.create({
        name: 'Test User',
        email: 'test@test.com',
        password: hashedPassword,
        role: 'user',
        isVerified: true
      });
      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user already exists');
    }

    // Get available plans
    const plans = await Plan.find({});
    if (plans.length === 0) {
      console.log('❌ No plans found. Please run seed_plans.js first');
      return;
    }

    const basicPlan = plans.find(p => p.name === 'Cơ bản');
    const proPlan = plans.find(p => p.name === 'Chuyên nghiệp');
    const unlimitedPlan = plans.find(p => p.name === 'Không giới hạn');

    // Generate subscription numbers
    const generateSubNumber = () => `SUB${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create test subscriptions with different payment statuses
    const subscriptions = [
      {
        subscriptionNumber: generateSubNumber(),
        user: testUser._id,
        plan: proPlan._id,
        customerInfo: {
          name: testUser.name,
          email: testUser.email,
          phone: '0123456789',
          address: 'Hòa Lạc, Hà Nội'
        },
        pricing: {
          planPrice: proPlan.price,
          serviceFee: 0,
          taxes: 0,
          totalAmount: proPlan.price
        },
        status: 'active',
        paymentStatus: 'paid',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        notes: {
          adminNotes: 'Test subscription with paid status',
          customerNotes: 'Gói chuyên nghiệp đã thanh toán'
        }
      },
      {
        subscriptionNumber: generateSubNumber(),
        user: testUser._id,
        plan: basicPlan._id,
        customerInfo: {
          name: testUser.name,
          email: testUser.email,
          phone: '0123456789',
          address: 'Hòa Lạc, Hà Nội'
        },
        pricing: {
          planPrice: basicPlan.price,
          serviceFee: 0,
          taxes: 0,
          totalAmount: basicPlan.price
        },
        status: 'pending',
        paymentStatus: 'pending',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: {
          adminNotes: 'Test subscription with pending payment',
          customerNotes: 'Đang chờ thanh toán'
        }
      },
      {
        subscriptionNumber: generateSubNumber(),
        user: testUser._id,
        plan: unlimitedPlan._id,
        customerInfo: {
          name: testUser.name,
          email: testUser.email,
          phone: '0123456789',
          address: 'Hòa Lạc, Hà Nội'
        },
        pricing: {
          planPrice: unlimitedPlan.price,
          serviceFee: 0,
          taxes: 0,
          totalAmount: unlimitedPlan.price
        },
        status: 'cancelled',
        paymentStatus: 'failed',
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        notes: {
          adminNotes: 'Test subscription with failed payment',
          customerNotes: 'Thanh toán thất bại'
        }
      }
    ];

    // Delete existing test subscriptions
    await Subscription.deleteMany({ user: testUser._id });
    console.log('✅ Cleared existing test subscriptions');

    // Create new test subscriptions
    for (const subData of subscriptions) {
      await Subscription.create(subData);
    }
    console.log('✅ Test subscriptions created');

    console.log('\n📋 Test Data Summary:');
    console.log('Admin Login: admin@test.com / admin123');
    console.log('Test User: test@test.com / test123');
    console.log('Created 3 test subscriptions with different payment statuses');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    process.exit(1);
  }
}

createTestData();