const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory structure
const createUploadDir = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const uploadPath = path.join(__dirname, '../../uploads/education', year.toString(), month, day);
  
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  
  return { uploadPath, relativePath: `education/${year}/${month}/${day}` };
};

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { uploadPath } = createUploadDir();
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'education-' + uniqueSuffix + ext);
  }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Delete image file
const deleteImage = (imagePath) => {
  if (!imagePath) return;
  
  const fullPath = path.join(__dirname, '../../uploads', imagePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log('Deleted image:', fullPath);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }
};

module.exports = {
  upload,
  deleteImage,
  createUploadDir
};
