const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Configure storage for profile pictures
const profilePictureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Get user type from request body or authenticated user
    const userType = req.body.user_type || req.user?.user_type || 'general';
    
    // Create role-based folder structure: uploads/{user_type}/profile_pictures
    const uploadPath = path.join('uploads', userType, 'profile_pictures');
    
    // Ensure directory exists
    ensureDirectoryExists(uploadPath);
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId_timestamp_originalname
    const userId = req.params.id || req.user?.id || 'temp';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${userId}_${timestamp}${ext}`;
    
    cb(null, filename);
  }
});

// File filter for images only
const imageFileFilter = (req, file, cb) => {
  // Accept images only
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Configure multer for profile pictures
const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Configure storage for documents
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userType = req.body.user_type || req.user?.user_type || 'general';
    const uploadPath = path.join('uploads', userType, 'documents');
    
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const userId = req.params.id || req.user?.id || 'temp';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    const filename = `${userId}_${timestamp}_${basename}${ext}`;
    
    cb(null, filename);
  }
});

// File filter for documents
const documentFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDF, and Word documents are allowed.'), false);
  }
};

// Configure multer for documents
const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper function to delete old file
const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Helper function to get file URL
const getFileUrl = (filePath) => {
  if (!filePath) return null;
  // Return relative path that can be served by Express
  return `/${filePath.replace(/\\/g, '/')}`;
};

module.exports = {
  uploadProfilePicture: uploadProfilePicture.single('profile_picture'),
  uploadDocument: uploadDocument.single('document'),
  deleteFile,
  getFileUrl,
  ensureDirectoryExists
};
