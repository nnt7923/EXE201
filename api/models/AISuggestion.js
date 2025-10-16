const mongoose = require('mongoose');

const aiSuggestionSchema = new mongoose.Schema({
  // Thông tin request
  requestType: {
    type: String,
    enum: ['itinerary', 'place'],
    required: true
  },
  
  // Thông tin input để tạo cache key
  inputHash: {
    type: String,
    required: true,
    index: true // Index để tìm kiếm nhanh
  },
  
  // Dữ liệu input gốc
  inputData: {
    destination: String,
    duration: Number,
    budget: String, // Changed to String to handle "LOW", "MEDIUM", "HIGH"
    preferences: String,
    query: String // Cho place suggestions
  },
  
  // Kết quả AI
  aiResponse: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Metadata
  userId: {
    type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and String for testing
    index: true
  },
  
  // Thống kê sử dụng
  usageCount: {
    type: Number,
    default: 1
  },
  
  lastUsed: {
    type: Date,
    default: Date.now
  },
  
  // Đánh giá chất lượng
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  feedback: String,
  
  // Thời gian cache
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Index compound cho tìm kiếm hiệu quả
aiSuggestionSchema.index({ requestType: 1, inputHash: 1 });
aiSuggestionSchema.index({ userId: 1, createdAt: -1 });
aiSuggestionSchema.index({ usageCount: -1 }); // Để tìm suggestions phổ biến

// Static methods
aiSuggestionSchema.statics.findCachedSuggestion = async function(requestType, inputHash) {
  return await this.findOne({
    requestType,
    inputHash,
    expiresAt: { $gt: new Date() }
  });
};

aiSuggestionSchema.statics.createOrUpdateSuggestion = async function(data) {
  const existing = await this.findOne({
    requestType: data.requestType,
    inputHash: data.inputHash
  });
  
  if (existing) {
    existing.usageCount += 1;
    existing.lastUsed = new Date();
    existing.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return await existing.save();
  }
  
  return await this.create(data);
};

// Instance methods
aiSuggestionSchema.methods.updateUsage = async function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return await this.save();
};

aiSuggestionSchema.methods.addFeedback = async function(rating, feedback) {
  this.rating = rating;
  this.feedback = feedback;
  return await this.save();
};

module.exports = mongoose.model('AISuggestion', aiSuggestionSchema);