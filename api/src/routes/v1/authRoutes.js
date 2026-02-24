const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/authController');
const AuthMiddleware = require('../../middleware/auth');
const { uploadProfilePicture } = require('../../utils/upload');

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - first_name
 *         - last_name
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         mobile_number:
 *           type: string
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         user_type:
 *           type: string
 *           enum: [patient, provider, admin]
 *         date_of_birth:
 *           type: string
 *           format: date
 *         address:
 *           type: string
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             accessToken:
 *               type: string
 *             refreshToken:
 *               type: string
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               mobile_number:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               user_type:
 *                 type: string
 *                 enum: [patient, provider, admin]
 *               profile_picture:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture image file (JPEG, PNG, GIF, WebP - max 5MB)
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: User already exists
 */
router.post('/register', uploadProfilePicture, AuthController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP to mobile number
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile_number
 *               - purpose
 *             properties:
 *               mobile_number:
 *                 type: string
 *                 example: "+1234567890"
 *               purpose:
 *                 type: string
 *                 enum: [registration, login, password_reset, mobile_verification]
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post('/send-otp', AuthController.sendOTP);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP and login/register/verify mobile
 *     tags: [Authentication]
 *     description: |
 *       Verify OTP code sent to mobile number.
 *       - For mobile_verification: Verifies and activates existing user's mobile number
 *       - For registration: Creates new user account
 *       - For login: Authenticates existing user
 *       - For password_reset: Allows password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile_number
 *               - otp_code
 *               - purpose
 *             properties:
 *               mobile_number:
 *                 type: string
 *                 example: "+1234567890"
 *                 description: Mobile number with country code
 *               otp_code:
 *                 type: string
 *                 example: "123456"
 *                 description: 6-digit OTP code (123456 in test mode)
 *               purpose:
 *                 type: string
 *                 enum: [registration, login, password_reset, mobile_verification]
 *                 example: "mobile_verification"
 *                 description: Purpose of OTP verification
 *               user_data:
 *                 type: object
 *                 description: Required only for registration purpose
 *                 properties:
 *                   first_name:
 *                     type: string
 *                   last_name:
 *                     type: string
 *                   user_type:
 *                     type: string
 *                   password:
 *                     type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP verified successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         mobile_number:
 *                           type: string
 *                         first_name:
 *                           type: string
 *                         last_name:
 *                           type: string
 *                         mobile_verified:
 *                           type: boolean
 *                           example: true
 *                         is_verified:
 *                           type: boolean
 *                           example: true
 *                         user_type:
 *                           type: string
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or expired OTP"
 */
router.post('/verify-otp', AuthController.verifyOTP);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Login with Google
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - google_id
 *               - email
 *             properties:
 *               google_id:
 *                 type: string
 *               email:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               picture:
 *                 type: string
 *     responses:
 *       200:
 *         description: Google login successful
 */
router.post('/google', AuthController.googleCallback);

/**
 * @swagger
 * /auth/facebook:
 *   post:
 *     summary: Login with Facebook
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - facebook_id
 *             properties:
 *               facebook_id:
 *                 type: string
 *               email:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               picture:
 *                 type: string
 *     responses:
 *       200:
 *         description: Facebook login successful
 */
router.post('/facebook', AuthController.facebookCallback);

/**
 * @swagger
 * /auth/apple:
 *   post:
 *     summary: Login with Apple
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apple_id
 *             properties:
 *               apple_id:
 *                 type: string
 *               email:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Apple login successful
 */
router.post('/apple', AuthController.appleCallback);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post('/refresh-token', AuthController.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout from current device
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', AuthMiddleware.authenticate, AuthController.logout);

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices
 */
router.post('/logout-all', AuthMiddleware.authenticate, AuthController.logoutAll);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/profile', AuthMiddleware.authenticate, AuthController.getProfile);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - old_password
 *               - new_password
 *             properties:
 *               old_password:
 *                 type: string
 *               new_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.post('/change-password', AuthMiddleware.authenticate, AuthController.changePassword);

/**
 * @swagger
 * /auth/mobile-register:
 *   post:
 *     summary: Register user with mobile number and full name (for Mobile App)
 *     tags: [Authentication]
 *     description: |
 *       Register a new user using mobile number and full name.
 *       - Full name will be automatically split into first_name and last_name
 *       - First word becomes first_name (required)
 *       - Remaining words become last_name (optional)
 *       - No password required for mobile registration
 *       - OTP is automatically sent to the mobile number after registration
 *       - User should verify mobile number using the OTP received
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile_number
 *               - full_name
 *             properties:
 *               mobile_number:
 *                 type: string
 *                 example: "+1234567890"
 *                 description: Mobile number with country code
 *               full_name:
 *                 type: string
 *                 example: "John Doe"
 *                 description: Full name (will be split into first and last name)
 *               user_type:
 *                 type: string
 *                 enum: [patient, provider, admin]
 *                 default: patient
 *                 description: User type (defaults to patient)
 *     responses:
 *       201:
 *         description: User registered successfully and OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully. OTP sent to your mobile number."
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         mobile_number:
 *                           type: string
 *                         first_name:
 *                           type: string
 *                         last_name:
 *                           type: string
 *                         user_type:
 *                           type: string
 *                         mobile_verified:
 *                           type: boolean
 *                         is_verified:
 *                           type: boolean
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token
 *                     otp_sent:
 *                       type: boolean
 *                       example: true
 *                       description: Indicates OTP was sent
 *                     otp_expires_in_minutes:
 *                       type: number
 *                       example: 10
 *                       description: OTP expiry time in minutes
 *                     note:
 *                       type: string
 *                       example: "Please verify your mobile number using the OTP sent to your phone"
 *       400:
 *         description: Bad request - Missing required fields or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Mobile number and full name are required"
 */
router.post('/mobile-register', AuthController.mobileRegister);

module.exports = router;
