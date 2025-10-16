const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người dùng là bắt buộc']
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place',
    required: [true, 'Địa điểm là bắt buộc']
  },
  customerInfo: {
    name: {
      type: String,
      required: [true, 'Tên khách hàng là bắt buộc'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
    }
  },
  bookingDetails: {
    checkInDate: {
      type: Date,
      required: [true, 'Ngày nhận phòng là bắt buộc']
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Ngày trả phòng là bắt buộc']
    },
    numberOfGuests: {
      type: Number,
      required: [true, 'Số lượng khách là bắt buộc'],
      min: [1, 'Số lượng khách phải ít nhất là 1'],
      max: [20, 'Số lượng khách không được quá 20']
    },
    numberOfRooms: {
      type: Number,
      required: [true, 'Số lượng phòng là bắt buộc'],
      min: [1, 'Số lượng phòng phải ít nhất là 1'],
      max: [10, 'Số lượng phòng không được quá 10']
    },
    roomType: {
      type: String,
      enum: ['standard', 'deluxe', 'suite', 'family', 'dormitory'],
      default: 'standard'
    },
    specialRequests: {
      type: String,
      maxlength: [500, 'Yêu cầu đặc biệt không được quá 500 ký tự']
    }
  },
  pricing: {
    roomPrice: {
      type: Number,
      required: [true, 'Giá phòng là bắt buộc'],
      min: [0, 'Giá phòng không được âm']
    },
    serviceFee: {
      type: Number,
      default: 0,
      min: [0, 'Phí dịch vụ không được âm']
    },
    taxes: {
      type: Number,
      default: 0,
      min: [0, 'Thuế không được âm']
    },
    totalAmount: {
      type: Number,
      required: [true, 'Tổng tiền là bắt buộc'],
      min: [0, 'Tổng tiền không được âm']
    },
    currency: {
      type: String,
      default: 'VND'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show'],
      message: 'Trạng thái booking không hợp lệ'
    },
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'partially-paid', 'refunded', 'failed'],
      message: 'Trạng thái thanh toán không hợp lệ'
    },
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit-card', 'bank-transfer', 'e-wallet'],
    default: 'cash'
  },
  notes: {
    customerNotes: {
      type: String,
      maxlength: [1000, 'Ghi chú khách hàng không được quá 1000 ký tự']
    },
    adminNotes: {
      type: String,
      maxlength: [1000, 'Ghi chú admin không được quá 1000 ký tự']
    }
  },
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      maxlength: [500, 'Lý do hủy không được quá 500 ký tự']
    },
    refundAmount: {
      type: Number,
      min: [0, 'Số tiền hoàn lại không được âm']
    }
  },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }
}, {
  timestamps: true
});

// Tạo booking number tự động
bookingSchema.pre('save', async function(next) {
  if (!this.bookingNumber) {
    const count = await mongoose.model('Booking').countDocuments();
    this.bookingNumber = `BK${Date.now().toString().slice(-6)}${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Validate ngày check-in và check-out
bookingSchema.pre('save', function(next) {
  if (this.bookingDetails.checkInDate >= this.bookingDetails.checkOutDate) {
    next(new Error('Ngày trả phòng phải sau ngày nhận phòng'));
  }
  
  if (this.bookingDetails.checkInDate < new Date()) {
    next(new Error('Ngày nhận phòng không được trong quá khứ'));
  }
  
  next();
});

// Tính tổng số ngày ở
bookingSchema.virtual('numberOfNights').get(function() {
  const checkIn = new Date(this.bookingDetails.checkInDate);
  const checkOut = new Date(this.bookingDetails.checkOutDate);
  const diffTime = Math.abs(checkOut - checkIn);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Index cho tìm kiếm
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ place: 1, 'bookingDetails.checkInDate': 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingNumber: 1 });

module.exports = mongoose.model('Booking', bookingSchema);