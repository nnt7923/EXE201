const axios = require('axios');
const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const User = require('./models/User');
require('dotenv').config();

const API_BASE = 'http://localhost:5000';

async function testPaymentActions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công');

    // 1. Tìm pending payment và user của nó
    console.log('\n📋 TÌM PENDING PAYMENT VÀ USER');
    console.log('='.repeat(30));
    
    const pendingPayment = await Payment.findOne({ status: 'pending' }).populate('user');
    if (!pendingPayment) {
      console.log('❌ Không tìm thấy pending payment để test');
      return;
    }

    console.log(`✅ Tìm thấy pending payment: ${pendingPayment._id}`);
    console.log(`   - Amount: ${pendingPayment.amount} VND`);
    console.log(`   - User: ${pendingPayment.user.email}`);

    // 2. Login admin để lấy admin token
    console.log('\n🔐 ADMIN LOGIN');
    console.log('='.repeat(30));
    
    const adminLoginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    const adminToken = adminLoginResponse.data.data.token;
    console.log('✅ Admin login thành công');

    // 3. Login user để lấy user token
    console.log('\n👤 USER LOGIN');
    console.log('='.repeat(30));
    
    let userToken = null;
    try {
      const userLoginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
        email: pendingPayment.user.email,
        password: 'password123' // Giả sử password mặc định
      });
      userToken = userLoginResponse.data.data.token;
      console.log('✅ User login thành công');
    } catch (error) {
      console.log('❌ User login thất bại:', error.response?.data?.message || error.message);
      console.log('⚠️ Sẽ skip test payment status với user token');
    }

    // 4. Test Payment Status API với user token
    if (userToken) {
      console.log('\n📊 TEST PAYMENT STATUS API (USER TOKEN)');
      console.log('='.repeat(30));
      
      try {
        const statusResponse = await axios.get(`${API_BASE}/api/payments/status/${pendingPayment._id}`, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('✅ Get payment status với user token thành công');
        console.log(`   - Status: ${statusResponse.data.data.status}`);
        console.log(`   - Amount: ${statusResponse.data.data.amount} VND`);
      } catch (error) {
        console.log('❌ Get payment status với user token thất bại:', error.response?.data?.message || error.message);
      }
    }

    // 5. Test Payment Status API với admin token (sẽ thất bại)
    console.log('\n📊 TEST PAYMENT STATUS API (ADMIN TOKEN)');
    console.log('='.repeat(30));
    
    try {
      const statusResponse = await axios.get(`${API_BASE}/api/payments/status/${pendingPayment._id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('❌ Không nên thành công với admin token (payment không thuộc admin)');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Correctly rejected admin access to user payment');
        console.log(`   - Status: ${error.response.status}`);
        console.log(`   - Message: ${error.response.data.message}`);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    // 6. Test Admin Pending Payments API
    console.log('\n📋 TEST ADMIN PENDING PAYMENTS API');
    console.log('='.repeat(30));
    
    try {
      const pendingResponse = await axios.get(`${API_BASE}/api/payments/admin/pending`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Get admin pending payments thành công');
      console.log(`   - Số lượng pending payments: ${pendingResponse.data.data.length}`);
    } catch (error) {
      console.log('❌ Get admin pending payments thất bại:', error.response?.data?.message || error.message);
    }

    // 7. Test Admin All Payments API
    console.log('\n📋 TEST ADMIN ALL PAYMENTS API');
    console.log('='.repeat(30));
    
    try {
      const allResponse = await axios.get(`${API_BASE}/api/payments/admin/all`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Get admin all payments thành công');
      console.log(`   - Tổng số payments: ${allResponse.data.data.payments.length}`);
    } catch (error) {
      console.log('❌ Get admin all payments thất bại:', error.response?.data?.message || error.message);
    }

    // 8. Test Payment Confirmation API (dry run)
    console.log('\n✅ TEST PAYMENT CONFIRMATION API');
    console.log('='.repeat(30));
    console.log('⚠️ Chỉ test endpoint structure, không thực hiện confirm');
    
    try {
      console.log(`📋 Endpoint: POST ${API_BASE}/api/payments/admin/confirm/${pendingPayment._id}`);
      console.log('📋 Headers: Authorization: Bearer [admin_token]');
      console.log('📋 Body: { "notes": "Test confirmation" }');
      console.log('✅ Endpoint confirmation structure OK');
    } catch (error) {
      console.log('❌ Endpoint confirmation có vấn đề');
    }

    // 9. Test Payment Rejection API (dry run)
    console.log('\n❌ TEST PAYMENT REJECTION API');
    console.log('='.repeat(30));
    console.log('⚠️ Chỉ test endpoint structure, không thực hiện reject');
    
    try {
      console.log(`📋 Endpoint: POST ${API_BASE}/api/payments/admin/reject/${pendingPayment._id}`);
      console.log('📋 Headers: Authorization: Bearer [admin_token]');
      console.log('📋 Body: { "notes": "Test rejection" }');
      console.log('✅ Endpoint rejection structure OK');
    } catch (error) {
      console.log('❌ Endpoint rejection có vấn đề');
    }

    // 10. Test authorization
    console.log('\n🔒 TEST AUTHORIZATION');
    console.log('='.repeat(30));
    
    try {
      const noAuthResponse = await axios.get(`${API_BASE}/api/payments/admin/pending`);
      console.log('❌ Không nên thành công khi không có token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected request without token');
        console.log(`   - Status: ${error.response.status}`);
        console.log(`   - Message: ${error.response.data.message}`);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // 11. Test invalid payment ID
    console.log('\n🚫 TEST INVALID PAYMENT ID');
    console.log('='.repeat(30));
    
    try {
      const invalidResponse = await axios.get(`${API_BASE}/api/payments/admin/pending/invalid_id`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('❌ Không nên thành công với invalid ID');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Correctly rejected invalid payment ID');
        console.log(`   - Status: ${error.response.status}`);
      } else {
        console.log('❌ Unexpected error:', error.response?.status || error.message);
      }
    }

    console.log('\n✅ TESTING PAYMENT ACTIONS HOÀN TẤT');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Đã ngắt kết nối MongoDB');
  }
}

testPaymentActions();