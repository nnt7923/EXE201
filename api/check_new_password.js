const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function checkNewPassword() {
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
    
    // Test password comparison with different passwords
    const passwords = ['1234567', '123456', 'password'];
    for (const pwd of passwords) {
      const match = await bcrypt.compare(pwd, user.password);
      console.log(`Password "${pwd}" matches:`, match);
    }
    
    // Test the exact same way as in auth route
    const testPassword = '1234567';
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log(`Auth route style test for "${testPassword}":`, isMatch);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkNewPassword();