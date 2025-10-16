const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Xóa user test cũ nếu có
    await User.deleteOne({ email: 'test@example.com' });
    console.log('🗑️ Deleted old test user if exists');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Tạo user mới
    const testUser = new User({
      name: 'Test User AI',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user',
      isActive: true,
      credits: 0,
      aiSuggestionsUsed: 0
    });

    await testUser.save();
    console.log('✅ Test user created:', {
      id: testUser._id,
      name: testUser.name,
      email: testUser.email,
      role: testUser.role
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createTestUser();