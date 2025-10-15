const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// Check if Cloudinary environment variables are set
const hasCloudinaryConfig = process.env.CLOUDINARY_CLOUD_NAME && 
                           process.env.CLOUDINARY_API_KEY && 
                           process.env.CLOUDINARY_API_SECRET;

let storage;

if (hasCloudinaryConfig) {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  // Use Cloudinary storage
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'an-gi-o-dau',
      allowed_formats: ['jpeg', 'png', 'jpg', 'gif', 'webp'],
      public_id: (req, file) => {
        const baseName = path.basename(file.originalname, path.extname(file.originalname));
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return `${baseName}-${uniqueSuffix}`;
      },
    },
  });
} else {
  // Fallback to memory storage for development/testing
  console.warn('Cloudinary environment variables not set. Using memory storage as fallback.');
  storage = multer.memoryStorage();
}

module.exports = { cloudinary: hasCloudinaryConfig ? cloudinary : null, storage };