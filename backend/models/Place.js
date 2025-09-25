const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên địa điểm là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tên không được quá 100 ký tự']
  },
  description: {
    type: String,
    required: [true, 'Mô tả là bắt buộc'],
    maxlength: [1000, 'Mô tả không được quá 1000 ký tự']
  },
  category: {
    type: String,
    required: [true, 'Danh mục là bắt buộc'],
    enum: {
      values: ['restaurant', 'cafe', 'accommodation', 'entertainment', 'study'],
      message: 'Danh mục không hợp lệ'
    }
  },
  subcategory: {
    type: String,
    required: [true, 'Danh mục con là bắt buộc']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Địa chỉ đường là bắt buộc']
    },
    ward: {
      type: String,
      required: [true, 'Phường/xã là bắt buộc']
    },
    district: {
      type: String,
      required: [true, 'Quận/huyện là bắt buộc']
    },
    city: {
      type: String,
      default: 'Hà Nội'
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Vĩ độ là bắt buộc'],
        min: [-90, 'Vĩ độ không hợp lệ'],
        max: [90, 'Vĩ độ không hợp lệ']
      },
      lng: {
        type: Number,
        required: [true, 'Kinh độ là bắt buộc'],
        min: [-180, 'Kinh độ không hợp lệ'],
        max: [180, 'Kinh độ không hợp lệ']
      }
    }
  },
  contact: {
    phone: {
      type: String,
      match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
    },
    email: {
      type: String,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Website phải bắt đầu bằng http:// hoặc https://']
    },
    facebook: String,
    instagram: String
  },
  pricing: {
    minPrice: {
      type: Number,
      min: [0, 'Giá tối thiểu không được âm']
    },
    maxPrice: {
      type: Number,
      min: [0, 'Giá tối đa không được âm']
    },
    currency: {
      type: String,
      default: 'VND'
    }
  },
  features: {
    wifi: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    airConditioning: { type: Boolean, default: false },
    outdoor: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: false },
    delivery: { type: Boolean, default: false },
    takeaway: { type: Boolean, default: false },
    cardPayment: { type: Boolean, default: false }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  operatingHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    open: String, // Format: "08:00"
    close: String, // Format: "22:00"
    isClosed: {
      type: Boolean,
      default: false
    }
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Đánh giá không được dưới 0'],
      max: [5, 'Đánh giá không được quá 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Số lượng đánh giá không được âm']
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for geospatial queries
placeSchema.index({ 'address.coordinates': '2dsphere' });

// Index for text search
placeSchema.index({ 
  name: 'text', 
  description: 'text', 
  tags: 'text' 
});

// Index for category and subcategory
placeSchema.index({ category: 1, subcategory: 1 });

// Virtual for full address
placeSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.ward}, ${this.address.district}, ${this.address.city}`;
});

// Method to calculate distance from a point
placeSchema.methods.calculateDistance = function(lat, lng) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat - this.address.coordinates.lat) * Math.PI / 180;
  const dLng = (lng - this.address.coordinates.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.address.coordinates.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

module.exports = mongoose.model('Place', placeSchema);
