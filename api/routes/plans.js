const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const { authenticateToken: auth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// @route   GET /api/plans
// @desc    Get all active plans
// @access  Public
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true })
      .sort({ displayOrder: 1, price: 1 })
      .select('-__v');

    res.json({
      success: true,
      data: plans,
      message: 'Plans retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching plans',
      error: error.message
    });
  }
});

// @route   GET /api/plans/:id
// @desc    Get a specific plan by ID or name
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const identifier = req.params.id;
    let plan = null;

    // First try to find by MongoDB ObjectId
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      plan = await Plan.findById(identifier).select('-__v');
    }
    
    // If not found by ID, try to find by name (case-insensitive)
    if (!plan) {
      // Map common English names to Vietnamese names
      const nameMapping = {
        'basic': 'Cơ bản',
        'premium': 'Chuyên nghiệp', 
        'pro': 'Không giới hạn',
        'professional': 'Chuyên nghiệp',
        'unlimited': 'Không giới hạn'
      };
      
      const searchName = nameMapping[identifier.toLowerCase()] || identifier;
      plan = await Plan.findOne({ 
        name: { $regex: new RegExp(`^${searchName}$`, 'i') },
        isActive: true 
      }).select('-__v');
    }

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    if (!plan.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Plan is not available'
      });
    }

    res.json({
      success: true,
      data: plan,
      message: 'Plan retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching plan:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching plan',
      error: error.message
    });
  }
});

// @route   POST /api/plans
// @desc    Create a new plan (Admin only)
// @access  Private/Admin
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, description, price, features, aiSuggestionLimit, displayOrder } = req.body;

    // Validate required fields
    if (!name || !description || price === undefined || !features || !Array.isArray(features) || aiSuggestionLimit === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, price, features, aiSuggestionLimit'
      });
    }

    // Check if plan with same name already exists
    const existingPlan = await Plan.findOne({ name });
    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: 'A plan with this name already exists'
      });
    }

    const plan = new Plan({
      name,
      description,
      price,
      features,
      aiSuggestionLimit,
      displayOrder: displayOrder || 0
    });

    const savedPlan = await plan.save();

    res.status(201).json({
      success: true,
      data: savedPlan,
      message: 'Plan created successfully'
    });
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating plan',
      error: error.message
    });
  }
});

// @route   PUT /api/plans/:id
// @desc    Update a plan (Admin only)
// @access  Private/Admin
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, description, price, features, aiSuggestionLimit, isActive, displayOrder } = req.body;

    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Check if name is being changed and if it conflicts with existing plan
    if (name && name !== plan.name) {
      const existingPlan = await Plan.findOne({ name, _id: { $ne: req.params.id } });
      if (existingPlan) {
        return res.status(400).json({
          success: false,
          message: 'A plan with this name already exists'
        });
      }
    }

    // Update fields
    if (name !== undefined) plan.name = name;
    if (description !== undefined) plan.description = description;
    if (price !== undefined) plan.price = price;
    if (features !== undefined) plan.features = features;
    if (aiSuggestionLimit !== undefined) plan.aiSuggestionLimit = aiSuggestionLimit;
    if (isActive !== undefined) plan.isActive = isActive;
    if (displayOrder !== undefined) plan.displayOrder = displayOrder;

    const updatedPlan = await plan.save();

    res.json({
      success: true,
      data: updatedPlan,
      message: 'Plan updated successfully'
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating plan',
      error: error.message
    });
  }
});

// @route   DELETE /api/plans/:id
// @desc    Delete a plan (Admin only)
// @access  Private/Admin
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    await Plan.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting plan:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting plan',
      error: error.message
    });
  }
});

module.exports = router;