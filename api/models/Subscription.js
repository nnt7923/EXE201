const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  subscriptionNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  customerInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: String
  },
  pricing: {
    planPrice: {
      type: Number,
      required: true
    },
    serviceFee: {
      type: Number,
      default: 0
    },
    taxes: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'cancelled', 'expired'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'credit_card'],
    default: 'bank_transfer'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  notes: {
    adminNotes: String,
    customerNotes: String
  },
  aiUsageCount: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update updatedAt
subscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to set endDate if not provided (default to 1 year)
subscriptionSchema.pre('save', function(next) {
  if (!this.endDate) {
    this.endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
  }
  next();
});

// Virtual for subscription duration in days
subscriptionSchema.virtual('duration').get(function() {
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

// Method to update subscription status
subscriptionSchema.methods.updateStatus = function(newStatus, adminNotes = '') {
  this.status = newStatus;
  if (adminNotes) {
    this.notes.adminNotes = adminNotes;
  }
  return this.save();
};

// Static method to get subscriptions by status
subscriptionSchema.statics.getSubscriptionsByStatus = function(status) {
  return this.find({ status })
    .populate('user', 'name email')
    .populate('plan', 'name price')
    .sort({ createdAt: -1 });
};

// Static method to get user subscriptions
subscriptionSchema.statics.getUserSubscriptions = function(userId) {
  return this.find({ user: userId })
    .populate('plan', 'name price features description aiSuggestionLimit')
    .sort({ createdAt: -1 });
};

// Indexes for efficient querying
subscriptionSchema.index({ user: 1, createdAt: -1 });
subscriptionSchema.index({ plan: 1, createdAt: -1 });
subscriptionSchema.index({ status: 1, createdAt: -1 });
// subscriptionNumber index is already created by unique: true

module.exports = mongoose.model('Subscription', subscriptionSchema);