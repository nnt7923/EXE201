const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'order_confirmed', 
      'order_cancelled', 
      'order_completed',
      'subscription_created',
      'subscription_activated',
      'subscription_expired',
      'booking_confirmed',
      'booking_cancelled',
      'booking_completed'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    orderDetails: {
      placeName: String,
      totalAmount: Number
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription'
    },
    subscriptionDetails: {
      planName: String,
      amount: Number,
      expiresAt: Date
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    bookingDetails: {
      placeName: String,
      checkInDate: Date,
      checkOutDate: Date,
      totalAmount: Number
    }
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

// Static method to create order confirmation notification
notificationSchema.statics.createOrderConfirmedNotification = async function(userId, order) {
  return await this.create({
    user: userId,
    type: 'order_confirmed',
    title: 'Đơn hàng đã được xác nhận',
    message: `Đơn hàng ${order.orderNumber} với tổng giá trị ${order.pricing.totalAmount.toLocaleString('vi-VN')}đ đã được xác nhận. Chúng tôi sẽ liên hệ với bạn sớm nhất!`,
    data: {
      orderId: order._id,
      orderDetails: {
        placeName: order.place?.name || 'Địa điểm',
        totalAmount: order.pricing.totalAmount
      }
    }
  });
};

// Static method to create order cancellation notification
notificationSchema.statics.createOrderCancelledNotification = async function(userId, order, reason) {
  return await this.create({
    user: userId,
    type: 'order_cancelled',
    title: 'Đơn hàng đã bị hủy',
    message: `Đơn hàng ${order.orderNumber} đã bị hủy. ${reason ? `Lý do: ${reason}` : 'Vui lòng liên hệ với chúng tôi để biết thêm chi tiết.'}`,
    data: {
      orderId: order._id,
      orderDetails: {
        placeName: order.place?.name || 'Địa điểm',
        totalAmount: order.pricing.totalAmount
      }
    }
  });
};

// Static method to create order completion notification
notificationSchema.statics.createOrderCompletedNotification = async function(userId, order) {
  return await this.create({
    user: userId,
    type: 'order_completed',
    title: 'Đơn hàng đã hoàn thành',
    message: `Đơn hàng ${order.orderNumber} đã được hoàn thành thành công. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!`,
    data: {
      orderId: order._id,
      orderDetails: {
        placeName: order.place?.name || 'Địa điểm',
        totalAmount: order.pricing.totalAmount
      }
    }
  });
};

// Static method to create subscription notifications
notificationSchema.statics.createSubscriptionNotification = async function(userId, subscription, type) {
  const titles = {
    'subscription_created': 'Gói đăng ký đã được tạo',
    'subscription_activated': 'Gói đăng ký đã được kích hoạt',
    'subscription_expired': 'Gói đăng ký đã hết hạn'
  };
  
  const messages = {
    'subscription_created': `Gói ${subscription.plan?.name || 'Premium'} đã được tạo thành công.`,
    'subscription_activated': `Gói ${subscription.plan?.name || 'Premium'} đã được kích hoạt và có hiệu lực.`,
    'subscription_expired': `Gói ${subscription.plan?.name || 'Premium'} đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng.`
  };

  return await this.create({
    user: userId,
    type: type,
    title: titles[type],
    message: messages[type],
    data: {
      subscriptionId: subscription._id,
      subscriptionDetails: {
        planName: subscription.plan?.name || 'Premium',
        amount: subscription.amount,
        expiresAt: subscription.expiresAt
      }
    }
  });
};

// Static method to create booking notifications
notificationSchema.statics.createBookingNotification = async function(userId, booking, type) {
  const titles = {
    'booking_confirmed': 'Đặt phòng đã được xác nhận',
    'booking_cancelled': 'Đặt phòng đã bị hủy',
    'booking_completed': 'Đặt phòng đã hoàn thành'
  };
  
  const messages = {
    'booking_confirmed': `Đặt phòng tại ${booking.place?.name || 'địa điểm'} đã được xác nhận.`,
    'booking_cancelled': `Đặt phòng tại ${booking.place?.name || 'địa điểm'} đã bị hủy.`,
    'booking_completed': `Đặt phòng tại ${booking.place?.name || 'địa điểm'} đã hoàn thành. Cảm ơn bạn đã sử dụng dịch vụ!`
  };

  return await this.create({
    user: userId,
    type: type,
    title: titles[type],
    message: messages[type],
    data: {
      bookingId: booking._id,
      bookingDetails: {
        placeName: booking.place?.name || 'Địa điểm',
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        totalAmount: booking.totalAmount
      }
    }
  });
};

// Instance method to mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);