const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'owner', 'admin'],
    default: 'user',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  credits: {
    type: Number,
    default: 0
  },
  subscriptionPlan: {
    type: mongoose.Schema.ObjectId,
    ref: 'SubscriptionPlan',
  },
  subscriptionStatus: {
    type: String,
    enum: ['none', 'pending_payment', 'active', 'expired', 'cancelled'],
    default: 'none'
  },
  subscriptionStartDate: {
    type: Date,
  },
  subscriptionEndDate: {
    type: Date,
  },
  paymentStatus: {
    type: String,
    enum: ['none', 'pending', 'confirmed', 'rejected'],
    default: 'none'
  },
  currentPayment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Payment',
  },
  aiSuggestionsUsed: {
    type: Number,
    default: 0,
  },
  aiSuggestionsLimit: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual for checking if subscription is active
UserSchema.virtual('isSubscriptionActive').get(function() {
  return this.subscriptionStatus === 'active' && 
         this.subscriptionEndDate && 
         this.subscriptionEndDate > new Date();
});

// Method to check if user can access AI features
UserSchema.methods.canAccessAI = function() {
  return this.isSubscriptionActive && this.paymentStatus === 'confirmed';
};

// Method to check if user has remaining AI suggestions
UserSchema.methods.hasAISuggestionsLeft = function() {
  if (!this.canAccessAI()) return false;
  if (this.aiSuggestionsLimit === -1) return true; // Unlimited
  return this.aiSuggestionsUsed < this.aiSuggestionsLimit;
};

// Method to use AI suggestion
UserSchema.methods.useAISuggestion = function() {
  if (!this.hasAISuggestionsLeft()) {
    throw new Error('No AI suggestions remaining');
  }
  this.aiSuggestionsUsed += 1;
  return this.save();
};

// Method to activate subscription after payment confirmation
UserSchema.methods.activateSubscription = function(plan, startDate, endDate) {
  this.subscriptionStatus = 'active';
  this.subscriptionPlan = plan._id;
  this.subscriptionStartDate = startDate;
  this.subscriptionEndDate = endDate;
  this.paymentStatus = 'confirmed';
  
  // Set AI suggestions limit based on plan
  if (plan.name === 'Unlimited') {
    this.aiSuggestionsLimit = -1; // Unlimited
  } else if (plan.name === 'Professional') {
    this.aiSuggestionsLimit = 100; // 100 per month
  } else {
    this.aiSuggestionsLimit = 10; // 10 per month for Basic
  }
  
  this.aiSuggestionsUsed = 0; // Reset usage
  return this.save();
};

// Method to check subscription expiry
UserSchema.methods.checkSubscriptionExpiry = function() {
  if (this.subscriptionEndDate && this.subscriptionEndDate <= new Date()) {
    this.subscriptionStatus = 'expired';
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model('User', UserSchema);