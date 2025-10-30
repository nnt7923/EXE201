const express = require('express');
const Review = require('../models/Review');
const Place = require('../models/Place');
const Booking = require('../models/Booking');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateReview, validatePagination, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// Helper function to map user-friendly sort values to database field names
const mapSortValue = (sort) => {
  const sortMap = {
    'newest': '-createdAt',
    'oldest': 'createdAt',
    'highest-rated': '-rating',
    'lowest-rated': 'rating',
    'name-asc': 'name',
    'name-desc': '-name'
  };
  
  return sortMap[sort] || sort;
};

// @route   GET /api/reviews
// @desc    Get all reviews with filtering and pagination
// @access  Public
router.get('/', validatePagination, optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      place,
      user,
      rating,
      sort = '-createdAt'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (place) filter.place = place;
    if (user) filter.user = user;
    if (rating) filter.rating = parseInt(rating);

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Map user-friendly sort values to database field names
    const mappedSort = mapSortValue(sort);

    // Execute query
    const reviews = await Review.find(filter)
      .populate('place', 'name category address')
      .populate('user', 'name avatar')
      .populate('booking', 'bookingNumber checkInDate checkOutDate')
      .sort(mappedSort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách đánh giá',
      error: error.message
    });
  }
});

// @route   GET /api/reviews/user/me
// @desc    Get all reviews by the current user
// @access  Private
router.get('/user/me', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Map user-friendly sort values to database field names
    const mappedSort = mapSortValue(sort);

    const filter = { user: req.user._id };

    const reviews = await Review.find(filter)
      .populate('place', 'name category address')
      .populate('booking', 'bookingNumber checkInDate checkOutDate')
      .sort(mappedSort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get current user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy đánh giá của bạn',
      error: error.message
    });
  }
});

// @route   GET /api/reviews/booking/:bookingId
// @desc    Get review by booking ID
// @access  Private
router.get('/booking/:bookingId', validateObjectId, authenticateToken, async (req, res) => {
  try {
    const review = await Review.findOne({ booking: req.params.bookingId })
      .populate('place', 'name category address')
      .populate('user', 'name avatar')
      .populate('booking', 'bookingNumber checkInDate checkOutDate')
      .lean();

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá cho booking này'
      });
    }

    res.json({
      success: true,
      data: { review }
    });
  } catch (error) {
    console.error('Get review by booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin đánh giá',
      error: error.message
    });
  }
});

// @route   GET /api/reviews/:id
// @desc    Get single review by ID
// @access  Public
router.get('/:id', validateObjectId, optionalAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('place', 'name category address')
      .populate('user', 'name avatar')
      .populate('booking', 'bookingNumber checkInDate checkOutDate')
      .lean();

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    res.json({
      success: true,
      data: { review }
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin đánh giá',
      error: error.message
    });
  }
});

// @route   POST /api/reviews
// @desc   // POST /api/reviews - Create new review
router.post('/', authenticateToken, validateReview, async (req, res) => {
  try {
    const { place, rating, title, content, visitDate, visitType, pricePaid, groupSize, tags, aspects, images, booking } = req.body;

    // Check if place exists
    const placeExists = await Place.findById(place);
    if (!placeExists) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa điểm'
      });
    }

    // If booking is provided, validate it
    if (booking) {
      const bookingExists = await Booking.findOne({ 
        _id: booking, 
        user: req.user._id,
        place: place,
        status: 'completed'
      });
      
      if (!bookingExists) {
        return res.status(400).json({
          success: false,
          message: 'Booking không hợp lệ hoặc chưa hoàn thành'
        });
      }

      // Check if this booking already has a review
      const existingBookingReview = await Review.findOne({ booking });
      if (existingBookingReview) {
        return res.status(400).json({
          success: false,
          message: 'Booking này đã được đánh giá rồi'
        });
      }
    } else {
      // Check if user already reviewed this place (for non-booking reviews)
      const existingReview = await Review.findOne({ 
        place, 
        user: req.user._id,
        booking: { $exists: false }
      });
      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'Bạn đã đánh giá địa điểm này rồi'
        });
      }
    }

    // Create new review
    const reviewData = {
      place,
      user: req.user._id,
      rating,
      title,
      content,
      visitDate,
      visitType,
      pricePaid,
      groupSize,
      tags,
      aspects,
      images: images || []
    };

    if (booking) {
      reviewData.booking = booking;
    }

    const review = new Review(reviewData);
    await review.save();

    // Update place rating
    await updatePlaceRating(place);

    // Update booking with review reference if booking exists
    if (booking) {
      await Booking.findByIdAndUpdate(booking, { review: review._id });
    }

    await review.populate('place', 'name category address');
    await review.populate('user', 'name avatar');
    if (booking) {
      await review.populate('booking', 'bookingNumber checkInDate checkOutDate');
    }

    res.status(201).json({
      success: true,
      message: 'Tạo đánh giá thành công',
      data: { review }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo đánh giá',
      error: error.message
    });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private
router.put('/:id', validateObjectId, authenticateToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền chỉnh sửa đánh giá này'
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('place', 'name category address')
      .populate('user', 'name avatar');

    // Update place rating if rating changed
    if (req.body.rating && req.body.rating !== review.rating) {
      await updatePlaceRating(review.place);
    }

    res.json({
      success: true,
      message: 'Cập nhật đánh giá thành công',
      data: { review: updatedReview }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật đánh giá',
      error: error.message
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
router.delete('/:id', validateObjectId, authenticateToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa đánh giá này'
      });
    }

    // Soft delete
    review.isActive = false;
    await review.save();

    // Update place rating
    await updatePlaceRating(review.place);

    res.json({
      success: true,
      message: 'Xóa đánh giá thành công'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa đánh giá',
      error: error.message
    });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Toggle helpful status for review
// @access  Private
router.post('/:id/helpful', validateObjectId, authenticateToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    // Toggle helpful status
    await review.toggleHelpful(req.user._id);

    res.json({
      success: true,
      message: 'Cập nhật trạng thái hữu ích thành công',
      data: {
        helpful: review.helpful.count,
        isHelpful: review.isHelpfulByUser(req.user._id)
      }
    });
  } catch (error) {
    console.error('Toggle helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái hữu ích',
      error: error.message
    });
  }
});

// Helper function to update place rating
async function updatePlaceRating(placeId) {
  try {
    const reviews = await Review.find({ place: placeId, isActive: true });
    
    if (reviews.length === 0) {
      await Place.findByIdAndUpdate(placeId, {
        'rating.average': 0,
        'rating.count': 0
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Place.findByIdAndUpdate(placeId, {
      'rating.average': Math.round(averageRating * 10) / 10, // Round to 1 decimal
      'rating.count': reviews.length
    });
  } catch (error) {
    console.error('Update place rating error:', error);
  }
}

module.exports = router;