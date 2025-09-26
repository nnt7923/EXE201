const express = require('express');
const User = require('../models/User');
const Place = require('../models/Place');
const Review = require('../models/Review');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validatePagination, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/', authenticateToken, requireAdmin, validatePagination, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      isActive,
      search,
      sort = '-createdAt'
    } = req.query;

    // Build filter object
    const filter = {};

    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách users',
      error: error.message
    });
  }
});

// @route   GET /api/users/me/places
// @desc    Get places created by current user
// @access  Private
router.get('/me/places', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const places = await Place.find({ 
      createdBy: req.user.id, 
    })
      .populate('createdBy', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Place.countDocuments({ 
      createdBy: req.user.id, 
    });

    res.json({
      success: true,
      data: {
        places,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user places error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy địa điểm của user',
      error: error.message
    });
  }
});

// @route   GET /api/users/me/reviews
// @desc    Get reviews by current user
// @access  Private
router.get('/me/reviews', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ 
      user: req.user.id, 
    })
      .populate('place', 'name category address')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Review.countDocuments({ 
      user: req.user.id, 
    });

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
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy đánh giá của user',
      error: error.message
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', validateObjectId, authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user._id;

    // Users can only view their own profile unless they're admin
    if (userId !== currentUserId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xem thông tin user này'
      });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin user',
      error: error.message
    });
  }
});

// @route   GET /api/users/:id/places
// @desc    Get places created by user
// @access  Public
router.get('/:id/places', validateObjectId, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const places = await Place.find({ 
      createdBy: req.params.id, 
      isActive: true 
    })
      .populate('createdBy', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Place.countDocuments({ 
      createdBy: req.params.id, 
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        places,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user places error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy địa điểm của user',
      error: error.message
    });
  }
});

// @route   GET /api/users/:id/reviews
// @desc    Get reviews by user
// @access  Public
router.get('/:id/reviews', validateObjectId, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ 
      user: req.params.id, 
      isActive: true 
    })
      .populate('place', 'name category address')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Review.countDocuments({ 
      user: req.params.id, 
      isActive: true 
    });

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
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy đánh giá của user',
      error: error.message
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', validateObjectId, authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user._id;

    // Users can only update their own profile unless they're admin
    if (userId !== currentUserId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật user này'
      });
    }

    const { name, phone, address, preferences, avatar } = req.body;

    // Only admin can update role and isActive
    const updateData = { name, phone, address, preferences, avatar };
    if (req.user.role === 'admin' && req.body.role) {
      updateData.role = req.body.role;
    }
    if (req.user.role === 'admin' && req.body.isActive !== undefined) {
      updateData.isActive = req.body.isActive;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật thông tin user thành công',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật user',
      error: error.message
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete)
// @access  Private (Admin or self)
router.delete('/:id', validateObjectId, authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user._id;

    // Users can only delete their own account unless they're admin
    if (userId !== currentUserId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa user này'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    // Soft delete
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Xóa user thành công'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa user',
      error: error.message
    });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Get user statistics overview
// @access  Private (Admin)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalPlaces = await Place.countDocuments({ isActive: true });
    const totalReviews = await Review.countDocuments({ isActive: true });

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // User role distribution
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalPlaces,
        totalReviews,
        recentUsers,
        roleStats
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê user',
      error: error.message
    });
  }
});

module.exports = router;
