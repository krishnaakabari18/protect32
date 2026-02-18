const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const AuthModel = require('../models/authModel');
const JWTUtil = require('../utils/jwt');
const OTPUtil = require('../utils/otp');
const { deleteFile, getFileUrl } = require('../utils/upload');

class AuthController {
  // Register with Email/Password
  static async register(req, res) {
    try {
      const { email, password, mobile_number, first_name, last_name, user_type, date_of_birth, address } = req.body;

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        // Delete uploaded file if user already exists
        if (req.file) {
          deleteFile(req.file.path);
        }
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
        user_type: user_type || 'patient',
        profile_picture,
        date_of_birth,
        address
      });

      delete user.password_hash;
      
      const accessToken = JWTUtil.generateAccessToken(user.id, user.user_type);
      const refreshToken = JWTUtil.generateRefreshToken(user.id);
      
      // Format device info as JSON object
      const deviceInfo = {
        userAgent: req.headers['user-agent'] || 'unknown',
        platform: req.headers['sec-ch-ua-platform'] || 'unknown'
      };
      
      await AuthModel.createRefreshToken(user.id, refreshToken, deviceInfo, req.ip);

      res.status(201).json({
        message: 'User registered successfully',
        data: { user, accessToken, refreshToken }
      });
    } catch (error) {
      // Delete uploaded file if registration fails
      if (req.file) {
        deleteFile(req.file.path);
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Login with Email/Password
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!user.password_hash) {
        return res.status(401).json({ error: 'Please use social login or reset your password' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!user.is_active) {
        return res.status(403).json({ error: 'Account is inactive' });
      }

      delete user.password_hash;

      const accessToken = JWTUtil.generateAccessToken(user.id, user.user_type);
      const refreshToken = JWTUtil.generateRefreshToken(user.id);
      
      // Format device info as JSON object
      const deviceInfo = {
        userAgent: req.headers['user-agent'] || 'unknown',
        platform: req.headers['sec-ch-ua-platform'] || 'unknown'
      };
      
      await AuthModel.createRefreshToken(user.id, refreshToken, deviceInfo, req.ip);

      // Update online status
      await UserModel.update(user.id, { is_online: true, last_seen: new Date() });

      res.json({
        message: 'Login successful',
        data: { user, accessToken, refreshToken }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Send OTP to Mobile
  static async sendOTP(req, res) {
    try {
      const { mobile_number, purpose } = req.body; // purpose: 'registration', 'login', 'password_reset'

      const otp = OTPUtil.generate(parseInt(process.env.OTP_LENGTH));
      
      // Check if user exists for login purpose
      if (purpose === 'login') {
        const query = 'SELECT * FROM users WHERE mobile_number = $1';
        const pool = require('../config/database');
        const result = await pool.query(query, [mobile_number]);
        
        if (!result.rows[0]) {
          return res.status(404).json({ error: 'User not found with this mobile number' });
        }
      }

      await AuthModel.createOTP(null, mobile_number, otp, purpose);
      await OTPUtil.sendSMS(mobile_number, otp);

      res.json({
        message: 'OTP sent successfully',
        data: { mobile_number, expires_in_minutes: process.env.OTP_EXPIRE_MINUTES }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Verify OTP and Login/Register
  static async verifyOTP(req, res) {
    try {
      const { mobile_number, otp_code, purpose, user_data } = req.body;

      const otpRecord = await AuthModel.verifyOTP(mobile_number, otp_code, purpose);
      
      if (!otpRecord) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      if (otpRecord.attempts >= 3) {
        return res.status(400).json({ error: 'Too many attempts. Please request a new OTP' });
      }

      await AuthModel.markOTPVerified(otpRecord.id);

      let user;
      const pool = require('../config/database');

      if (purpose === 'registration') {
        // Create new user
        const password_hash = user_data?.password ? await bcrypt.hash(user_data.password, 10) : null;
        user = await UserModel.create({
          mobile_number,
          password_hash,
          first_name: user_data?.first_name || '',
          last_name: user_data?.last_name || '',
          user_type: user_data?.user_type || 'patient',
          mobile_verified: true,
          is_verified: true
        });
      } else if (purpose === 'login') {
        // Find existing user
        const query = 'SELECT * FROM users WHERE mobile_number = $1';
        const result = await pool.query(query, [mobile_number]);
        user = result.rows[0];
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Update mobile verified status
        await UserModel.update(user.id, { mobile_verified: true, is_online: true, last_seen: new Date() });
      }

      delete user.password_hash;

      const accessToken = JWTUtil.generateAccessToken(user.id, user.user_type);
      const refreshToken = JWTUtil.generateRefreshToken(user.id);
      
      const deviceInfo = { userAgent: req.headers['user-agent'] || 'unknown', platform: req.headers['sec-ch-ua-platform'] || 'unknown' };
      await AuthModel.createRefreshToken(user.id, refreshToken, deviceInfo, req.ip);

      res.json({
        message: 'OTP verified successfully',
        data: { user, accessToken, refreshToken }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Refresh Access Token
  static async refreshToken(req, res) {
    try {
      const { refresh_token } = req.body;

      const tokenRecord = await AuthModel.findRefreshToken(refresh_token);
      
      if (!tokenRecord) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
      }

      const user = await UserModel.findById(tokenRecord.user_id);
      
      if (!user || !user.is_active) {
        return res.status(401).json({ error: 'User not found or inactive' });
      }

      const accessToken = JWTUtil.generateAccessToken(user.id, user.user_type);

      res.json({
        message: 'Token refreshed successfully',
        data: { accessToken }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Logout
  static async logout(req, res) {
    try {
      const { refresh_token } = req.body;

      if (refresh_token) {
        await AuthModel.revokeRefreshToken(refresh_token);
      }

      if (req.user) {
        await UserModel.update(req.user.id, { is_online: false, last_seen: new Date() });
      }

      res.json({ message: 'Logout successful' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Logout from all devices
  static async logoutAll(req, res) {
    try {
      await AuthModel.revokeAllUserTokens(req.user.id);
      await UserModel.update(req.user.id, { is_online: false, last_seen: new Date() });

      res.json({ message: 'Logged out from all devices' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Google OAuth Callback
  static async googleCallback(req, res) {
    try {
      const { google_id, email, first_name, last_name, picture } = req.body;

      const user = await AuthModel.findOrCreateSocialUser('google', google_id, email, {
        firstName: first_name,
        lastName: last_name,
        picture
      });

      delete user.password_hash;

      const accessToken = JWTUtil.generateAccessToken(user.id, user.user_type);
      const refreshToken = JWTUtil.generateRefreshToken(user.id);
      
      const deviceInfo = { userAgent: req.headers['user-agent'] || 'unknown', platform: req.headers['sec-ch-ua-platform'] || 'unknown' };
      await AuthModel.createRefreshToken(user.id, refreshToken, deviceInfo, req.ip);
      await UserModel.update(user.id, { is_online: true, last_seen: new Date() });

      res.json({
        message: 'Google login successful',
        data: { user, accessToken, refreshToken }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Facebook OAuth Callback
  static async facebookCallback(req, res) {
    try {
      const { facebook_id, email, first_name, last_name, picture } = req.body;

      const user = await AuthModel.findOrCreateSocialUser('facebook', facebook_id, email, {
        firstName: first_name,
        lastName: last_name,
        picture
      });

      delete user.password_hash;

      const accessToken = JWTUtil.generateAccessToken(user.id, user.user_type);
      const refreshToken = JWTUtil.generateRefreshToken(user.id);
      
      const deviceInfo = { userAgent: req.headers['user-agent'] || 'unknown', platform: req.headers['sec-ch-ua-platform'] || 'unknown' };
      await AuthModel.createRefreshToken(user.id, refreshToken, deviceInfo, req.ip);
      await UserModel.update(user.id, { is_online: true, last_seen: new Date() });

      res.json({
        message: 'Facebook login successful',
        data: { user, accessToken, refreshToken }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Apple OAuth Callback
  static async appleCallback(req, res) {
    try {
      const { apple_id, email, first_name, last_name } = req.body;

      const user = await AuthModel.findOrCreateSocialUser('apple', apple_id, email, {
        firstName: first_name,
        lastName: last_name
      });

      delete user.password_hash;

      const accessToken = JWTUtil.generateAccessToken(user.id, user.user_type);
      const refreshToken = JWTUtil.generateRefreshToken(user.id);
      
      const deviceInfo = { userAgent: req.headers['user-agent'] || 'unknown', platform: req.headers['sec-ch-ua-platform'] || 'unknown' };
      await AuthModel.createRefreshToken(user.id, refreshToken, deviceInfo, req.ip);
      await UserModel.update(user.id, { is_online: true, last_seen: new Date() });

      res.json({
        message: 'Apple login successful',
        data: { user, accessToken, refreshToken }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get Current User Profile
  static async getProfile(req, res) {
    try {
      const user = req.user;
      delete user.password_hash;
      res.json({ data: user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Change Password
  static async changePassword(req, res) {
    try {
      const { old_password, new_password } = req.body;
      const user = await UserModel.findById(req.user.id);

      if (user.password_hash) {
        const isValidPassword = await bcrypt.compare(old_password, user.password_hash);
        if (!isValidPassword) {
          return res.status(400).json({ error: 'Invalid old password' });
        }
      }

      const password_hash = await bcrypt.hash(new_password, 10);
      await UserModel.update(req.user.id, { password_hash });

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AuthController;
