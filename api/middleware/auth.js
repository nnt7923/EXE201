const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
    // req.user should be attached by authenticateToken and contain the user's ID
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Authentication error: User ID not found in token.' });
    }

    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('subscriptionPlan');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    // Replace the lightweight user object with the full user object
    req.user = user;
    next();
  } catch (error) {
     return res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
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