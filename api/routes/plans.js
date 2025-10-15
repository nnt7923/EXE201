const express = require('express');
const SubscriptionPlan = require('../models/SubscriptionPlan');

const router = express.Router();

// @desc    Get all subscription plans
// @route   GET /api/plans
// @access  Public
router.get('/', async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }); // Only show active plans
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ success: false, message: 'An unexpected error occurred while fetching plans.', error: error.message });
  }
});

// @desc    Get single subscription plan
// @route   GET /api/plans/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);

    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    // If the ID is not a valid ObjectId, it will throw an error
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    console.error('Error fetching subscription plan by ID:', error);
    res.status(500).json({ success: false, message: 'An unexpected error occurred while fetching the plan.', error: error.message });
  }
});

module.exports = router;