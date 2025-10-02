const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authenticateToken } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validateObjectId } = require('../middleware/validation');
const { check, validationResult } = require('express-validator');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort('name');
    res.json({
      success: true,
      count: categories.length,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private (Admin)
router.post('/', 
  [ authenticateToken, authorize('admin'), [
    check('name', 'Name is required').not().isEmpty(),
    check('slug', 'Slug is required').not().isEmpty()
  ]], 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, slug, description, parent } = req.body;
      
      let category = await Category.findOne({ slug });
      if (category) {
        return res.status(400).json({ success: false, message: 'Category slug already exists' });
      }

      category = new Category({ name, slug, description, parent });
      await category.save();

      res.status(201).json({ success: true, data: category });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private (Admin)
router.put('/:id', 
  [ authenticateToken, authorize('admin'), validateObjectId ], 
  async (req, res) => {
    try {
      const { name, slug, description, parent } = req.body;
      const updateData = { name, slug, description, parent };

      const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }

      res.json({ success: true, data: category });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private (Admin)
router.delete('/:id', 
  [ authenticateToken, authorize('admin'), validateObjectId ], 
  async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);

      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }

      // Optional: Check if category is in use before deleting

      await category.remove();

      res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;