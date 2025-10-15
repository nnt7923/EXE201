const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const User = require('../models/User');

// @desc    Subscribe to a plan
// @route   POST /api/subscriptions/subscribe
// @access  Private
router.post('/subscribe', auth, async (req, res) => {
  const { planId } = req.body;
  const userId = req.user.id;

  try {
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, message: 'Plan not found or is not active' });
    }

    // Set the subscription end date based on the plan's duration
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + plan.durationInDays);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        subscriptionPlan: planId,
        aiSuggestionsUsed: 0, // Reset usage on new subscription
        subscriptionEndDate: subscriptionEndDate,
      },
      { new: true }
    ).populate('subscriptionPlan');

    res.status(200).json({ success: true, data: { user: updatedUser } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/subscriptions
// @desc    Get all user subscriptions (admin only)
// @access  Private (Admin)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    // Find all users who have a subscription plan
    const usersWithSubscriptions = await User.find({ subscriptionPlan: { $exists: true, $ne: null } })
      .populate('subscriptionPlan')
      .select('name email subscriptionPlan subscriptionStatus subscriptionEndDate paymentStatus createdAt')
      .sort('-subscriptionEndDate')
      .lean();

    res.status(200).json({ success: true, data: usersWithSubscriptions });
  } catch (error) {
    console.error('Error fetching all subscriptions:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   PUT /api/subscriptions/:userId
// @desc    Update user subscription status (admin only)
// @access  Private (Admin)
router.put('/:userId', auth, authorize('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { subscriptionStatus, subscriptionEndDate, paymentStatus } = req.body;

    console.log('=== UPDATE SUBSCRIPTION REQUEST ===');
    console.log('User ID:', userId);
    console.log('Request body:', req.body);

    // Validate the user exists
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('Current user data:', {
      name: user.name,
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
      paymentStatus: user.paymentStatus,
      subscriptionEndDate: user.subscriptionEndDate
    });

    // Prepare update object
    const updateData = {};
    
    if (subscriptionStatus !== undefined) {
      // Validate subscription status
      const validStatuses = ['none', 'pending_payment', 'active', 'expired', 'cancelled'];
      if (!validStatuses.includes(subscriptionStatus)) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid subscription status. Must be one of: ${validStatuses.join(', ')}` 
        });
      }
      updateData.subscriptionStatus = subscriptionStatus;
    }

    if (subscriptionEndDate !== undefined) {
      updateData.subscriptionEndDate = new Date(subscriptionEndDate);
    }

    if (paymentStatus !== undefined) {
      // Validate payment status
      const validPaymentStatuses = ['none', 'pending', 'confirmed', 'rejected'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}` 
        });
      }
      updateData.paymentStatus = paymentStatus;
    }

    console.log('Update data:', updateData);

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).populate('subscriptionPlan').select('name email subscriptionPlan subscriptionStatus subscriptionEndDate paymentStatus');

    console.log('Updated user data:', {
      name: updatedUser.name,
      email: updatedUser.email,
      subscriptionStatus: updatedUser.subscriptionStatus,
      paymentStatus: updatedUser.paymentStatus,
      subscriptionEndDate: updatedUser.subscriptionEndDate
    });

    // Verify the update by querying again
    const verifyUser = await User.findById(userId).select('name email subscriptionStatus paymentStatus subscriptionEndDate');
    console.log('Verification query result:', {
      name: verifyUser.name,
      email: verifyUser.email,
      subscriptionStatus: verifyUser.subscriptionStatus,
      paymentStatus: verifyUser.paymentStatus,
      subscriptionEndDate: verifyUser.subscriptionEndDate
    });

    res.status(200).json({ 
      success: true, 
      message: 'Subscription updated successfully',
      data: updatedUser 
    });

  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
