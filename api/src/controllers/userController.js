const UserModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { deleteFile, getFileUrl } = require('../utils/upload');
const path = require('path');

class UserController {
  static async createUser(req, res) {
    try {
      const { email, password, mobile_number, first_name, last_name, user_type, date_of_birth, address } = req.body;

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      
      // Handle profile picture if uploaded
      let profile_picture = null;
      if (req.file) {
        profile_picture = getFileUrl(req.file.path);
      }

      const user = await UserModel.create({
        email,
        password_hash,
        mobile_number,
        first_name,
        last_name,
        user_type,
        profile_picture,
        date_of_birth,
        address
      });

      delete user.password_hash;
      res.status(201).json({ message: 'User created successfully', data: user });
    } catch (error) {
      // Delete uploaded file if user creation fails
      if (req.file) {
        deleteFile(req.file.path);
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const { user_type, is_active } = req.query;
      const filters = {};
      if (user_type) filters.user_type = user_type;
      if (is_active !== undefined) filters.is_active = is_active === 'true';

      const users = await UserModel.findAll(filters);
      users.forEach(user => delete user.password_hash);
      res.json({ data: users });
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
      const existingUser = await UserModel.findById(req.params.id);
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updateData = { ...req.body };

      // Handle profile picture if uploaded
      if (req.file) {
        // Delete old profile picture if exists
        if (existingUser.profile_picture) {
          const oldPath = existingUser.profile_picture.replace('/uploads/', 'uploads/');
          deleteFile(oldPath);
        }
        updateData.profile_picture = getFileUrl(req.file.path);
      }

      const user = await UserModel.update(req.params.id, updateData);
      delete user.password_hash;
      res.json({ message: 'User updated successfully', data: user });
    } catch (error) {
      // Delete uploaded file if update fails
      if (req.file) {
        deleteFile(req.file.path);
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async uploadProfilePicture(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const existingUser = await UserModel.findById(req.params.id);
      if (!existingUser) {
        deleteFile(req.file.path);
        return res.status(404).json({ error: 'User not found' });
      }

      // Delete old profile picture if exists
      if (existingUser.profile_picture) {
        const oldPath = existingUser.profile_picture.replace('/uploads/', 'uploads/');
        deleteFile(oldPath);
      }

      const profile_picture = getFileUrl(req.file.path);
      const user = await UserModel.update(req.params.id, { profile_picture });
      delete user.password_hash;

      res.json({ 
        message: 'Profile picture uploaded successfully', 
        data: { profile_picture: user.profile_picture } 
      });
    } catch (error) {
      if (req.file) {
        deleteFile(req.file.path);
      }
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
        const filePath = user.profile_picture.replace('/uploads/', 'uploads/');
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
