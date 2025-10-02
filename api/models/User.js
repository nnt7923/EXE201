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
  purchaseHistory: [{
    packageId: mongoose.Schema.Types.ObjectId,
    packageName: String,
    amount: Number,
    creditsGained: Number,
    purchaseDate: { type: Date, default: Date.now },
    stripePaymentId: String
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);