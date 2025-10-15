const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['payment_confirmed', 'payment_rejected', 'subscription_expired', 'subscription_expiring'],
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
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    subscriptionPlan: {
      name: String,
      price: Number
    },
    subscriptionEndDate: Date
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

// Static method to create payment confirmation notification
notificationSchema.statics.createPaymentConfirmedNotification = async function(userId, payment) {
  return await this.create({
    user: userId,
    type: 'payment_confirmed',
    title: 'Thanh toán đã được xác nhận',
    message: `Thanh toán ${payment.amount.toLocaleString('vi-VN')}đ cho gói ${payment.subscriptionPlan.name} đã được xác nhận. Bạn có thể sử dụng tính năng AI ngay bây giờ!`,
    data: {
      paymentId: payment._id,
      subscriptionPlan: {
        name: payment.subscriptionPlan.name,
        price: payment.amount
      }
    }
  });
};

// Static method to create payment rejection notification
notificationSchema.statics.createPaymentRejectedNotification = async function(userId, payment, reason) {
  return await this.create({
    user: userId,
    type: 'payment_rejected',
    title: 'Thanh toán bị từ chối',
    message: `Thanh toán ${payment.amount.toLocaleString('vi-VN')}đ cho gói ${payment.subscriptionPlan.name} đã bị từ chối. ${reason ? `Lý do: ${reason}` : 'Vui lòng kiểm tra lại thông tin thanh toán.'}`,
    data: {
      paymentId: payment._id,
      subscriptionPlan: {
        name: payment.subscriptionPlan.name,
        price: payment.amount
      }
    }
  });
};

// Static method to create subscription expiring notification
notificationSchema.statics.createSubscriptionExpiringNotification = async function(userId, subscriptionEndDate, subscriptionPlan) {
  const daysLeft = Math.ceil((new Date(subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24));
  
  return await this.create({
    user: userId,
    type: 'subscription_expiring',
    title: 'Gói đăng ký sắp hết hạn',
    message: `Gói ${subscriptionPlan.name} của bạn sẽ hết hạn trong ${daysLeft} ngày. Vui lòng gia hạn để tiếp tục sử dụng tính năng AI.`,
    data: {
      subscriptionPlan: {
        name: subscriptionPlan.name,
        price: subscriptionPlan.price
      },
      subscriptionEndDate: subscriptionEndDate
    }
  });
};

// Static method to create subscription expired notification
notificationSchema.statics.createSubscriptionExpiredNotification = async function(userId, subscriptionPlan) {
  return await this.create({
    user: userId,
    type: 'subscription_expired',
    title: 'Gói đăng ký đã hết hạn',
    message: `Gói ${subscriptionPlan.name} của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng tính năng AI.`,
    data: {
      subscriptionPlan: {
        name: subscriptionPlan.name,
        price: subscriptionPlan.price
      }
    }
  });
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);