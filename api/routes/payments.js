const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Notification = require('../models/Notification');
const { authenticateToken: auth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');

// @route   POST /api/payments/submit
// @desc    Submit bank transfer payment
// @access  Private
router.post('/submit', auth, upload.single('proofOfPayment'), async (req, res) => {
  try {
    const {
      subscriptionPlanId,
      bankName,
      accountNumber,
      accountHolder,
      transferAmount,
      transferDate,
      transferNote,
      transferReference
    } = req.body;

    // Validate required fields
    if (!subscriptionPlanId || !bankName || !accountNumber || !accountHolder || 
        !transferAmount || !transferDate || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin thanh toán và ảnh chứng minh'
      });
    }

    // Check if subscription plan exists
    const subscriptionPlan = await SubscriptionPlan.findById(subscriptionPlanId);
    if (!subscriptionPlan) {
      return res.status(404).json({
        success: false,
        message: 'Gói đăng ký không tồn tại'
      });
    }

    // Check if user already has pending payment
    const existingPayment = await Payment.findOne({
      user: req.user.id,
      status: 'pending'
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã có một thanh toán đang chờ xác nhận'
      });
    }

    // Validate transfer amount matches plan price
    if (parseFloat(transferAmount) !== subscriptionPlan.price) {
      return res.status(400).json({
        success: false,
        message: `Số tiền chuyển khoản phải bằng ${subscriptionPlan.price.toLocaleString()} VND`
      });
    }

    // Create payment record
    const payment = new Payment({
      user: req.user.id,
      subscriptionPlan: subscriptionPlanId,
      amount: subscriptionPlan.price,
      bankTransferInfo: {
        bankName,
        accountNumber,
        accountHolder,
        transferAmount: parseFloat(transferAmount),
        transferDate: new Date(transferDate),
        transferNote,
        transferReference
      },
      proofOfPayment: req.file.path // Cloudinary URL
    });

    await payment.save();

    // Update user status
    const user = await User.findById(req.user.id);
    user.subscriptionStatus = 'pending_payment';
    user.paymentStatus = 'pending';
    user.currentPayment = payment._id;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Thông tin thanh toán đã được gửi. Vui lòng chờ admin xác nhận.',
      data: {
        paymentId: payment._id,
        status: payment.status,
        amount: payment.amount,
        submittedAt: payment.createdAt
      }
    });

  } catch (error) {
    console.error('Payment submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xử lý thanh toán'
    });
  }
});

// @route   GET /api/payments/my-payments
// @desc    Get user's payment history
// @access  Private
router.get('/my-payments', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('subscriptionPlan', 'name price duration')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: payments
    });

  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy lịch sử thanh toán'
    });
  }
});

// @route   GET /api/payments/status/:paymentId
// @desc    Get payment status
// @access  Private
router.get('/status/:paymentId', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.paymentId,
      user: req.user.id
    }).populate('subscriptionPlan', 'name price duration');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thanh toán'
      });
    }

    res.json({
      success: true,
      data: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
        subscriptionPlan: payment.subscriptionPlan,
        submittedAt: payment.createdAt,
        confirmedAt: payment.confirmedAt,
        rejectedAt: payment.rejectedAt,
        adminNotes: payment.adminNotes,
        subscriptionStartDate: payment.subscriptionStartDate,
        subscriptionEndDate: payment.subscriptionEndDate
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy trạng thái thanh toán'
    });
  }
});

// ADMIN ROUTES

// @route   GET /api/payments/admin/pending
// @desc    Get all pending payments for admin
// @access  Private (Admin only)
router.get('/admin/pending', auth, authorize('admin'), async (req, res) => {
  try {
    const payments = await Payment.getPendingPayments();

    res.json({
      success: true,
      data: payments
    });

  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách thanh toán chờ xác nhận'
    });
  }
});

// @route   GET /api/payments/admin/all
// @desc    Get all payments for admin
// @access  Private (Admin only)
router.get('/admin/all', auth, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .populate('subscriptionPlan', 'name price duration')
      .populate('confirmedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: {
        payments,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách thanh toán'
    });
  }
});

// @route   POST /api/payments/admin/confirm/:paymentId
// @desc    Confirm payment by admin
// @access  Private (Admin only)
router.post('/admin/confirm/:paymentId', auth, authorize('admin'), async (req, res) => {
  try {
    const { notes } = req.body;
    
    const payment = await Payment.findById(req.params.paymentId)
      .populate('user')
      .populate('subscriptionPlan');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thanh toán'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Thanh toán này đã được xử lý'
      });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + payment.subscriptionPlan.duration);

    // Confirm payment
    await payment.confirmPayment(req.user.id, startDate, endDate, notes);

    // Activate user subscription
    await payment.user.activateSubscription(payment.subscriptionPlan, startDate, endDate);

    // Create notification for user
    await Notification.createPaymentConfirmedNotification(payment.user._id, payment);

    res.json({
      success: true,
      message: 'Thanh toán đã được xác nhận thành công',
      data: {
        paymentId: payment._id,
        userId: payment.user._id,
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate
      }
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác nhận thanh toán'
    });
  }
});

// @route   POST /api/payments/admin/reject/:paymentId
// @desc    Reject payment by admin
// @access  Private (Admin only)
router.post('/admin/reject/:paymentId', auth, authorize('admin'), async (req, res) => {
  try {
    const { notes } = req.body;
    
    const payment = await Payment.findById(req.params.paymentId)
      .populate('user');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thanh toán'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Thanh toán này đã được xử lý'
      });
    }

    // Reject payment
    await payment.rejectPayment(req.user.id, notes);

    // Update user status
    const user = payment.user;
    user.subscriptionStatus = 'none';
    user.paymentStatus = 'rejected';
    user.currentPayment = null;
    await user.save();

    // Create notification for user
    await Notification.createPaymentRejectedNotification(payment.user._id, payment, notes);

    res.json({
      success: true,
      message: 'Thanh toán đã bị từ chối',
      data: {
        paymentId: payment._id,
        userId: payment.user._id,
        rejectedAt: payment.rejectedAt,
        adminNotes: payment.adminNotes
      }
    });

  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi từ chối thanh toán'
    });
  }
});

module.exports = router;