const mongoose = require('mongoose');
const Plan = require('./models/Plan');
require('dotenv').config();

async function restorePlanPrices() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check current prices first
    console.log('📋 Current plans:');
    const currentPlans = await Plan.find({}).sort({ displayOrder: 1 });
    currentPlans.forEach((plan, index) => {
      console.log(`  ${index + 1}. ${plan.name}: ${plan.price}đ`);
    });

    // Restore plan prices to correct values: 0/99000/299000
    console.log('\n🔧 Restoring plan prices to 0/99000/299000...');
    
    // Update Chuyên nghiệp back to 99000
    const proResult = await Plan.updateOne(
      { name: "Chuyên nghiệp" },
      { $set: { price: 99000 } }
    );
    console.log(`✅ Restored "Chuyên nghiệp" price to 99000: ${proResult.modifiedCount} document(s)`);
    
    // Update Không giới hạn back to 299000
    const unlimitedResult = await Plan.updateOne(
      { name: "Không giới hạn" },
      { $set: { price: 299000 } }
    );
    console.log(`✅ Restored "Không giới hạn" price to 299000: ${unlimitedResult.modifiedCount} document(s)`);

    // Verify the changes
    console.log('\n📋 Restored plans:');
    const updatedPlans = await Plan.find({}).sort({ displayOrder: 1 });
    updatedPlans.forEach((plan, index) => {
      console.log(`  ${index + 1}. ${plan.name}: ${plan.price}đ`);
    });

    console.log('\n✅ Plan prices restored successfully to 0/99000/299000!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

restorePlanPrices();