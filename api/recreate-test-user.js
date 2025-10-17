const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Subscription = require('./models/Subscription');
const Plan = require('./models/Plan');

async function recreateTestUser() {
  try {
    require('dotenv').config();
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://truongnnhe172873_db_user:0000asdAtashigi@exe201.1ooncox.mongodb.net/?retryWrites=true&w=majority&appName=EXE201');
    
    console.log('🗑️ Cleaning up existing test data...');
    await User.deleteOne({ email: 'test@example.com' });
    await Subscription.deleteMany({ 'customerInfo.email': 'test@example.com' });
    
    console.log('🔍 Finding or creating Premium plan...');
    let premiumPlan = await Plan.findOne({ name: 'Premium' });
    if (!premiumPlan) {
      premiumPlan = new Plan({
        name: 'Premium',
        description: 'Premium plan with full access',
        price: 299000,
        features: ['Unlimited AI generations', 'Priority support', 'Advanced features'],
        aiSuggestionLimit: 999999 // Large number means unlimited
      });
      await premiumPlan.save();
      console.log('✅ Premium plan created:', premiumPlan._id);
    } else {
      console.log('✅ Premium plan found:', premiumPlan._id);
    }
    
    console.log('👤 Creating test user...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user'
    });
    await testUser.save();
    console.log('✅ Test user created:', testUser._id);
    
    console.log('📋 Creating Premium subscription...');
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 days from now
    
    const subscription = new Subscription({
      plan: premiumPlan._id,
      user: testUser._id, // Link to user
      status: 'active',
      startDate: new Date(),
      endDate: endDate,
      subscriptionNumber: `SUB-${Date.now()}`,
      customerInfo: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+84123456789',
        address: 'Test Address, Ho Chi Minh City'
      },
      pricing: {
        planPrice: 299000,
        serviceFee: 0,
        taxes: 0,
        totalAmount: 299000,
        paymentStatus: 'completed'
      }
    });
    await subscription.save();
    console.log('✅ Subscription created:', subscription._id);
    
    console.log('🔗 Linking subscription to user...');
    testUser.subscription = subscription._id;
    await testUser.save();
    console.log('✅ Subscription linked to user!');
    
    console.log('🔍 Final verification...');
    const verifyUser = await User.findById(testUser._id);
    const verifySubscription = await Subscription.findById(subscription._id).populate('plan');
    
    console.log('📊 Test account setup complete:');
    console.log('- Email: test@example.com');
    console.log('- Password: password123');
    console.log('- User ID:', verifyUser._id);
    console.log('- Subscription ID:', verifyUser.subscription);
    console.log('- Plan:', verifySubscription.plan.name);
    console.log('- Status:', verifySubscription.status);
    console.log('- Valid until:', verifySubscription.endDate.toISOString().split('T')[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

recreateTestUser();