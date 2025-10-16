const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function checkPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/an-gi-o-dau-platform');
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ email: 'ngoquocan712@gmail.com' });
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:');
    console.log('Email:', user.email);
    console.log('Password hash:', user.password);
    console.log('Password hash length:', user.password.length);
    
    // Test password comparison
    const testPassword = '123456';
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log('Password match for "123456":', isMatch);
    
    // Test with different passwords
    const passwords = ['123456', 'password', 'admin123'];
    for (const pwd of passwords) {
      const match = await bcrypt.compare(pwd, user.password);
      console.log(`Password "${pwd}" matches:`, match);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPassword();