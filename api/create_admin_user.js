const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công');

    // Kiểm tra xem admin đã tồn tại chưa
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user đã tồn tại');
      console.log(`   - Email: ${existingAdmin.email}`);
      console.log(`   - Role: ${existingAdmin.role}`);
      console.log(`   - Name: ${existingAdmin.name}`);
    } else {
      // Tạo admin user mới
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
    
        isEmailVerified: true
      });

      await adminUser.save();
      console.log('✅ Đã tạo admin user thành công');
      console.log(`   - Email: ${adminUser.email}`);
      console.log(`   - Password: admin123`);
      console.log(`   - Role: ${adminUser.role}`);
    }

    // Kiểm tra tất cả admin users
    const allAdmins = await User.find({ role: 'admin' });
    console.log(`\n📊 Tổng số admin users: ${allAdmins.length}`);
    allAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email})`);
    });

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Đã ngắt kết nối MongoDB');
  }
}

createAdminUser();