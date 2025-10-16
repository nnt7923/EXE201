const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/an-gi-o-dau', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkAndCreateUser() {
  try {
    console.log('✅ Connected to MongoDB');

    // Kiểm tra user có tồn tại không
    let user = await User.findOne({ email: 'truongnn23790@gmail.com' });
    
    if (user) {
      console.log('👤 User exists:');
      console.log('- Email:', user.email);
      console.log('- Name:', user.name);
      console.log('- ID:', user._id);
    } else {
      console.log('❌ User not found, creating new user...');
      
      // Tạo user mới
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt);
      
      user = new User({
        name: 'Ngo Ngoc Truong',
        email: 'truongnn23790@gmail.com',
        password: hashedPassword
      });
      
      await user.save();
      console.log('✅ User created successfully:');
      console.log('- Email:', user.email);
      console.log('- Name:', user.name);
      console.log('- ID:', user._id);
    }

    // Kiểm tra tất cả users
    const allUsers = await User.find({});
    console.log('\n📋 All users in database:');
    allUsers.forEach((u, index) => {
      console.log(`${index + 1}. ${u.email} - ${u.name} (ID: ${u._id})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

checkAndCreateUser();