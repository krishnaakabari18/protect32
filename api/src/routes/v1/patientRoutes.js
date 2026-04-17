const express = require('express');
const router = express.Router();
const PatientController = require('../../controllers/patientController');
const { AuthMiddleware } = require('../../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup — profile photos go to uploads/users/{userId}/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use patient ID from URL param, or logged-in user ID for self-service routes
    const userId = req.params.id || req.user?.id || 'temp';
    const uploadPath = path.join('uploads', 'users', userId);
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile_${Date.now()}${ext}`);
  }
});

const uploadPatientPhotos = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    cb(allowed.includes(file.mimetype) ? null : new Error('Only image files allowed'), allowed.includes(file.mimetype));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
}).fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'family_member_photo', maxCount: 1 }
]);

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Create a new patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               emergency_contact_name:
 *                 type: string
 *               emergency_contact_number:
 *                 type: string
 *               insurance_provider:
 *                 type: string
 *               insurance_policy_number:
 *                 type: string
 *     responses:
 *       201:
 *         description: Patient created successfully
 */
router.post('/', AuthMiddleware.authenticate, uploadPatientPhotos, PatientController.create);

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Get all patients
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of patients
 */
router.get('/', AuthMiddleware.authenticate, PatientController.getAll);

// Patient Self-Service Routes (patients manage their own family members)
// IMPORTANT: These routes must come BEFORE the /:id routes to avoid conflicts
/**
 * @swagger
 * /patients/my/family-members:
 *   get:
 *     summary: Get my family members (patient self-service)
 *     tags: [Patient Self-Service]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of my family members
 */

/**
 * @swagger
 * /patients/profile:
 *   get:
 *     summary: Get logged-in patient's profile with active subscription info
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient profile with subscription details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:         { type: object }
 *                     patient:      { type: object }
 *                     subscription: { type: object, nullable: true }
 *   put:
 *     summary: Update logged-in patient's profile (all fields via form-data)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: User first name
 *               last_name:
 *                 type: string
 *                 description: User last name
 *               email:
 *                 type: string
 *                 description: User email
 *               mobile_number:
 *                 type: string
 *                 description: Mobile number
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: "Date of birth (YYYY-MM-DD)"
 *               address:
 *                 type: string
 *                 description: User address
 *               profile_photo:
 *                 type: string
 *                 format: binary
 *                 description: "Profile photo (JPEG/PNG, max 5MB)"
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               blood_group:
 *                 type: string
 *                 enum: ["A+","A-","B+","B-","AB+","AB-","O+","O-"]
 *               height_cm:
 *                 type: integer
 *                 description: Height in cm
 *               weight_kg:
 *                 type: number
 *                 description: Weight in kg
 *               occupation:
 *                 type: string
 *               marital_status:
 *                 type: string
 *                 enum: [Single, Married, Divorced, Widowed, Separated]
 *               nationality:
 *                 type: string
 *               preferred_language:
 *                 type: string
 *               religion:
 *                 type: string
 *               secondary_phone:
 *                 type: string
 *               work_phone:
 *                 type: string
 *               preferred_contact_method:
 *                 type: string
 *                 enum: [phone, email, sms, whatsapp]
 *               address_line_1:
 *                 type: string
 *               address_line_2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postal_code:
 *                 type: string
 *               country:
 *                 type: string
 *                 default: India
 *               emergency_contact_name:
 *                 type: string
 *               emergency_contact_number:
 *                 type: string
 *               insurance_provider:
 *                 type: string
 *               insurance_policy_number:
 *                 type: string
 *               insurance_type:
 *                 type: string
 *                 enum: [Individual, Family, Group, Government]
 *               insurance_expiry_date:
 *                 type: string
 *                 format: date
 *               insurance_coverage_amount:
 *                 type: number
 *               medical_history:
 *                 type: string
 *               current_medications:
 *                 type: string
 *               allergies:
 *                 type: string
 *               chronic_conditions:
 *                 type: string
 *               previous_surgeries:
 *                 type: string
 *               family_medical_history:
 *                 type: string
 *               dental_history:
 *                 type: string
 *               dental_concerns:
 *                 type: string
 *               previous_dental_treatments:
 *                 type: string
 *               dental_anxiety_level:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               preferred_appointment_time:
 *                 type: string
 *                 enum: [morning, afternoon, evening]
 *               special_needs:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated — returns updated user, patient and subscription
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:         { type: object }
 *                     patient:      { type: object }
 *                     subscription: { type: object, nullable: true }
 */
router.get('/profile', AuthMiddleware.authenticate, async (req, res) => {
  try {
    const pool = require('../../config/database');
    const userId = req.user.id;

    // 1. Patient profile
    const patient = await PatientController.getByIdInternal(userId);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found', data: null, error: 'NOT_FOUND' });

    // 2. User info (name, email, photo)
    const userRow = await pool.query(
      'SELECT id, first_name, last_name, email, mobile_number, profile_picture, user_type, date_of_birth, address, is_verified, created_at FROM users WHERE id = $1',
      [userId]
    );
    const { convertUserUrls } = require('../../utils/urlHelper');
    const user = convertUserUrls(userRow.rows[0] || {});

    // 3. Active subscription (latest active or future plan)
    const subRow = await pool.query(
      `SELECT s.id, s.razorpay_subscription_id, s.razorpay_plan_id, s.plan_title, s.plan_price,
              s.status, s.is_active, s.start_date, s.expiry_date, s.total_count,
              s.paid_count, s.remaining_count, s.short_url,
              p.id as db_plan_id, p.title as plan_title_db, p.price as plan_price_db,
              p.discount_percent, p.free_checkups_annually, p.free_cleanings_annually,
              p.free_xrays_annually, p.max_members, p.features, p.is_popular,
              p.interval, p.interval_count, p.currency, p.procedure_rows, p.is_active as plan_is_active
       FROM subscriptions s
       LEFT JOIN plans p ON (s.razorpay_plan_id = p.razorpay_plan_id OR s.razorpay_plan_id = p.plan_id::text)
       WHERE s.patient_id = $1
       ORDER BY s.expiry_date DESC NULLS LAST
       LIMIT 1`,
      [userId]
    );
    const subscription = subRow.rows[0] || null;

    res.json({
      success: true,
      message: 'Profile fetched successfully',
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          mobile_number: user.mobile_number,
          profile_picture: user.profile_picture,
          user_type: user.user_type,
          date_of_birth: user.date_of_birth,
          address: user.address,
          is_verified: user.is_verified,
          member_since: user.created_at,
        },
        patient,
        subscription: subscription ? {
          subscription_id: subscription.razorpay_subscription_id,
          plan_id:         subscription.razorpay_plan_id,
          plan_name:       subscription.plan_title || subscription.plan_title_db,
          plan_price:      subscription.plan_price || subscription.plan_price_db,
          status:          subscription.status,
          start_date:      subscription.start_date,
          expiry_date:     subscription.expiry_date,
          total_count:     subscription.total_count,
          paid_count:      subscription.paid_count,
          remaining_count: subscription.remaining_count,
          payment_link:    subscription.short_url,
          plan: subscription.db_plan_id ? {
            id:                      subscription.db_plan_id,
            title:                   subscription.plan_title_db,
            price:                   subscription.plan_price_db,
            discount_percent:        subscription.discount_percent,
            free_checkups_annually:  subscription.free_checkups_annually,
            free_cleanings_annually: subscription.free_cleanings_annually,
            free_xrays_annually:     subscription.free_xrays_annually,
            max_members:             subscription.max_members,
            features:                subscription.features,
            is_popular:              subscription.is_popular,
            is_active:               subscription.plan_is_active,
            interval:                subscription.interval,
            interval_count:          subscription.interval_count,
            currency:                subscription.currency,
            procedure_rows:          subscription.procedure_rows,
          } : null,
        } : null,
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message, data: null, error: e.message });
  }
});

router.put('/profile', AuthMiddleware.authenticate, uploadPatientPhotos, async (req, res) => {
  try {
    const pool = require('../../config/database');
    const PatientModel = require('../../models/patientModel');
    const { convertPatientUrls } = require('../../utils/urlHelper');
    const fs = require('fs');
    const pathLib = require('path');
    const userId = req.user.id;

    // 1. Handle profile photo upload
    let photoPath = null;
    if (req.files && req.files.profile_photo && req.files.profile_photo[0]) {
      photoPath = req.files.profile_photo[0].path.replace(/\\/g, '/');
      // Move from temp folder to correct user folder if needed
      if (photoPath.includes('/temp/') || photoPath.includes('\\temp\\')) {
        const correctDir = pathLib.join('uploads', 'users', userId);
        if (!fs.existsSync(correctDir)) fs.mkdirSync(correctDir, { recursive: true });
        const newPath = pathLib.join(correctDir, pathLib.basename(photoPath));
        fs.renameSync(photoPath, newPath);
        photoPath = newPath.replace(/\\/g, '/');
      }
    }

    // 2. Update users table (first_name, last_name, email, mobile_number, date_of_birth, address, profile_picture)
    const { first_name, last_name, email, mobile_number, date_of_birth, address } = req.body;
    const userFields = []; const userValues = []; let up = 1;
    if (first_name)    { userFields.push(`first_name = $${up++}`);      userValues.push(first_name); }
    if (last_name)     { userFields.push(`last_name = $${up++}`);       userValues.push(last_name); }
    if (email)         { userFields.push(`email = $${up++}`);           userValues.push(email); }
    if (mobile_number) { userFields.push(`mobile_number = $${up++}`);   userValues.push(mobile_number); }
    if (date_of_birth) { userFields.push(`date_of_birth = $${up++}`);   userValues.push(date_of_birth); }
    if (address)       { userFields.push(`address = $${up++}`);         userValues.push(address); }
    if (photoPath)     { userFields.push(`profile_picture = $${up++}`); userValues.push(photoPath); }
    if (userFields.length) {
      userValues.push(userId);
      await pool.query(`UPDATE users SET ${userFields.join(', ')} WHERE id = $${up}`, userValues);
    }

    // 3. Build patient fields
    const patientData = {};
    const patientFields = [
      'gender','blood_group','height_cm','weight_kg','occupation',
      'marital_status','nationality','preferred_language','religion',
      'secondary_phone','work_phone','preferred_contact_method',
      'address_line_1','address_line_2','city','state','postal_code','country',
      'emergency_contact_name','emergency_contact_number',
      'insurance_provider','insurance_policy_number','insurance_type',
      'insurance_expiry_date','insurance_coverage_amount',
      'medical_history','current_medications','allergies',
      'chronic_conditions','previous_surgeries','family_medical_history',
      'dental_history','dental_concerns','previous_dental_treatments',
      'dental_anxiety_level','preferred_appointment_time','special_needs',
    ];
    patientFields.forEach(f => {
      if (req.body[f] !== undefined) patientData[f] = req.body[f] === '' ? null : req.body[f];
    });
    ['communication_preferences','appointment_preferences','privacy_settings'].forEach(f => {
      if (req.body[f] !== undefined) {
        try { patientData[f] = typeof req.body[f] === 'string' ? JSON.parse(req.body[f]) : req.body[f]; } catch {}
      }
    });
    if (photoPath) patientData.profile_photo = photoPath;

    // 4. Upsert patient record — create if not exists, update if exists
    let updatedPatient = null;
    const existingRow = await pool.query('SELECT id FROM patients WHERE id = $1', [userId]);
    if (existingRow.rows.length > 0) {
      if (Object.keys(patientData).length > 0) {
        updatedPatient = await PatientModel.update(userId, patientData);
      } else {
        updatedPatient = (await pool.query('SELECT * FROM patients WHERE id = $1', [userId])).rows[0];
      }
    } else {
      patientData.id = userId;
      updatedPatient = await PatientModel.create(patientData);
    }
    if (updatedPatient) updatedPatient = convertPatientUrls(updatedPatient);

    // 5. Fetch updated user
    const userRow = await pool.query(
      `SELECT id, first_name, last_name, email, mobile_number, profile_picture,
              user_type, date_of_birth, address, is_verified, created_at
       FROM users WHERE id = $1`, [userId]
    );
    const updatedUser = userRow.rows[0] || {};
    // Convert profile_picture to full URL
    const { convertUserUrls } = require('../../utils/urlHelper');
    const userWithUrl = convertUserUrls(updatedUser);

    // 6. Fetch active subscription
    const subRow = await pool.query(
      `SELECT s.razorpay_subscription_id, s.razorpay_plan_id, s.plan_title, s.plan_price,
              s.status, s.is_active, s.start_date, s.expiry_date, s.remaining_count,
              p.id as db_plan_id, p.title as plan_title_db, p.price as plan_price_db,
              p.discount_percent, p.free_checkups_annually, p.free_cleanings_annually,
              p.free_xrays_annually, p.max_members, p.features, p.is_popular,
              p.interval, p.interval_count, p.currency, p.procedure_rows, p.is_active as plan_is_active
       FROM subscriptions s
       LEFT JOIN plans p ON (s.razorpay_plan_id = p.razorpay_plan_id OR s.razorpay_plan_id = p.plan_id::text)
       WHERE s.patient_id = $1
       ORDER BY s.expiry_date DESC NULLS LAST LIMIT 1`, [userId]
    );
    const sub = subRow.rows[0] || null;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: userWithUrl,
        patient: updatedPatient,
        subscription: sub ? {
          subscription_id: sub.razorpay_subscription_id,
          plan_id:         sub.razorpay_plan_id,
          plan_name:       sub.plan_title || sub.plan_title_db,
          plan_price:      sub.plan_price || sub.plan_price_db,
          status:          sub.status,
          start_date:      sub.start_date,
          expiry_date:     sub.expiry_date,
          remaining_count: sub.remaining_count,
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
        } : null,
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message, data: null, error: e.message });
  }
});
router.get('/my/family-members', AuthMiddleware.authenticate, PatientController.getMyFamilyMembers);

/**
 * @swagger
 * /patients/my/family-members:
 *   post:
 *     summary: Add my family member (patient self-service)
 *     tags: [Patient Self-Service]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - relationship
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               relationship:
 *                 type: string
 *               family_member_photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Family member added successfully
 */
router.post('/my/family-members', AuthMiddleware.authenticate, uploadPatientPhotos, PatientController.addMyFamilyMember);

/**
 * @swagger
 * /patients/my/family-members/{memberId}:
 *   put:
 *     summary: Update my family member (patient self-service)
 *     tags: [Patient Self-Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Family member updated successfully
 */
router.put('/my/family-members/:memberId', AuthMiddleware.authenticate, uploadPatientPhotos, PatientController.updateMyFamilyMember);

/**
 * @swagger
 * /patients/my/family-members/{memberId}:
 *   delete:
 *     summary: Delete my family member (patient self-service)
 *     tags: [Patient Self-Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Family member deleted successfully
 */
router.delete('/my/family-members/:memberId', AuthMiddleware.authenticate, PatientController.deleteMyFamilyMember);

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient details
 */
router.get('/:id', AuthMiddleware.authenticate, PatientController.getById);

/**
 * @swagger
 * /patients/{id}:
 *   put:
 *     summary: Update patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Patient updated successfully
 */
router.put('/:id', AuthMiddleware.authenticate, uploadPatientPhotos, PatientController.update);

/**
 * @swagger
 * /patients/{id}/family-members:
 *   post:
 *     summary: Add family member
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - relationship
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               relationship:
 *                 type: string
 *               mobile_number:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Family member added successfully
 */
router.post('/:id/family-members', AuthMiddleware.authenticate, uploadPatientPhotos, PatientController.addFamilyMember);

/**
 * @swagger
 * /patients/{id}/family-members:
 *   get:
 *     summary: Get patient family members
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of family members
 */
router.get('/:id/family-members', AuthMiddleware.authenticate, PatientController.getFamilyMembers);

/**
 * @swagger
 * /patients/{id}/family-members/{memberId}:
 *   put:
 *     summary: Update family member
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Family member updated successfully
 */
router.put('/:id/family-members/:memberId', AuthMiddleware.authenticate, uploadPatientPhotos, PatientController.updateFamilyMember);

/**
 * @swagger
 * /patients/{id}/family-members/{memberId}:
 *   delete:
 *     summary: Delete family member
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Family member deleted successfully
 */
router.delete('/:id/family-members/:memberId', AuthMiddleware.authenticate, PatientController.deleteFamilyMember);

module.exports = router;
