const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const updateNgoquocanPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Tìm user ngoquocan712@gmail.com
    const user = await User.findOne({ email: 'ngoquocan712@gmail.com' });
    if (!user) {
      console.log('❌ User ngoquocan712@gmail.com not found');
      return;
    }
    
    console.log('👤 Found user:', user.name, user.email);
    console.log('Current password hash:', user.password);

    // Test current password
    const testPasswords = ['123456', 'password', '123', 'ngoquocan712'];
    for (const testPass of testPasswords) {
      const isMatch = await bcrypt.compare(testPass, user.password);
      if (isMatch) {
        console.log(`✅ Current password is: ${testPass}`);
        return;
      }
    }

    console.log('❌ None of the test passwords match. Setting new password to "123456"');
    
    // Set new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    user.password = hashedPassword;
    await user.save();
    
    console.log('✅ Password updated to "123456"');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

updateNgoquocanPassword();