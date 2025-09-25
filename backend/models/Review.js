const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place',
    required: [true, 'Địa điểm là bắt buộc']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người dùng là bắt buộc']
  },
  rating: {
    type: Number,
    required: [true, 'Đánh giá là bắt buộc'],
    min: [1, 'Đánh giá tối thiểu là 1 sao'],
    max: [5, 'Đánh giá tối đa là 5 sao']
  },
  title: {
    type: String,
    required: [true, 'Tiêu đề đánh giá là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tiêu đề không được quá 100 ký tự']
  },
  content: {
    type: String,
    required: [true, 'Nội dung đánh giá là bắt buộc'],
    maxlength: [1000, 'Nội dung không được quá 1000 ký tự']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String
  }],
  aspects: {
    food: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String
    },
    service: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String
    },
    atmosphere: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String
    },
    value: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String
    }
  },
  visitDate: {
    type: Date,
    required: [true, 'Ngày ghé thăm là bắt buộc']
  },
  visitType: {
    type: String,
    enum: {
      values: ['dine-in', 'takeaway', 'delivery', 'drive-through'],
      message: 'Loại hình ghé thăm không hợp lệ'
    },
    default: 'dine-in'
  },
  pricePaid: {
    type: Number,
    min: [0, 'Số tiền thanh toán không được âm']
  },
  groupSize: {
    type: Number,
    min: [1, 'Số lượng người phải ít nhất là 1'],
    max: [20, 'Số lượng người không được quá 20']
  },
  tags: [{
    type: String,
    trim: true
  }],
  helpful: {
    count: {
      type: Number,
      default: 0,
      min: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  response: {
    content: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate reviews
reviewSchema.index({ place: 1, user: 1 }, { unique: true });

// Index for place reviews
reviewSchema.index({ place: 1, createdAt: -1 });

// Index for user reviews
reviewSchema.index({ user: 1, createdAt: -1 });

// Index for rating
reviewSchema.index({ rating: 1 });

// Virtual for helpful percentage
reviewSchema.virtual('helpfulPercentage').get(function() {
  if (this.helpful.count === 0) return 0;
  return Math.round((this.helpful.count / this.helpful.users.length) * 100);
});

// Method to check if user has marked as helpful
reviewSchema.methods.isHelpfulByUser = function(userId) {
  return this.helpful.users.includes(userId);
};

// Method to toggle helpful status
reviewSchema.methods.toggleHelpful = function(userId) {
  const userIndex = this.helpful.users.indexOf(userId);
  
  if (userIndex > -1) {
    // User has already marked as helpful, remove it
    this.helpful.users.splice(userIndex, 1);
    this.helpful.count = Math.max(0, this.helpful.count - 1);
  } else {
    // User hasn't marked as helpful, add it
    this.helpful.users.push(userId);
    this.helpful.count += 1;
  }
  
  return this.save();
};

module.exports = mongoose.model('Review', reviewSchema);
