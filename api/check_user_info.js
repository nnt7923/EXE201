const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/an-gi-o-dau', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkUserInfo() {
  try {
    console.log('✅ Connected to MongoDB');

    // Tìm user
    const user = await User.findOne({ email: 'truongnn23790@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('👤 User found:');
    console.log('- Email:', user.email);
    console.log('- Name:', user.name);
    console.log('- Password hash exists:', !!user.password);
    console.log('- Password hash length:', user.password?.length);

    // Thử một số mật khẩu phổ biến
    const commonPasswords = ['123456', 'password123', '1234567', 'admin123', 'truong123'];
    
    console.log('\n🔍 Testing common passwords:');
    for (const password of commonPasswords) {
      try {
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`- ${password}: ${isMatch ? '✅ MATCH' : '❌ No match'}`);
        if (isMatch) {
          console.log(`\n🎉 Found correct password: ${password}`);
          break;
        }
      } catch (error) {
        console.log(`- ${password}: ❌ Error checking`);
      }
    }

    // Nếu không tìm thấy, cập nhật mật khẩu mới
    console.log('\n🔧 Setting new password: "123456"');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    console.log('✅ Password updated successfully');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

checkUserInfo();