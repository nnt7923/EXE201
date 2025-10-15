const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'an-gi-o-dau',
    // format is automatically detected by Cloudinary, so we don't need to force it to png
    // This allows for more flexible image formats (jpg, webp, etc.)
    allowed_formats: ['jpeg', 'png', 'jpg', 'gif', 'webp'],
    public_id: (req, file) => {
      // Create a unique public_id to prevent file overwrites
      const baseName = path.basename(file.originalname, path.extname(file.originalname));
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `${baseName}-${uniqueSuffix}`;
    },
  },
});

module.exports = { cloudinary, storage };