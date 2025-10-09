const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    unique: true,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  features: {
    type: [String],
    required: true,
  },
  aiSuggestionLimit: {
    type: Number,
    required: true,
    // Use -1 for unlimited
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
