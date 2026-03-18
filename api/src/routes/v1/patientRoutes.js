const express = require('express');
const router = express.Router();
const PatientController = require('../../controllers/patientController');
const AuthMiddleware = require('../../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for patient photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const uploadPath = path.join('uploads', 'patients', String(year), month, day);
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${path.basename(file.originalname, ext).replace(/\s+/g, '_')}${ext}`);
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
