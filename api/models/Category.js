const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true, // e.g., 'restaurant', 'cafe'
    trim: true
  },
  name: {
    type: String,
    required: true, // e.g., 'Nhà hàng', 'Cà phê'
    trim: true
  },
  subcategories: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
