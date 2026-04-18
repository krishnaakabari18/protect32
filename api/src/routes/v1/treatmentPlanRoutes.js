const express = require('express');
const router = express.Router();
const TreatmentPlanController = require('../../controllers/treatmentPlanController');
const { AuthMiddleware } = require('../../middleware/auth');

/**
 * @swagger
 * /treatment-plans:
 *   post:
 *     summary: Create a new treatment plan
 *     tags: [TreatmentPlans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patient_id:           { type: string, format: uuid }
 *               provider_id:          { type: string, format: uuid }
 *               diagnosis:            { type: string, description: "JSON array of procedure IDs" }
 *               procedure_items:      { type: array }
 *               treatment_description:{ type: string }
 *               estimated_cost:       { type: number }
 *               start_date:           { type: string, format: date }
 *               end_date:             { type: string, format: date }
 *               status:               { type: string, enum: [Proposed, Consented, Paid, Rejected] }
 *               notes:                { type: string }
 *     responses:
 *       201:
 *         description: Treatment plan created successfully
 *   get:
 *     summary: Get all treatment plans
 *     tags: [TreatmentPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Proposed, Consented, Paid, Rejected] }
 *       - in: query
 *         name: patient_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: provider_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: List of treatment plans
 */
router.post('/', AuthMiddleware.authenticate, TreatmentPlanController.create);
router.get('/', AuthMiddleware.authenticate, TreatmentPlanController.getAll);

/**
 * @swagger
 * /treatment-plans/{id}:
 *   get:
 *     summary: Get treatment plan by ID
 *     tags: [TreatmentPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Treatment plan details
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update treatment plan
 *     tags: [TreatmentPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Treatment plan updated successfully
 *   delete:
 *     summary: Delete treatment plan
 *     tags: [TreatmentPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Treatment plan deleted successfully
 */
router.get('/:id', AuthMiddleware.authenticate, TreatmentPlanController.getById);
router.put('/:id', AuthMiddleware.authenticate, TreatmentPlanController.update);
router.delete('/:id', AuthMiddleware.authenticate, TreatmentPlanController.delete);

module.exports = router;
