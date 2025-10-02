const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
const { authenticateToken } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validateObjectId } = require('../middleware/validation');
const { check, validationResult } = require('express-validator');

// @route   GET /api/packages
// @desc    Get all active packages
// @access  Public
router.get('/', async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true }).sort({ price: 1 });
    res.json({ success: true, data: { packages } });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/packages/all
// @desc    Get all packages (for admins)
// @access  Private (Admin)
router.get('/all', authenticateToken, authorize('admin'), async (req, res) => {
    try {
        const packages = await Package.find().sort({ price: 1 });
        res.json({ success: true, data: { packages } });
    } catch (error) {
        console.error('Get all packages error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/packages
// @desc    Create a new package
// @access  Private (Admin)
router.post('/', 
  [ authenticateToken, authorize('admin'), [
    check('name', 'Name is required').not().isEmpty(),
    check('price', 'Price must be a non-negative number').isFloat({ min: 0 }),
    check('credits', 'Credits must be a non-negative integer').isInt({ min: 0 })
  ]], 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, description, price, credits, isActive, features } = req.body;
      const newPackage = new Package({ name, description, price, credits, isActive, features });
      await newPackage.save();
      res.status(201).json({ success: true, data: newPackage });
    } catch (error) {
      console.error('Create package error:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   PUT /api/packages/:id
// @desc    Update a package
// @access  Private (Admin)
router.put('/:id', 
  [ authenticateToken, authorize('admin'), validateObjectId ], 
  async (req, res) => {
    try {
      const { name, description, price, credits, isActive, features } = req.body;
      const updateData = { name, description, price, credits, isActive, features };

      const pkg = await Package.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

      if (!pkg) {
        return res.status(404).json({ success: false, message: 'Package not found' });
      }

      res.json({ success: true, data: pkg });
    } catch (error) {
      console.error('Update package error:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   DELETE /api/packages/:id
// @desc    Delete a package
// @access  Private (Admin)
router.delete('/:id', 
  [ authenticateToken, authorize('admin'), validateObjectId ], 
  async (req, res) => {
    try {
      const pkg = await Package.findById(req.params.id);

      if (!pkg) {
        return res.status(404).json({ success: false, message: 'Package not found' });
      }

      await pkg.remove();

      res.json({ success: true, message: 'Package deleted successfully' });
    } catch (error) {
      console.error('Delete package error:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;