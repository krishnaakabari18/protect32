const express = require('express');
const router = express.Router();
const PrescriptionController = require('../../controllers/prescriptionController');
const { AuthMiddleware } = require('../../middleware/auth');

/**
 * @swagger
 * /prescriptions:
 *   post:
 *     summary: Create a new prescription
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: prescription created successfully
 */
router.post('/', AuthMiddleware.authenticate, PrescriptionController.create);

/**
 * @swagger
 * /prescriptions:
 *   get:
 *     summary: Get all prescriptions with filters
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patient_id
 *         schema: { type: string, format: uuid }
 *         description: Filter by patient ID
 *       - in: query
 *         name: provider_id
 *         schema: { type: string, format: uuid }
 *         description: Filter by provider ID
 *       - in: query
 *         name: medication_name
 *         schema: { type: string }
 *         description: Search by medication name
 *       - in: query
 *         name: date_prescribed
 *         schema: { type: string, format: date }
 *         description: Filter by exact date prescribed (YYYY-MM-DD)
 *       - in: query
 *         name: from_date
 *         schema: { type: string, format: date }
 *         description: Filter from date
 *       - in: query
 *         name: to_date
 *         schema: { type: string, format: date }
 *         description: Filter to date
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by patient name or medication
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: List of prescriptions with pagination
 */
router.get('/', AuthMiddleware.authenticate, PrescriptionController.getAll);

/**
 * @swagger
 * /prescriptions/{id}:
 *   get:
 *     summary: Get prescription by ID
 *     tags: [Prescriptions]
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
 *         description: prescription details
 */
router.get('/:id', AuthMiddleware.authenticate, PrescriptionController.getById);

/**
 * @swagger
 * /prescriptions/{id}:
 *   put:
 *     summary: Update prescription
 *     tags: [Prescriptions]
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
 *         description: prescription updated successfully
 */
router.put('/:id', AuthMiddleware.authenticate, PrescriptionController.update);

/**
 * @swagger
 * /prescriptions/{id}:
 *   delete:
 *     summary: Delete prescription
 *     tags: [Prescriptions]
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
 *         description: prescription deleted successfully
 */
router.delete('/:id', AuthMiddleware.authenticate, PrescriptionController.delete);

module.exports = router;
