const mongoose = require('mongoose');
const Plan = require('./models/Plan');
require('dotenv').config();

async function checkExistingPlans() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check existing plans
    const existingPlans = await Plan.find({}).sort({ displayOrder: 1 });
    console.log(`📊 Found ${existingPlans.length} existing plans in database`);
    
    if (existingPlans.length > 0) {
      console.log('📋 Existing plans:');
      existingPlans.forEach((plan, index) => {
        console.log(`  ${index + 1}. ${plan.name}: ${plan.price}đ`);
        console.log(`     - Description: ${plan.description}`);
        console.log(`     - Features: ${plan.features.length} items`);
        console.log(`     - AI Limit: ${plan.aiSuggestionLimit}`);
        console.log(`     - Active: ${plan.isActive}`);
        console.log(`     - Display Order: ${plan.displayOrder}`);
        console.log('');
      });
    } else {
      console.log('❌ No plans found in database');
    }

    // Verify plans exist
    const finalCount = await Plan.countDocuments();
    console.log(`🎯 Total plans in database: ${finalCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

checkExistingPlans();