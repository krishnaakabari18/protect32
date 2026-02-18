const express = require('express');
const router = express.Router();
const PatientController = require('../../controllers/patientController');
const AuthMiddleware = require('../../middleware/auth');

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
router.post('/', AuthMiddleware.authenticate, PatientController.create);

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
router.put('/:id', AuthMiddleware.authenticate, PatientController.update);

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
router.post('/:id/family-members', AuthMiddleware.authenticate, PatientController.addFamilyMember);

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

module.exports = router;
