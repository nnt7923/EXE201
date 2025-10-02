const express = require('express');
const User = require('../models/User');
const Place = require('../models/Place');
const Review = require('../models/Review');
// Updated imports: fetchFullUser is new, requireAdmin is removed.
const { authenticateToken, fetchFullUser } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validatePagination, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
// Refactored to use authorize('admin') instead of requireAdmin
router.get('/', authenticateToken, authorize('admin'), validatePagination, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      isActive,
      search,
      sort = '-createdAt'
    } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

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

// @route   GET /api/users/me
// @desc    Get current user's profile
// @access  Private
// Refactored to use fetchFullUser to get complete user object
router.get('/me', authenticateToken, fetchFullUser, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

// @route   GET /api/users/me/places
// @desc    Get places created by current user
// @access  Private
router.get('/me/places', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const places = await Place.find({ createdBy: req.user.id })
      .populate('createdBy', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Place.countDocuments({ createdBy: req.user.id });

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

    const reviews = await Review.find({ user: req.user.id })
      .populate('place', 'name category address')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Review.countDocuments({ user: req.user.id });

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
// @access  Private (Admin or Self)
// Refactored to use fetchFullUser to get the user object for comparison
router.get('/:id', validateObjectId, authenticateToken, fetchFullUser, async (req, res) => {
  try {
    const userToViewId = req.params.id;
    const requester = req.user; // This is the full user object now

    // Users can only view their own profile unless they're admin
    if (userToViewId !== requester._id.toString() && requester.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xem thông tin user này'
      });
    }

    const user = await User.findById(userToViewId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin user',
      error: error.message
    });
  }
});

// Public routes remain unchanged
router.get('/:id/places', validateObjectId, validatePagination, async (req, res) => { /* ... */ });
router.get('/:id/reviews', validateObjectId, validatePagination, async (req, res) => { /* ... */ });

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin or Self)
// Refactored to use fetchFullUser
router.put('/:id', validateObjectId, authenticateToken, fetchFullUser, async (req, res) => {
  try {
    const userToUpdateId = req.params.id;
    const requester = req.user;

    if (userToUpdateId !== requester._id.toString() && requester.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật user này'
      });
    }

    const { name, phone, address, preferences, avatar } = req.body;
    const updateData = { name, phone, address, preferences, avatar };

    // Only admin can update role and isActive
    if (requester.role === 'admin' && req.body.role) {
      updateData.role = req.body.role;
    }
    if (requester.role === 'admin' && req.body.isActive !== undefined) {
      updateData.isActive = req.body.isActive;
    }

    const user = await User.findByIdAndUpdate(userToUpdateId, updateData, { new: true, runValidators: true })
      .select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    }

    res.json({ success: true, message: 'Cập nhật thông tin user thành công', data: { user } });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật user', error: error.message });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete)
// @access  Private (Admin or self)
// Refactored to use fetchFullUser
router.delete('/:id', validateObjectId, authenticateToken, fetchFullUser, async (req, res) => {
  try {
    const userToDeleteId = req.params.id;
    const requester = req.user;

    if (userToDeleteId !== requester._id.toString() && requester.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền xóa user này' });
    }

    const user = await User.findById(userToDeleteId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    }

    user.isActive = false;
    await user.save();

    res.json({ success: true, message: 'Xóa user thành công' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa user', error: error.message });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Get user statistics overview
// @access  Private (Admin)
// Refactored to use authorize('admin')
router.get('/stats/overview', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalPlaces = await Place.countDocuments({ isActive: true });
    const totalReviews = await Review.countDocuments({ isActive: true });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

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

// @route   GET /api/users/test-admin
// @desc    Test route for admin authorization
// @access  Private (Admin only)
router.get('/test-admin', authenticateToken, authorize('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome Admin! You have successfully accessed an admin-only route.'
  });
});

module.exports = router;