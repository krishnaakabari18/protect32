const UserModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for user profile pictures with user ID-based folder structure
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Get user ID from params (for update) or generate temp folder (for create)
    const userId = req.params.id || 'temp';
    const uploadPath = path.join('uploads', 'users', userId);
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `profile_${timestamp}${ext}`;
    cb(null, filename);
  }
});

// File filter for images only
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Configure multer for profile pictures
const upload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB per file
  }
});

// Export the multer middleware
const uploadProfilePicture = upload.single('profile_picture');

// Helper functions
const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const getFileUrl = (filePath) => {
  if (!filePath) return null;
  return `/${filePath.replace(/\\/g, '/')}`;
};

class UserController {
  static async createUser(req, res) {
    try {
      console.log('=== CREATE USER DEBUG ===');
      console.log('Request Body:', req.body);
      console.log('Request File:', req.file);
      
      const { email, password, mobile_number, first_name, last_name, user_type, date_of_birth, address } = req.body;

      if (!email || !password) {
        if (req.file) deleteFile(req.file.path);
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        if (req.file) deleteFile(req.file.path);
        return res.status(400).json({ error: 'User already exists' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      
      // Create user first without profile picture
      const user = await UserModel.create({
        email,
        password_hash,
        mobile_number,
        first_name,
        last_name,
        user_type: user_type || 'patient',
        profile_picture: null,
        date_of_birth,
        address
      });

      // Handle profile picture if uploaded
      let profile_picture = null;
      if (req.file) {
        // Move file from temp folder to user ID folder
        const tempPath = req.file.path;
        const userFolder = path.join('uploads', 'users', user.id);
        
        // Create user folder
        if (!fs.existsSync(userFolder)) {
          fs.mkdirSync(userFolder, { recursive: true });
        }
        
        const newPath = path.join(userFolder, req.file.filename);
        
        // Move file
        fs.renameSync(tempPath, newPath);
        
        // Delete temp folder if empty
        const tempFolder = path.dirname(tempPath);
        if (fs.existsSync(tempFolder) && fs.readdirSync(tempFolder).length === 0) {
          fs.rmdirSync(tempFolder);
        }
        
        profile_picture = getFileUrl(newPath);
        console.log('Profile picture uploaded:', profile_picture);
        
        // Update user with profile picture
        await UserModel.update(user.id, { profile_picture });
        user.profile_picture = profile_picture;
      }

      delete user.password_hash;
      res.status(201).json({ message: 'User created successfully', data: user });
    } catch (error) {
      console.error('Create user error:', error);
      if (req.file) deleteFile(req.file.path);
      res.status(500).json({ error: error.message });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const { user_type, is_active, page = 1, limit = 10 } = req.query;
      const filters = {};
      if (user_type) filters.user_type = user_type;
      if (is_active !== undefined) filters.is_active = is_active === 'true';

      const allUsers = await UserModel.findAll(filters);
      allUsers.forEach(user => delete user.password_hash);
      
      // Pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedData = allUsers.slice(startIndex, endIndex);
      
      res.json({ 
        data: paginatedData,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: allUsers.length,
          totalPages: Math.ceil(allUsers.length / limitNum)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getUserById(req, res) {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      delete user.password_hash;
      res.json({ data: user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateUser(req, res) {
    try {
      console.log('=== UPDATE USER DEBUG ===');
      console.log('Request Body:', req.body);
      console.log('Request File:', req.file);
      
      const existingUser = await UserModel.findById(req.params.id);
      if (!existingUser) {
        if (req.file) deleteFile(req.file.path);
        return res.status(404).json({ error: 'User not found' });
      }

      const updateData = {};
      
      // Only update fields that are provided
      if (req.body.email) updateData.email = req.body.email;
      if (req.body.first_name) updateData.first_name = req.body.first_name;
      if (req.body.last_name) updateData.last_name = req.body.last_name;
      if (req.body.mobile_number) updateData.mobile_number = req.body.mobile_number;
      if (req.body.user_type) updateData.user_type = req.body.user_type;
      if (req.body.date_of_birth) updateData.date_of_birth = req.body.date_of_birth;
      if (req.body.address) updateData.address = req.body.address;
      if (req.body.is_active !== undefined) updateData.is_active = req.body.is_active === 'true' || req.body.is_active === true;
      
      // Handle password update
      if (req.body.password) {
        updateData.password_hash = await bcrypt.hash(req.body.password, 10);
      }

      // Handle profile picture if uploaded
      if (req.file) {
        // Delete old profile picture if exists
        if (existingUser.profile_picture) {
          const oldPath = existingUser.profile_picture.replace(/^\//, '');
          deleteFile(oldPath);
        }
        updateData.profile_picture = getFileUrl(req.file.path);
        console.log('New profile picture:', updateData.profile_picture);
      }

      const user = await UserModel.update(req.params.id, updateData);
      delete user.password_hash;
      res.json({ message: 'User updated successfully', data: user });
    } catch (error) {
      console.error('Update user error:', error);
      if (req.file) deleteFile(req.file.path);
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteUser(req, res) {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Delete profile picture if exists
      if (user.profile_picture) {
        const filePath = user.profile_picture.replace(/^\//, '');
        deleteFile(filePath);
      }

      await UserModel.delete(req.params.id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = UserController;
module.exports.uploadProfilePicture = uploadProfilePicture;
