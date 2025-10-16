const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Place = require('../models/Place');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authenticateToken: auth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// @route   GET api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.getUserOrders(req.user.id);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách đơn hàng'
    });
  }
});

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('place', 'name address images pricing');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập đơn hàng này'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin đơn hàng'
    });
  }
});

// @route   POST api/orders
// @desc    Create new order
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      placeId,
      customerInfo,
      orderDetails,
      paymentMethod,
      customerNotes
    } = req.body;

    // Validate required fields
    if (!placeId || !customerInfo || !orderDetails) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    // Check if place exists
    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa điểm'
      });
    }

    // Calculate pricing
    const duration = Math.ceil(
      (new Date(orderDetails.checkOutDate) - new Date(orderDetails.checkInDate)) / 
      (1000 * 60 * 60 * 24)
    );
    
    const pricePerDay = place.pricing.minPrice || place.pricing.maxPrice || 100000;
    const basePrice = Number(pricePerDay) * duration * orderDetails.numberOfGuests;
    
    const serviceFee = basePrice * 0.1; // 10% service fee
    const taxes = basePrice * 0.08; // 8% tax
    const totalAmount = basePrice + serviceFee + taxes;

    // Generate order number manually
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD${Date.now()}${String(orderCount + 1).padStart(3, '0')}`;

    // Create order
    const order = new Order({
      orderNumber,
      user: req.user.id,
      place: placeId,
      customerInfo,
      orderDetails,
      pricing: {
        basePrice,
        serviceFee,
        taxes,
        totalAmount
      },
      paymentMethod: paymentMethod || 'cash',
      notes: {
        customerNotes: customerNotes || ''
      }
    });

    const savedOrder = await order.save();

    // Populate the order for response
    await savedOrder.populate('place', 'name address images');

    // Create notification for order creation
    await Notification.createOrderConfirmedNotification(req.user.id, savedOrder);

    res.status(201).json({
      success: true,
      data: order,
      message: 'Đơn hàng đã được tạo thành công'
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo đơn hàng'
    });
  }
});

// @route   PUT api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private/Admin
router.put('/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái đơn hàng là bắt buộc'
      });
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('place', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const oldStatus = order.status;
    await order.updateStatus(status, adminNotes);

    // Create notification based on status change
    if (status === 'confirmed' && oldStatus !== 'confirmed') {
      await Notification.createOrderConfirmedNotification(order.user._id, order);
    } else if (status === 'cancelled' && oldStatus !== 'cancelled') {
      await Notification.createOrderCancelledNotification(order.user._id, order, adminNotes);
    } else if (status === 'completed' && oldStatus !== 'completed') {
      await Notification.createOrderCompletedNotification(order.user._id, order);
    }

    res.json({
      success: true,
      data: order,
      message: 'Cập nhật trạng thái đơn hàng thành công'
    });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái đơn hàng'
    });
  }
});

// @route   DELETE api/orders/:id
// @desc    Cancel order (User can cancel pending orders)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Check if user owns this order or is admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền hủy đơn hàng này'
      });
    }

    // Only allow cancellation of pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể hủy đơn hàng đang chờ xử lý'
      });
    }

    await order.updateStatus('cancelled', 'Đơn hàng đã được hủy bởi khách hàng');

    res.json({
      success: true,
      message: 'Đơn hàng đã được hủy thành công'
    });
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({
      success: false,
      message: 'Không thể hủy đơn hàng'
    });
  }
});

// Admin routes

// @route   GET api/orders/admin/all
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get('/admin/all', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('place', 'name address')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách đơn hàng'
    });
  }
});

// @route   GET api/orders/admin/stats
// @desc    Get order statistics (Admin only)
// @access  Private/Admin
router.get('/admin/stats', auth, authorize('admin'), async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$pricing.totalAmount' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
    ]);

    res.json({
      success: true,
      data: {
        statusBreakdown: stats,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (err) {
    console.error('Error fetching order stats:', err);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thống kê đơn hàng'
    });
  }
});

module.exports = router;