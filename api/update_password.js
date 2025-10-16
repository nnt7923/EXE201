const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function updatePassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/an-gi-o-dau-platform');
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ email: 'ngoquocan712@gmail.com' });
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:', user.email);
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('1234567', salt);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    console.log('Password updated successfully');
    
    // Verify new password
    const isMatch = await bcrypt.compare('1234567', user.password);
    console.log('New password verification:', isMatch);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

updatePassword();