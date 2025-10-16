const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');
const { authenticateToken: auth, fetchFullUser } = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
  '/register',  [    check('name', 'Please add name').not().isEmpty(),    check('email', 'Please include a valid email').isEmail(),    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      user = new User({
        name,
        email,
        password,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id,
          role: user.role // Include role in JWT payload
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;
          // Return token and user object (without password)
          const userResponse = user.toObject();
          delete userResponse.password;
          res.json({ 
            success: true, 
            data: { token, user: userResponse } 
          });
        }
      );
    } catch (err) {
      next(err);
    }
  }
);

// @route   POST api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post(
  '/login',  [    check('email', 'Please include a valid email').isEmail(),    check('password', 'Password is required').exists(),  ],
  async (req, res, next) => {
    console.log('🔐 Login attempt:', { email: req.body.email, hasPassword: !!req.body.password });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      console.log('👤 User found:', !!user);

      if (!user) {
        console.log('❌ User not found for email:', email);
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      console.log('🔍 Debug password comparison:');
      console.log('  - Input password:', password);
      console.log('  - Input password length:', password.length);
      console.log('  - Stored hash:', user.password);
      console.log('  - Stored hash length:', user.password.length);
      
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('🔑 Password match:', isMatch);

      if (!isMatch) {
        console.log('❌ Password mismatch for user:', email);
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      const payload = {
        user: {
          id: user.id,
          role: user.role // Include role in JWT payload
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;
          // Return token and user object (without password)
          const userResponse = user.toObject();
          delete userResponse.password;
          res.json({ 
            success: true, 
            data: { token, user: userResponse } 
          });
        }
      );
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
