const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/settingsController');
const { uploadSettingsImages } = require('../../controllers/settingsController');
const { authenticate } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: System settings management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Settings:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Settings ID
 *         razorpay_key_id:
 *           type: string
 *           description: Razorpay API Key ID
 *           example: rzp_test_xxxxxxxxxxxxx
 *         razorpay_key_secret:
 *           type: string
 *           description: Razorpay API Key Secret (masked in response)
 *           example: "***********"
 *         razorpay_enabled:
 *           type: boolean
 *           description: Enable/Disable Razorpay payments
 *           example: true
 *         smtp_mailer:
 *           type: string
 *           description: Email mailer type
 *           example: SMTP
 *         smtp_host:
 *           type: string
 *           description: SMTP server host
 *           example: smtp-relay.brevo.com
 *         smtp_port:
 *           type: integer
 *           description: SMTP server port
 *           example: 587
 *         smtp_username:
 *           type: string
 *           description: SMTP username
 *           example: user@example.com
 *         smtp_password:
 *           type: string
 *           description: SMTP password (masked in response)
 *           example: "***********"
 *         smtp_from_address:
 *           type: string
 *           description: From email address
 *           example: no-reply@example.com
 *         smtp_from_name:
 *           type: string
 *           description: From name
 *           example: Protect32
 *         smtp_encryption:
 *           type: string
 *           enum: [TLS, SSL]
 *           description: SMTP encryption type
 *           example: TLS
 *         site_logo:
 *           type: string
 *           description: Site logo file path or URL
 *         site_name:
 *           type: string
 *           description: Site name
 *           example: Protect32
 *         favicon:
 *           type: string
 *           description: Favicon file path or URL
 *         footer_text:
 *           type: string
 *           description: Footer copyright text
 *           example: "Copyright © 2026, All rights reserved"
 *         invoice_prefix:
 *           type: string
 *           description: Invoice number prefix
 *           example: INV
 *         invoice_starting_number:
 *           type: integer
 *           description: Starting invoice number
 *           example: 1
 *         invoice_number_format:
 *           type: string
 *           description: Invoice number format pattern
 *           example: "[prefix]-[number]"
 *         google_analytics_code:
 *           type: string
 *           description: Google Analytics tracking code
 *         facebook_pixel_code:
 *           type: string
 *           description: Facebook Pixel tracking code
 *         custom_tracking_code:
 *           type: string
 *           description: Custom tracking code
 *         sms_provider:
 *           type: string
 *           enum: [twilio, msg91, other]
 *           description: SMS provider name
 *           example: twilio
 *         sms_api_key:
 *           type: string
 *           description: SMS API key
 *         sms_api_secret:
 *           type: string
 *           description: SMS API secret (masked in response)
 *           example: "***********"
 *         sms_sender_id:
 *           type: string
 *           description: SMS sender ID
 *           example: PRTCT32
 *         sms_enabled:
 *           type: boolean
 *           description: Enable/Disable SMS notifications
 *           example: false
 *         whatsapp_api_key:
 *           type: string
 *           description: WhatsApp API key
 *         whatsapp_api_secret:
 *           type: string
 *           description: WhatsApp API secret (masked in response)
 *           example: "***********"
 *         whatsapp_enabled:
 *           type: boolean
 *           description: Enable/Disable WhatsApp notifications
 *           example: false
 *         seo_meta_title:
 *           type: string
 *           description: SEO meta title
 *           example: "Protect32 - Dental Management System"
 *         seo_meta_description:
 *           type: string
 *           description: SEO meta description
 *         seo_meta_keywords:
 *           type: string
 *           description: SEO meta keywords (comma separated)
 *           example: "dental, clinic, management, system"
 *         seo_og_image:
 *           type: string
 *           description: Open Graph image URL
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         updated_by:
 *           type: string
 *           format: uuid
 *           description: User ID who last updated
 */

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Get system settings
 *     description: Retrieve all system settings. Sensitive data (passwords, secrets) are masked.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Settings'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Settings not found
 */
router.get('/', authenticate, settingsController.getSettings);

/**
 * @swagger
 * /settings:
 *   put:
 *     summary: Update system settings
 *     description: Update one or more system settings. Only provided fields will be updated.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               razorpay_key_id:
 *                 type: string
 *                 example: rzp_test_xxxxxxxxxxxxx
 *               razorpay_key_secret:
 *                 type: string
 *                 example: your_secret_key
 *               razorpay_enabled:
 *                 type: boolean
 *                 example: true
 *               smtp_host:
 *                 type: string
 *                 example: smtp-relay.brevo.com
 *               smtp_port:
 *                 type: integer
 *                 example: 587
 *               smtp_username:
 *                 type: string
 *                 example: user@example.com
 *               smtp_password:
 *                 type: string
 *                 example: your_password
 *               smtp_from_address:
 *                 type: string
 *                 example: no-reply@example.com
 *               smtp_from_name:
 *                 type: string
 *                 example: Protect32
 *               smtp_encryption:
 *                 type: string
 *                 enum: [TLS, SSL]
 *                 example: TLS
 *               site_name:
 *                 type: string
 *                 example: Protect32
 *               footer_text:
 *                 type: string
 *                 example: "Copyright © 2026, All rights reserved"
 *               invoice_prefix:
 *                 type: string
 *                 example: INV
 *               invoice_starting_number:
 *                 type: integer
 *                 example: 1
 *               invoice_number_format:
 *                 type: string
 *                 example: "[prefix]-[number]"
 *               google_analytics_code:
 *                 type: string
 *               sms_provider:
 *                 type: string
 *                 enum: [twilio, msg91, other]
 *                 example: twilio
 *               sms_api_key:
 *                 type: string
 *               sms_enabled:
 *                 type: boolean
 *                 example: false
 *               seo_meta_title:
 *                 type: string
 *                 example: "Protect32 - Dental Management System"
 *               seo_meta_description:
 *                 type: string
 *               seo_meta_keywords:
 *                 type: string
 *                 example: "dental, clinic, management"
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Settings updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Settings'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/', authenticate, settingsController.updateSettings);

/**
 * @swagger
 * /settings/test-smtp:
 *   post:
 *     summary: Test SMTP connection
 *     description: Test SMTP email server connection with provided credentials
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - smtp_host
 *               - smtp_port
 *               - smtp_username
 *               - smtp_password
 *             properties:
 *               smtp_host:
 *                 type: string
 *                 description: SMTP server host
 *                 example: smtp-relay.brevo.com
 *               smtp_port:
 *                 type: integer
 *                 description: SMTP server port
 *                 example: 587
 *               smtp_username:
 *                 type: string
 *                 description: SMTP username
 *                 example: user@example.com
 *               smtp_password:
 *                 type: string
 *                 description: SMTP password
 *                 example: your_password
 *               smtp_from_address:
 *                 type: string
 *                 description: From email address
 *                 example: no-reply@example.com
 *     responses:
 *       200:
 *         description: SMTP test result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: SMTP connection test successful
 *       400:
 *         description: Missing required SMTP configuration
 *       500:
 *         description: SMTP connection test failed
 */
router.post('/test-smtp', authenticate, settingsController.testSMTP);

/**
 * @swagger
 * /settings/test-razorpay:
 *   post:
 *     summary: Test Razorpay connection
 *     description: Test Razorpay payment gateway connection with provided credentials
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_key_id
 *               - razorpay_key_secret
 *             properties:
 *               razorpay_key_id:
 *                 type: string
 *                 description: Razorpay Key ID
 *                 example: rzp_test_xxxxxxxxxxxxx
 *               razorpay_key_secret:
 *                 type: string
 *                 description: Razorpay Key Secret
 *                 example: your_secret_key
 *     responses:
 *       200:
 *         description: Razorpay test result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Razorpay connection test successful
 *       400:
 *         description: Missing Razorpay credentials
 *       500:
 *         description: Razorpay connection test failed
 */
router.post('/test-razorpay', authenticate, settingsController.testRazorpay);

/**
 * @swagger
 * /settings/test-sms:
 *   post:
 *     summary: Test SMS connection
 *     description: Test SMS provider connection with provided credentials
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sms_provider
 *               - sms_api_key
 *             properties:
 *               sms_provider:
 *                 type: string
 *                 enum: [twilio, msg91, other]
 *                 description: SMS provider name
 *                 example: twilio
 *               sms_api_key:
 *                 type: string
 *                 description: SMS API key
 *                 example: your_api_key
 *               sms_api_secret:
 *                 type: string
 *                 description: SMS API secret (optional)
 *                 example: your_api_secret
 *     responses:
 *       200:
 *         description: SMS test result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: SMS connection test successful
 *       400:
 *         description: Missing SMS configuration
 *       500:
 *         description: SMS connection test failed
 */
router.post('/test-sms', authenticate, settingsController.testSMS);

/**
 * @swagger
 * /settings/upload-images:
 *   post:
 *     summary: Upload Site Logo, Favicon and Open Graph Image
 *     description: Upload one or more branding images. Each is stored in uploads/settings/ and the path is saved to settings.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               site_logo:
 *                 type: string
 *                 format: binary
 *                 description: Site logo image (JPEG, PNG, WebP — max 5MB)
 *               favicon:
 *                 type: string
 *                 format: binary
 *                 description: Favicon image (ICO, PNG — max 5MB)
 *               og_image:
 *                 type: string
 *                 format: binary
 *                 description: Open Graph image for social sharing (JPEG, PNG — max 5MB)
 *     responses:
 *       200:
 *         description: Images uploaded and saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Images uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     site_logo:
 *                       type: string
 *                       example: http://localhost:8080/uploads/settings/site_logo_1234567890.png
 *                     favicon:
 *                       type: string
 *                       example: http://localhost:8080/uploads/settings/favicon_1234567890.ico
 *                     seo_og_image:
 *                       type: string
 *                       example: http://localhost:8080/uploads/settings/og_image_1234567890.jpg
 *       400:
 *         description: No image files provided
 *       401:
 *         description: Unauthorized
 */
router.post('/upload-images', authenticate, (req, res, next) => {
  uploadSettingsImages(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, error: err.message });
    next();
  });
}, settingsController.uploadImages);

module.exports = router;
