const express = require('express');
const SubscriptionPlan = require('../models/SubscriptionPlan');

const router = express.Router();

// @desc    Get all subscription plans
// @route   GET /api/v1/plans
// @access  Public
router.get('/', async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find();
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Get single subscription plan
// @route   GET /api/v1/plans/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    // If the ID is not a valid ObjectId, it will throw an error
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ success: false, error: 'Plan not found' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
