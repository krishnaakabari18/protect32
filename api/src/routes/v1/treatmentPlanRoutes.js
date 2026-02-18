const express = require('express');
const router = express.Router();
const TreatmentPlanController = require('../../controllers/treatmentPlanController');
const AuthMiddleware = require('../../middleware/auth');

/**
 * @swagger
 * /treatmentPlans:
 *   post:
 *     summary: Create a new treatmentPlan
 *     tags: [TreatmentPlans]
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
 *         description: treatmentPlan created successfully
 */
router.post('/', AuthMiddleware.authenticate, TreatmentPlanController.create);

/**
 * @swagger
 * /treatmentPlans:
 *   get:
 *     summary: Get all treatmentPlans
 *     tags: [TreatmentPlans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of treatmentPlans
 */
router.get('/', AuthMiddleware.authenticate, TreatmentPlanController.getAll);

/**
 * @swagger
 * /treatmentPlans/{id}:
 *   get:
 *     summary: Get treatmentPlan by ID
 *     tags: [TreatmentPlans]
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
 *         description: treatmentPlan details
 */
router.get('/:id', AuthMiddleware.authenticate, TreatmentPlanController.getById);

/**
 * @swagger
 * /treatmentPlans/{id}:
 *   put:
 *     summary: Update treatmentPlan
 *     tags: [TreatmentPlans]
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
 *         description: treatmentPlan updated successfully
 */
router.put('/:id', AuthMiddleware.authenticate, TreatmentPlanController.update);

/**
 * @swagger
 * /treatmentPlans/{id}:
 *   delete:
 *     summary: Delete treatmentPlan
 *     tags: [TreatmentPlans]
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
 *         description: treatmentPlan deleted successfully
 */
router.delete('/:id', AuthMiddleware.authenticate, TreatmentPlanController.delete);

module.exports = router;
