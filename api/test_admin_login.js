const mongoose = require('mongoose');
const User = require('./models/User');
const axios = require('axios');
require('dotenv').config();

async function testAdminLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau');
    console.log('✅ Connected to MongoDB');

    // Find admin users
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`\n👑 Found ${adminUsers.length} admin users:`);
    
    adminUsers.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email})`);
    });

    if (adminUsers.length === 0) {
      console.log('❌ No admin users found!');
      return;
    }

    // Test login with second admin (admin@angioaudau.com)
    const admin = adminUsers[1];
    console.log(`\n🔐 Testing login for: ${admin.email}`);

    // Try to login (assuming password is known)
    const loginData = {
      email: admin.email,
      password: 'admin123' // Common admin password
    };

    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', loginData);
      
      if (loginResponse.data.success) {
        console.log('✅ Login successful!');
        const token = loginResponse.data.data.token;
        console.log('🔑 Token received');
        
        // Test payments access with this token
        console.log('\n🧪 Testing payments access...');
        
        const paymentsResponse = await axios.get('http://localhost:5000/api/payments/admin/all', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (paymentsResponse.data.success) {
          console.log('✅ Payments access successful!');
          console.log(`📊 Found ${paymentsResponse.data.data.payments.length} payments`);
          
          console.log('\n🌐 Frontend instructions:');
          console.log('1. Open http://localhost:3000/admin/payments');
          console.log('2. Open browser console (F12)');
          console.log('3. Run this command:');
          console.log(`localStorage.setItem('token', '${token}');`);
          console.log('4. Refresh the page');
          console.log('5. You should now see the payments!');
          
        } else {
          console.log('❌ Payments access failed:', paymentsResponse.data);
        }
        
      } else {
        console.log('❌ Login failed:', loginResponse.data);
      }
      
    } catch (loginError) {
      console.log('❌ Login error:', loginError.response?.data || loginError.message);
      
      // If login fails, let's check what passwords might work
      console.log('\n🔍 Checking admin user details...');
      console.log(`Admin ID: ${admin._id}`);
      console.log(`Admin email: ${admin.email}`);
      console.log(`Admin role: ${admin.role}`);
      
      console.log('\n💡 Try these common admin passwords:');
      console.log('- admin123');
      console.log('- password123');
      console.log('- 123456');
      console.log('- admin');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

testAdminLogin();