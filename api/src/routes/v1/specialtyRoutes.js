const express = require('express');
const router = express.Router();
const SpecialtyController = require('../../controllers/specialtyController');
const { authenticate } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Specialties
 *   description: Dental specialty management
 */

/**
 * @swagger
 * /api/v1/specialties:
 *   get:
 *     summary: Get all specialties
 *     tags: [Specialties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of specialties
 */
router.get('/', authenticate, SpecialtyController.getAll);

/**
 * @swagger
 * /api/v1/specialties/{id}:
 *   get:
 *     summary: Get specialty by ID
 *     tags: [Specialties]
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
 *         description: Specialty details
 *       404:
 *         description: Specialty not found
 */
router.get('/:id', authenticate, SpecialtyController.getById);

/**
 * @swagger
 * /api/v1/specialties:
 *   post:
 *     summary: Create a new specialty
 *     tags: [Specialties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Specialty created
 *       400:
 *         description: Invalid input
 */
router.post('/', authenticate, SpecialtyController.create);

/**
 * @swagger
 * /api/v1/specialties/{id}:
 *   put:
 *     summary: Update specialty
 *     tags: [Specialties]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Specialty updated
 *       404:
 *         description: Specialty not found
 */
router.put('/:id', authenticate, SpecialtyController.update);

/**
 * @swagger
 * /api/v1/specialties/{id}:
 *   delete:
 *     summary: Delete specialty
 *     tags: [Specialties]
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
 *         description: Specialty deleted
 *       404:
 *         description: Specialty not found
 */
router.delete('/:id', authenticate, SpecialtyController.delete);

module.exports = router;
