const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Itinerary = require('../models/Itinerary');

// Verify JWT token and attach lightweight user payload to req.user
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // The decoded payload (which includes id and role) is attached to the request.
    req.user = decoded.user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

// Fetch full user object from DB after authentication
const fetchFullUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's subscriptions using the Subscription model
    const Subscription = require('../models/Subscription');
    const subscriptions = await Subscription.find({ user: user._id })
      .populate('plan')
      .sort({ createdAt: -1 });

    // Get active subscriptions and their plans
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    const subscriptionPlan = activeSubscriptions.length > 0 ? activeSubscriptions[0].plan : null;
    const subscriptionEndDate = activeSubscriptions.length > 0 ? activeSubscriptions[0].endDate : null;

    // Get AI suggestions used from active subscription
    const aiSuggestionsUsed = activeSubscriptions.length > 0 ? (activeSubscriptions[0].aiUsageCount || 0) : 0;

    // Construct user data with subscription info
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      credits: user.credits,
      subscriptionPlan,
      subscriptionEndDate,
      aiSuggestionsUsed,
      createdAt: user.createdAt
    };

    req.user = userData;
    next();
  } catch (error) {
    console.error('Error in fetchFullUser middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Only attach the lightweight user object
      if (decoded.user) {
        req.user = decoded.user;
      }
    }
    
    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};

module.exports = {
  authenticateToken,
  fetchFullUser,
  optionalAuth
};