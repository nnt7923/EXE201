const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authenticateToken: auth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// @route   GET /api/subscriptions
// @desc    Get user's subscriptions
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.getUserSubscriptions(req.user._id || req.user.id);
    
    res.json({
      success: true,
      data: subscriptions
    });
  } catch (err) {
    console.error('Error fetching user subscriptions:', err);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách đăng ký'
    });
  }
});

// @route   GET /api/subscriptions/user
// @desc    Get user's subscriptions (alias for root route)
// @access  Private
router.get('/user', auth, async (req, res) => {
  console.log('🔍 /user route called, req.user:', req.user);
  try {
    const subscriptions = await Subscription.find({ user: req.user._id })
      .populate('plan', 'name price features description aiSuggestionLimit')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: subscriptions
    });
  } catch (err) {
    console.error('Error fetching user subscriptions:', err);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách đăng ký'
    });
  }
});

// @route   GET api/subscriptions/admin/all
// @desc    Get all subscriptions (Admin only)
// @access  Private/Admin
router.get('/admin/all', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;

    const subscriptions = await Subscription.find(query)
      .populate('user', 'name email')
      .populate('plan', 'name price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Subscription.countDocuments(query);

    res.json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: subscriptions.length,
          totalItems: total
        }
      }
    });
  } catch (err) {
    console.error('Error fetching all subscriptions:', err);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách đăng ký'
    });
  }
});

// @route   GET api/subscriptions/admin/stats
// @desc    Get subscription statistics (Admin only)
// @access  Private/Admin
router.get('/admin/stats', auth, authorize('admin'), async (req, res) => {
  try {
    const stats = await Subscription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalAmount' }
        }
      }
    ]);

    const totalSubscriptions = await Subscription.countDocuments();
    const totalRevenue = await Subscription.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.totalAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalSubscriptions,
        totalRevenue: totalRevenue[0]?.total || 0,
        statusBreakdown: stats
      }
    });
  } catch (err) {
    console.error('Error fetching subscription stats:', err);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thống kê đăng ký'
    });
  }
});

// @route   GET /api/subscriptions/analytics
// @desc    Get subscription analytics (admin only)
// @access  Private (Admin)
router.get('/analytics', auth, authorize('admin'), async (req, res) => {
  try {
    // Get total subscriptions count
    const totalSubscriptions = await Subscription.countDocuments();
    
    // Get active subscriptions count
    const activeSubscriptions = await Subscription.countDocuments({
      status: 'active',
      endDate: { $gt: new Date() }
    });
    
    // Calculate total revenue from paid subscriptions
    const revenueAggregation = await Subscription.aggregate([
      {
        $match: {
          paymentStatus: 'paid'
        }
      },
      {
        $lookup: {
          from: 'plans',
          localField: 'plan',
          foreignField: '_id',
          as: 'planDetails'
        }
      },
      {
        $unwind: '$planDetails'
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$planDetails.price' }
        }
      }
    ]);
    
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;
    
    res.json({
      success: true,
      data: {
        totalSubscriptions,
        activeSubscriptions,
        totalRevenue
      }
    });
  } catch (err) {
    console.error('Error fetching subscription analytics:', err);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin phân tích đăng ký'
    });
  }
});

// @route   GET api/subscriptions/:id
// @desc    Get subscription by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('user', 'name email')
      .populate('plan', 'name price features description');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đăng ký'
      });
    }

    // Check if user owns this subscription or is admin
    if (subscription.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập đăng ký này'
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (err) {
    console.error('Error fetching subscription:', err);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin đăng ký'
    });
  }
});

// @route   POST api/subscriptions
// @desc    Create new subscription
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      planId,
      customerInfo,
      paymentMethod,
      customerNotes
    } = req.body;

    // Validate required fields
    if (!planId || !customerInfo) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    // Check if plan exists
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy gói dịch vụ'
      });
    }

    // Check if user already has an active subscription for this plan
    const existingSubscription = await Subscription.findOne({
      user: req.user._id || req.user.id,
      plan: planId,
      status: { $in: ['active', 'pending'] },
      endDate: { $gt: new Date() } // Not expired
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: `Bạn đã có gói ${plan.name} đang hoạt động. Vui lòng chờ hết hạn hoặc hủy gói hiện tại trước khi đăng ký lại.`,
        data: {
          existingSubscription: {
            id: existingSubscription._id,
            endDate: existingSubscription.endDate,
            status: existingSubscription.status
          }
        }
      });
    }

    // Calculate pricing
    const planPrice = plan.price;
    const serviceFee = planPrice * 0.05; // 5% service fee for subscriptions
    const taxes = planPrice * 0.08; // 8% tax
    const totalAmount = planPrice + serviceFee + taxes;

    // Generate subscription number
    const subscriptionCount = await Subscription.countDocuments();
    const subscriptionNumber = `SUB${Date.now()}${String(subscriptionCount + 1).padStart(3, '0')}`;

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Default to 1 month subscription

    // Create subscription
    const subscription = new Subscription({
      subscriptionNumber,
      user: req.user._id || req.user.id,
      plan: planId,
      customerInfo,
      pricing: {
        planPrice,
        serviceFee,
        taxes,
        totalAmount
      },
      paymentMethod: paymentMethod || 'bank_transfer',
      startDate,
      endDate,
      notes: {
        customerNotes: customerNotes || ''
      }
    });

    const savedSubscription = await subscription.save();

    // Populate the subscription for response
    await savedSubscription.populate('plan', 'name price features description');

    // Create notification for subscription creation
    try {
      await Notification.create({
        user: req.user._id || req.user.id,
        type: 'subscription_created',
        title: 'Đăng ký gói dịch vụ thành công',
        message: `Bạn đã đăng ký gói ${plan.name}. Chúng tôi sẽ xác nhận thanh toán trong vòng 24 giờ.`,
        data: {
          subscriptionId: savedSubscription._id,
          planName: plan.name
        }
      });
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the subscription creation if notification fails
    }

    res.status(201).json({
      success: true,
      data: savedSubscription,
      message: 'Đăng ký gói dịch vụ thành công'
    });
  } catch (err) {
    console.error('Error creating subscription:', err);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo đăng ký'
    });
  }
});

// @route   PUT api/subscriptions/:id/status
// @desc    Update subscription status (Admin only)
// @access  Private/Admin
router.put('/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái đăng ký là bắt buộc'
      });
    }

    const subscription = await Subscription.findById(req.params.id)
      .populate('user', 'name email')
      .populate('plan', 'name');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đăng ký'
      });
    }

    const oldStatus = subscription.status;
    await subscription.updateStatus(status, adminNotes);

    // Create notification based on status change
    try {
      if (status === 'active' && oldStatus !== 'active') {
        await Notification.create({
          user: subscription.user._id,
          type: 'subscription_activated',
          title: 'Gói dịch vụ đã được kích hoạt',
          message: `Gói ${subscription.plan.name} của bạn đã được kích hoạt thành công.`,
          data: {
            subscriptionId: subscription._id,
            planName: subscription.plan.name
          }
        });
      } else if (status === 'cancelled' && oldStatus !== 'cancelled') {
        await Notification.create({
          user: subscription.user._id,
          type: 'subscription_cancelled',
          title: 'Gói dịch vụ đã bị hủy',
          message: `Gói ${subscription.plan.name} của bạn đã bị hủy. ${adminNotes || ''}`,
          data: {
            subscriptionId: subscription._id,
            planName: subscription.plan.name,
            reason: adminNotes
          }
        });
      }
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the status update if notification fails
    }

    res.json({
      success: true,
      data: subscription,
      message: 'Cập nhật trạng thái đăng ký thành công'
    });
  } catch (err) {
    console.error('Error updating subscription status:', err);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái đăng ký'
    });
  }
});

// @route   DELETE api/subscriptions/:id
// @desc    Delete subscription (Admin only)
// @access  Private/Admin
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đăng ký'
      });
    }

    await Subscription.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Xóa đăng ký thành công'
    });
  } catch (err) {
    console.error('Error deleting subscription:', err);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa đăng ký'
    });
  }
});

// @route   PUT api/subscriptions/:id/payment-status
// @desc    Update subscription payment status (Admin only)
// @access  Private/Admin
router.put('/:id/payment-status', auth, authorize('admin'), async (req, res) => {
  try {
    const { paymentStatus, adminNotes } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái thanh toán là bắt buộc'
      });
    }

    // Validate payment status
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái thanh toán không hợp lệ'
      });
    }

    const subscription = await Subscription.findById(req.params.id)
      .populate('user', 'name email')
      .populate('plan', 'name');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đăng ký'
      });
    }

    const oldPaymentStatus = subscription.paymentStatus;
    const oldSubscriptionStatus = subscription.status;

    // Update payment status
    subscription.paymentStatus = paymentStatus;
    
    // Auto-update subscription status based on payment status
    if (paymentStatus === 'paid' && subscription.status === 'pending') {
      subscription.status = 'active';
    } else if (paymentStatus === 'failed' && subscription.status !== 'cancelled') {
      subscription.status = 'cancelled';
    } else if (paymentStatus === 'refunded') {
      subscription.status = 'cancelled';
    }

    // Update admin notes if provided
    if (adminNotes) {
      subscription.notes = subscription.notes || {};
      subscription.notes.adminNotes = adminNotes;
    }

    await subscription.save();

    // Create notifications based on payment status change
    try {
      if (paymentStatus === 'paid' && oldPaymentStatus !== 'paid') {
        await Notification.create({
          user: subscription.user._id,
          type: 'payment_confirmed',
          title: 'Thanh toán đã được xác nhận',
          message: `Thanh toán cho gói ${subscription.plan.name} đã được xác nhận thành công.`,
          data: {
            subscriptionId: subscription._id,
            planName: subscription.plan.name,
            paymentStatus: paymentStatus
          }
        });

        // If subscription status also changed to active
        if (subscription.status === 'active' && oldSubscriptionStatus !== 'active') {
          await Notification.create({
            user: subscription.user._id,
            type: 'subscription_activated',
            title: 'Gói dịch vụ đã được kích hoạt',
            message: `Gói ${subscription.plan.name} của bạn đã được kích hoạt thành công sau khi xác nhận thanh toán.`,
            data: {
              subscriptionId: subscription._id,
              planName: subscription.plan.name
            }
          });
        }
      } else if (paymentStatus === 'failed' && oldPaymentStatus !== 'failed') {
        await Notification.create({
          user: subscription.user._id,
          type: 'payment_failed',
          title: 'Thanh toán thất bại',
          message: `Thanh toán cho gói ${subscription.plan.name} đã thất bại. Vui lòng liên hệ hỗ trợ.`,
          data: {
            subscriptionId: subscription._id,
            planName: subscription.plan.name,
            paymentStatus: paymentStatus
          }
        });
      } else if (paymentStatus === 'refunded' && oldPaymentStatus !== 'refunded') {
        await Notification.create({
          user: subscription.user._id,
          type: 'payment_refunded',
          title: 'Đã hoàn tiền',
          message: `Tiền thanh toán cho gói ${subscription.plan.name} đã được hoàn lại.`,
          data: {
            subscriptionId: subscription._id,
            planName: subscription.plan.name,
            paymentStatus: paymentStatus
          }
        });
      }
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the payment status update if notification fails
    }

    res.json({
      success: true,
      data: subscription,
      message: 'Cập nhật trạng thái thanh toán thành công',
      statusChanges: {
        paymentStatus: {
          from: oldPaymentStatus,
          to: paymentStatus
        },
        subscriptionStatus: {
          from: oldSubscriptionStatus,
          to: subscription.status
        }
      }
    });
  } catch (err) {
    console.error('Error updating payment status:', err);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái thanh toán'
    });
  }
});

module.exports = router;