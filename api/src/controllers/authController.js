const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const AuthModel = require('../models/authModel');
const JWTUtil = require('../utils/jwt');
const OTPUtil = require('../utils/otp');
const { deleteFile, getFileUrl } = require('../utils/upload');
const { convertUserUrls } = require('../utils/urlHelper');

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

  // Send OTP to Mobile — no purpose needed
  // If mobile exists: send OTP to login. If not: create user and send OTP.
  static async sendOTP(req, res) {
    try {
      const { mobile_number } = req.body;

      if (!mobile_number) {
        return res.status(400).json({ error: 'mobile_number is required' });
      }

      const pool = require('../config/database');
      const result = await pool.query('SELECT id FROM users WHERE mobile_number = $1', [mobile_number]);
      const isNewUser = !result.rows[0];

      // Create user if not exists (minimal record, verified after OTP)
      if (isNewUser) {
        await pool.query(
          `INSERT INTO users (mobile_number, user_type, mobile_verified, is_verified, is_active)
           VALUES ($1, 'patient', false, false, true)`,
          [mobile_number]
        );
      }

      const otp = OTPUtil.generate(parseInt(process.env.OTP_LENGTH) || 6);
      await AuthModel.createOTP(null, mobile_number, otp, 'login');
      await OTPUtil.sendSMS(mobile_number, otp);

      res.json({
        message: 'OTP sent successfully',
        data: {
          mobile_number,
          is_new_user: isNewUser,
          expires_in_minutes: process.env.OTP_EXPIRE_MINUTES || 10,
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Verify OTP — works for both new and existing users
  static async verifyOTP(req, res) {
    try {
      const { mobile_number, otp_code } = req.body;

      if (!mobile_number || !otp_code) {
        return res.status(400).json({ success: false, message: 'mobile_number and otp_code are required', data: null, error: 'MISSING_FIELDS' });
      }

      const otpRecord = await AuthModel.verifyOTP(mobile_number, otp_code);
      if (!otpRecord) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP', data: null, error: 'INVALID_OTP' });
      }
      if (otpRecord.attempts >= 3) {
        return res.status(400).json({ success: false, message: 'Too many attempts. Please request a new OTP', data: null, error: 'MAX_ATTEMPTS' });
      }

      await AuthModel.markOTPVerified(otpRecord.id);

      const pool = require('../config/database');
      const result = await pool.query('SELECT * FROM users WHERE mobile_number = $1', [mobile_number]);
      let user = result.rows[0];

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found. Please request OTP again.', data: null, error: 'USER_NOT_FOUND' });
      }

      // Mark mobile as verified and set online
      await UserModel.update(user.id, { mobile_verified: true, is_verified: true, is_online: true, last_seen: new Date() });
      user = await UserModel.findById(user.id);
      delete user.password_hash;

      const accessToken  = JWTUtil.generateAccessToken(user.id, user.user_type);
      const refreshToken = JWTUtil.generateRefreshToken(user.id);
      const deviceInfo   = { userAgent: req.headers['user-agent'] || 'unknown', platform: req.headers['sec-ch-ua-platform'] || 'unknown' };
      await AuthModel.createRefreshToken(user.id, refreshToken, deviceInfo, req.ip);

      // Base response data
      const responseData = { user, accessToken, refreshToken };

      // If patient — enrich with patient profile + active subscription
      if (user.user_type === 'patient') {
        // Patient profile
        const patientRow = await pool.query('SELECT * FROM patients WHERE id = $1', [user.id]);
        responseData.patient = patientRow.rows[0] || null;

        // Active/latest subscription
        const subRow = await pool.query(
          `SELECT s.razorpay_subscription_id, s.razorpay_plan_id, s.plan_title, s.plan_price,
                  s.status, s.is_active, s.start_date, s.expiry_date,
                  s.total_count, s.paid_count, s.remaining_count, s.short_url,
                  p.id as db_plan_id, p.title as plan_title_db, p.price as plan_price_db,
                  p.discount_percent, p.free_checkups_annually, p.free_cleanings_annually,
                  p.free_xrays_annually, p.max_members, p.features, p.is_popular,
                  p.interval, p.interval_count, p.currency, p.procedure_rows, p.is_active as plan_is_active
           FROM subscriptions s
           LEFT JOIN plans p ON (s.razorpay_plan_id = p.razorpay_plan_id OR s.razorpay_plan_id = p.plan_id::text)
           WHERE s.patient_id = $1
           ORDER BY s.expiry_date DESC NULLS LAST
           LIMIT 1`,
          [user.id]
        );
        const sub = subRow.rows[0] || null;
        responseData.subscription = sub ? {
          subscription_id:  sub.razorpay_subscription_id,
          plan_id:          sub.razorpay_plan_id,
          plan_name:        sub.plan_title || sub.plan_title_db,
          plan_price:       sub.plan_price || sub.plan_price_db,
          status:           sub.status,
          start_date:       sub.start_date,
          expiry_date:      sub.expiry_date,
          total_count:      sub.total_count,
          paid_count:       sub.paid_count,
          remaining_count:  sub.remaining_count,
          payment_link:     sub.short_url,
          plan: sub.db_plan_id ? {
            id:                      sub.db_plan_id,
            title:                   sub.plan_title_db,
            price:                   sub.plan_price_db,
            discount_percent:        sub.discount_percent,
            free_checkups_annually:  sub.free_checkups_annually,
            free_cleanings_annually: sub.free_cleanings_annually,
            free_xrays_annually:     sub.free_xrays_annually,
            max_members:             sub.max_members,
            features:                sub.features,
            is_popular:              sub.is_popular,
            is_active:               sub.plan_is_active,
            interval:                sub.interval,
            interval_count:          sub.interval_count,
            currency:                sub.currency,
            procedure_rows:          sub.procedure_rows,
          } : null,
        } : null;
      }

      res.json({
        success: true,
        message: 'OTP verified successfully',
        data: responseData
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message, data: null, error: error.message });
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
      
      // Convert relative paths to absolute URLs
      const userWithUrls = convertUserUrls(user);
      
      res.json({ data: userWithUrls });
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

  // Mobile Login / Register — single endpoint
  // POST { mobile_number, user_type? }
  // If user exists → send OTP to login
  // If user doesn't exist → create user with user_type then send OTP
  static async mobileLoginOrRegister(req, res) {
    try {
      const { mobile_number, user_type } = req.body;

      if (!mobile_number) {
        return res.status(400).json({ error: 'mobile_number is required' });
      }

      const pool = require('../config/database');
      const existing = await pool.query('SELECT id, user_type FROM users WHERE mobile_number = $1', [mobile_number]);

      let isNewUser = false;

      if (!existing.rows[0]) {
        // Create new user
        await pool.query(
          `INSERT INTO users (mobile_number, user_type, mobile_verified, is_verified, is_active)
           VALUES ($1, $2, false, false, true)`,
          [mobile_number, user_type || 'patient']
        );
        isNewUser = true;
      }

      // Generate and send OTP
      const otp = OTPUtil.generate(parseInt(process.env.OTP_LENGTH) || 6);
      await AuthModel.createOTP(null, mobile_number, otp, 'login');
      await OTPUtil.sendSMS(mobile_number, otp);

      res.json({
        message: isNewUser
          ? 'Account created. OTP sent to your mobile number.'
          : 'OTP sent to your mobile number.',
        data: {
          mobile_number,
          is_new_user: isNewUser,
          expires_in_minutes: parseInt(process.env.OTP_EXPIRE_MINUTES) || 10,
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Mobile Registration (for Mobile App) — legacy, kept for backward compat
  static async mobileRegister(req, res) {
    try {
      const { mobile_number, full_name, user_type } = req.body;

      // Validate required fields
      if (!mobile_number || !full_name) {
        return res.status(400).json({ error: 'Mobile number and full name are required' });
      }

      // Check if user already exists with this mobile number
      const pool = require('../config/database');
      const existingUserQuery = 'SELECT * FROM users WHERE mobile_number = $1';
      const existingUserResult = await pool.query(existingUserQuery, [mobile_number]);
      
      if (existingUserResult.rows[0]) {
        return res.status(400).json({ error: 'User already exists with this mobile number' });
      }

      // Split full name into first_name and last_name
      const nameParts = full_name.trim().split(/\s+/);
      const first_name = nameParts[0];
      const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      // Create user without password (mobile-only registration)
      const user = await UserModel.create({
        mobile_number,
        first_name,
        last_name: last_name || null,
        user_type: user_type || 'patient',
        mobile_verified: false,
        is_verified: false,
        email: null,
        password_hash: null
      });

      delete user.password_hash;

      // Generate tokens
      const accessToken = JWTUtil.generateAccessToken(user.id, user.user_type);
      const refreshToken = JWTUtil.generateRefreshToken(user.id);
      
      // Store refresh token
      const deviceInfo = {
        userAgent: req.headers['user-agent'] || 'unknown',
        platform: req.headers['sec-ch-ua-platform'] || 'mobile'
      };
      
      await AuthModel.createRefreshToken(user.id, refreshToken, deviceInfo, req.ip);

      // Automatically send OTP after registration
      const otp = OTPUtil.generate(parseInt(process.env.OTP_LENGTH) || 6);
      await AuthModel.createOTP(user.id, mobile_number, otp, 'mobile_verification');
      await OTPUtil.sendSMS(mobile_number, otp);

      res.status(201).json({
        message: 'User registered successfully. OTP sent to your mobile number.',
        data: { 
          user, 
          accessToken, 
          refreshToken,
          otp_sent: true,
          otp_expires_in_minutes: process.env.OTP_EXPIRE_MINUTES || 10,
          note: 'Please verify your mobile number using the OTP sent to your phone'
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AuthController;
