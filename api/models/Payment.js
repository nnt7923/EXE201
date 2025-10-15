const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscriptionPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'VND'
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer'],
    default: 'bank_transfer'
  },
  bankTransferInfo: {
    bankName: {
      type: String,
      required: true
    },
    accountNumber: {
      type: String,
      required: true
    },
    accountHolder: {
      type: String,
      required: true
    },
    transferAmount: {
      type: Number,
      required: true
    },
    transferDate: {
      type: Date,
      required: true
    },
    transferNote: {
      type: String
    },
    transferReference: {
      type: String
    }
  },
  proofOfPayment: {
    type: String, // URL to uploaded image/document
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String
  },
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  confirmedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  subscriptionStartDate: {
    type: Date
  },
  subscriptionEndDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// Virtual for subscription duration in days
paymentSchema.virtual('subscriptionDuration').get(function() {
  if (this.subscriptionStartDate && this.subscriptionEndDate) {
    return Math.ceil((this.subscriptionEndDate - this.subscriptionStartDate) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Method to confirm payment
paymentSchema.methods.confirmPayment = function(adminId, startDate, endDate, notes) {
  this.status = 'confirmed';
  this.confirmedBy = adminId;
  this.confirmedAt = new Date();
  this.subscriptionStartDate = startDate;
  this.subscriptionEndDate = endDate;
  if (notes) this.adminNotes = notes;
  return this.save();
};

// Method to reject payment
paymentSchema.methods.rejectPayment = function(adminId, notes) {
  this.status = 'rejected';
  this.confirmedBy = adminId;
  this.rejectedAt = new Date();
  if (notes) this.adminNotes = notes;
  return this.save();
};

// Static method to get pending payments
paymentSchema.statics.getPendingPayments = function() {
  return this.find({ status: 'pending' })
    .populate('user', 'name email')
    .populate('subscriptionPlan', 'name price duration')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Payment', paymentSchema);