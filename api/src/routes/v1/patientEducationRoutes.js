const express = require('express');
const router = express.Router();
const PatientEducationController = require('../../controllers/patientEducationController');
const AuthMiddleware = require('../../middleware/auth');
const { upload } = require('../../utils/educationImageUpload');

/**
 * @swagger
 * tags:
 *   name: Patient Education
 *   description: Patient education content management
 */

/**
 * @swagger
 * /patient-education:
 *   post:
 *     summary: Create new patient education content
 *     tags: [Patient Education]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Understanding Diabetes"
 *               category:
 *                 type: string
 *                 example: "Chronic Conditions"
 *               content:
 *                 type: string
 *                 example: "Detailed information about diabetes management..."
 *               summary:
 *                 type: string
 *                 example: "Learn about diabetes management"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["diabetes", "health", "chronic"]
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *                 example: "Active"
 *     responses:
 *       201:
 *         description: Content created successfully
 *       400:
 *         description: Missing required fields
 */
router.post('/', AuthMiddleware.authenticate, upload.single('feature_image'), PatientEducationController.create);

/**
 * @swagger
 * /patient-education:
 *   get:
 *     summary: Get all patient education content
 *     tags: [Patient Education]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Inactive]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of patient education content
 */
router.get('/', AuthMiddleware.authenticate, PatientEducationController.getAll);

/**
 * @swagger
 * /patient-education/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Patient Education]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/categories', AuthMiddleware.authenticate, PatientEducationController.getCategories);

/**
 * @swagger
 * /patient-education/statistics:
 *   get:
 *     summary: Get content statistics
 *     tags: [Patient Education]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics data
 */
router.get('/statistics', AuthMiddleware.authenticate, PatientEducationController.getStatistics);

/**
 * @swagger
 * /patient-education/{id}:
 *   get:
 *     summary: Get patient education content by ID
 *     tags: [Patient Education]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Content details
 *       404:
 *         description: Content not found
 */
router.get('/:id', AuthMiddleware.authenticate, PatientEducationController.getById);

/**
 * @swagger
 * /patient-education/{id}:
 *   put:
 *     summary: Update patient education content
 *     tags: [Patient Education]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               content:
 *                 type: string
 *               summary:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *     responses:
 *       200:
 *         description: Content updated successfully
 *       404:
 *         description: Content not found
 */
router.put('/:id', AuthMiddleware.authenticate, upload.single('feature_image'), PatientEducationController.update);

/**
 * @swagger
 * /patient-education/{id}/status:
 *   patch:
 *     summary: Update content status
 *     tags: [Patient Education]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *                 example: "Inactive"
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Content not found
 */
router.patch('/:id/status', AuthMiddleware.authenticate, PatientEducationController.updateStatus);

/**
 * @swagger
 * /patient-education/{id}:
 *   delete:
 *     summary: Delete patient education content
 *     tags: [Patient Education]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Content deleted successfully
 *       404:
 *         description: Content not found
 */
router.delete('/:id', AuthMiddleware.authenticate, PatientEducationController.delete);

module.exports = router;
