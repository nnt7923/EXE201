const express = require('express');
const Category = require('../models/Category');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories and their subcategories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort('name');
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh mục',
      error: error.message
    });
  }
});

module.exports = router;