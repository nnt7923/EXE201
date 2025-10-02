const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user should be attached by a preceding authentication middleware (like your existing 'auth.js')
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, msg: 'Forbidden: User role not available.' });
    }

    const rolesArray = [...allowedRoles];

    // Check if the user's role is in the list of allowed roles
    if (!rolesArray.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        msg: `Forbidden: You do not have permission. Required role: ${rolesArray.join(' or ')}` 
      });
    }

    // If the role is allowed, proceed to the next middleware or route handler
    next();
  };
};

module.exports = authorize;
