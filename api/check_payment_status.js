const mongoose = require('mongoose');
const User = require('./models/User');
const Plan = require('./models/Plan');
const Subscription = require('./models/Subscription');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/an-gi-o-dau', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkPaymentStatus() {
  try {
    console.log('✅ Connected to MongoDB');

    // Tìm tất cả subscriptions
    const subscriptions = await Subscription.find({})
      .populate('user', 'email name')
      .populate('plan', 'name aiSuggestionLimit');

    console.log(`\n📋 Found ${subscriptions.length} subscription(s):\n`);

    for (const sub of subscriptions) {
      console.log(`👤 User: ${sub.user.email} (${sub.user.name})`);
      console.log(`📦 Plan: ${sub.plan.name}`);
      console.log(`💰 Payment Status: ${sub.paymentStatus}`);
      console.log(`📊 Subscription Status: ${sub.status}`);
      console.log(`🤖 AI Limit: ${sub.plan.aiSuggestionLimit}`);
      console.log(`📅 Start Date: ${sub.startDate.toISOString().split('T')[0]}`);
      console.log(`📅 End Date: ${sub.endDate.toISOString().split('T')[0]}`);
      console.log(`⏰ Is Valid: ${sub.endDate > new Date() ? '✅ Yes' : '❌ Expired'}`);
      console.log('---');
    }

    // Kiểm tra điều kiện AI access
    console.log('\n🤖 AI Access Check:');
    for (const sub of subscriptions) {
      const isValidForAI = (
        sub.status === 'active' &&
        sub.paymentStatus === 'paid' &&
        sub.endDate > new Date() &&
        sub.plan.aiSuggestionLimit > 0
      );
      
      console.log(`👤 ${sub.user.email}: ${isValidForAI ? '✅ Can use AI' : '❌ Cannot use AI'}`);
      if (!isValidForAI) {
        const reasons = [];
        if (sub.status !== 'active') reasons.push(`Status: ${sub.status}`);
        if (sub.paymentStatus !== 'paid') reasons.push(`Payment: ${sub.paymentStatus}`);
        if (sub.endDate <= new Date()) reasons.push('Expired');
        if (sub.plan.aiSuggestionLimit <= 0) reasons.push('No AI limit');
        console.log(`   Reasons: ${reasons.join(', ')}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkPaymentStatus();