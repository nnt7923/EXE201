const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = upload;
