const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Configure storage for documents with year/month/day structure
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // Create path: uploads/documents/YYYY/MM/DD
    const uploadPath = path.join('uploads', 'documents', String(year), month, day);
    
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

// File filter for documents (PDF and images only)
const documentFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WEBP) and PDF files are allowed.'), false);
  }
};

// Configure multer for multiple document uploads
const uploadDocuments = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10 // Maximum 10 files at once
  }
});

// Delete file from filesystem
const deleteFile = (filePath) => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Delete multiple files
const deleteFiles = (filePaths) => {
  const results = [];
  for (const filePath of filePaths) {
    results.push(deleteFile(filePath));
  }
  return results;
};

// Get file URL
const getFileUrl = (filePath, req) => {
  if (!filePath) return null;
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/${filePath.replace(/\\/g, '/')}`;
};

// Get file info
const getFileInfo = (file) => {
  return {
    path: file.path.replace(/\\/g, '/'),
    filename: file.filename,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  };
};

module.exports = {
  uploadDocuments: uploadDocuments.array('files', 10), // Accept up to 10 files
  uploadSingleDocument: uploadDocuments.single('file'),
  deleteFile,
  deleteFiles,
  getFileUrl,
  getFileInfo,
  ensureDirectoryExists
};
