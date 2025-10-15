const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau');
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@angioaudau.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@angioaudau.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      preferences: {
        cuisine: ['vietnamese', 'asian'],
        priceRange: 'medium',
        dietaryRestrictions: []
      }
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@angioaudau.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedAdmin();