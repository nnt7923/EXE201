const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
const Payment = require('./models/Payment');
const SubscriptionPlan = require('./models/SubscriptionPlan');
require('dotenv').config();

const API_BASE = 'http://localhost:5000';

// Mock admin token (trong thực tế cần login để lấy token)
let adminToken = null;

async function testAllPaymentEndpoints() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công');

    console.log('\n🔍 TESTING ALL PAYMENT API ENDPOINTS');
    console.log('==================================================');

    // 1. Test Admin Login để lấy token
    console.log('\n1️⃣ TEST ADMIN LOGIN');
    console.log('------------------------------');
    try {
      const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
        email: 'admin@example.com',
        password: 'admin123'
      });
      
      console.log('📋 Login response:', JSON.stringify(loginResponse.data, null, 2));
      
      if (loginResponse.data.success && loginResponse.data.data?.token) {
        adminToken = loginResponse.data.data.token;
        console.log('✅ Admin login thành công');
      } else if (loginResponse.data.token) {
        adminToken = loginResponse.data.token;
        console.log('✅ Admin login thành công');
      } else {
        console.log('❌ Không lấy được admin token');
        console.log('📋 Response structure:', Object.keys(loginResponse.data));
      }
    } catch (error) {
      console.log('❌ Admin login thất bại:', error.response?.data?.message || error.message);
      if (error.response?.data) {
        console.log('📋 Error response:', JSON.stringify(error.response.data, null, 2));
      }
      console.log('⚠️ Sẽ test các endpoint không cần auth trước');
    }

    // 2. Test Get Subscription Plans
    console.log('\n2️⃣ TEST GET SUBSCRIPTION PLANS');
    console.log('------------------------------');
    try {
      const plansResponse = await axios.get(`${API_BASE}/api/plans`);
      console.log('✅ Get subscription plans thành công');
      console.log('📋 Plans response:', JSON.stringify(plansResponse.data, null, 2));
      
      const plans = plansResponse.data.success ? plansResponse.data.data : plansResponse.data;
      if (Array.isArray(plans)) {
        console.log(`📊 Số lượng plans: ${plans.length}`);
        plans.forEach(plan => {
          console.log(`   - ${plan.name}: ${plan.price} VND`);
        });
      } else {
        console.log('❌ Response không phải array:', typeof plans);
      }
    } catch (error) {
      console.log('❌ Get subscription plans thất bại:', error.response?.data?.message || error.message);
      if (error.response?.data) {
        console.log('📋 Error response:', JSON.stringify(error.response.data, null, 2));
      }
    }

    // 3. Test Admin Pending Payments (cần auth)
    console.log('\n3️⃣ TEST ADMIN PENDING PAYMENTS');
    console.log('------------------------------');
    if (adminToken) {
      try {
        const pendingResponse = await axios.get(`${API_BASE}/api/payments/admin/pending`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Get admin pending payments thành công');
        
        const pendingPayments = pendingResponse.data.success ? pendingResponse.data.data : pendingResponse.data;
        if (Array.isArray(pendingPayments)) {
          console.log(`📊 Số lượng pending payments: ${pendingPayments.length}`);
          pendingPayments.forEach(payment => {
            console.log(`   - ${payment.user?.name}: ${payment.amount} VND (${payment.subscriptionPlan?.name})`);
          });
        } else {
          console.log('❌ Response không phải array:', typeof pendingPayments);
          console.log('📋 Response:', JSON.stringify(pendingResponse.data, null, 2));
        }
      } catch (error) {
        console.log('❌ Get admin pending payments thất bại:', error.response?.data?.message || error.message);
        if (error.response?.data) {
          console.log('📋 Error response:', JSON.stringify(error.response.data, null, 2));
        }
      }
    } else {
      console.log('⚠️ Bỏ qua test này vì không có admin token');
    }

    // 4. Test Admin All Payments (cần auth)
    console.log('\n4️⃣ TEST ADMIN ALL PAYMENTS');
    console.log('------------------------------');
    if (adminToken) {
      try {
        const allResponse = await axios.get(`${API_BASE}/api/payments/admin/all`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Get admin all payments thành công');
        
        const allPayments = allResponse.data.success ? allResponse.data.data?.payments : allResponse.data;
        if (Array.isArray(allPayments)) {
          console.log(`📊 Tổng số payments: ${allPayments.length}`);
          allPayments.forEach(payment => {
            console.log(`   - ${payment.user?.name}: ${payment.amount} VND (${payment.status})`);
          });
        } else {
          console.log('❌ Response không phải array:', typeof allPayments);
          console.log('📋 Response:', JSON.stringify(allResponse.data, null, 2));
        }
      } catch (error) {
        console.log('❌ Get admin all payments thất bại:', error.response?.data?.message || error.message);
        if (error.response?.data) {
          console.log('📋 Error response:', JSON.stringify(error.response.data, null, 2));
        }
      }
    } else {
      console.log('⚠️ Bỏ qua test này vì không có admin token');
    }

    // 5. Test Payment Submission (không cần auth, nhưng cần user token)
    console.log('\n5️⃣ TEST PAYMENT SUBMISSION');
    console.log('------------------------------');
    console.log('⚠️ Bỏ qua test này để tránh tạo payment duplicate');
    console.log('   (Endpoint này cần user token và sẽ tạo payment mới)');

    // 6. Test Payment Confirmation (cần admin auth)
    console.log('\n6️⃣ TEST PAYMENT CONFIRMATION');
    console.log('------------------------------');
    if (adminToken) {
      // Lấy payment ID hiện tại
      const currentPayment = await Payment.findOne({ status: 'pending' });
      if (currentPayment) {
        console.log(`📋 Tìm thấy pending payment: ${currentPayment._id}`);
        console.log('⚠️ Bỏ qua test confirm để giữ nguyên trạng thái pending');
        console.log('   (Có thể test bằng cách gọi PUT /api/payments/admin/confirm/:id)');
      } else {
        console.log('❌ Không tìm thấy pending payment để test');
      }
    } else {
      console.log('⚠️ Bỏ qua test này vì không có admin token');
    }

    // 7. Test Payment Rejection (cần admin auth)
    console.log('\n7️⃣ TEST PAYMENT REJECTION');
    console.log('------------------------------');
    if (adminToken) {
      console.log('⚠️ Bỏ qua test reject để giữ nguyên trạng thái pending');
      console.log('   (Có thể test bằng cách gọi PUT /api/payments/admin/reject/:id)');
    } else {
      console.log('⚠️ Bỏ qua test này vì không có admin token');
    }

    // 8. Test API Health Check
    console.log('\n8️⃣ TEST API HEALTH CHECK');
    console.log('------------------------------');
    try {
      const healthResponse = await axios.get(`${API_BASE}/api/health`);
      console.log('✅ API health check thành công');
      console.log(`📊 Status: ${healthResponse.data.status}`);
    } catch (error) {
      console.log('❌ API health check thất bại:', error.response?.data?.message || error.message);
    }

    // 9. Test Database Connection Status
    console.log('\n9️⃣ TEST DATABASE CONNECTION');
    console.log('------------------------------');
    const dbState = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    console.log(`✅ Database state: ${states[dbState]}`);

    console.log('\n✅ TESTING HOÀN TẤT');
    console.log('==================================================');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Đã ngắt kết nối MongoDB');
  }
}

testAllPaymentEndpoints();