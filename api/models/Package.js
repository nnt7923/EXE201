const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên gói là bắt buộc'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Giá tiền là bắt buộc'],
    min: [0, 'Giá tiền không được âm']
  },
  credits: {
    type: Number,
    required: [true, 'Số lượt tạo là bắt buộc'],
    min: [1, 'Số lượt tạo phải ít nhất là 1']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Package', packageSchema);
