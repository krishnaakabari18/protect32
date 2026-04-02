const express = require('express');
const router = express.Router();
const PlanFeatureController = require('../../controllers/planFeatureController');
const { authenticate } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Plan Features
 *   description: Manage features associated with subscription plans
 */

/**
 * @swagger
 * /plan-features:
 *   get:
 *     summary: Get all plan features
 *     tags: [Plan Features]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: plan_id
 *         schema:
 *           type: string
 *         description: Filter by plan ID
 *     responses:
 *       200:
 *         description: List of plan features
 */
router.get('/', authenticate, PlanFeatureController.getAll);

/**
 * @swagger
 * /plan-features:
 *   post:
 *     summary: Create a new plan feature
 *     tags: [Plan Features]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plan_id
 *               - feature_name
 *             properties:
 *               plan_id:
 *                 type: string
 *                 format: uuid
 *               feature_name:
 *                 type: string
 *               feature_value:
 *                 type: string
 *               is_included:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Plan feature created successfully
 */
router.post('/', authenticate, PlanFeatureController.create);

/**
 * @swagger
 * /plan-features/{id}:
 *   put:
 *     summary: Update a plan feature
 *     tags: [Plan Features]
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
 *               feature_name:
 *                 type: string
 *               feature_value:
 *                 type: string
 *               is_included:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Plan feature updated successfully
 *       404:
 *         description: Plan feature not found
 */
router.put('/:id', authenticate, PlanFeatureController.update);

/**
 * @swagger
 * /plan-features/{id}:
 *   delete:
 *     summary: Delete a plan feature
 *     tags: [Plan Features]
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
 *         description: Plan feature deleted successfully
 *       404:
 *         description: Plan feature not found
 */
router.delete('/:id', authenticate, PlanFeatureController.delete);

module.exports = router;
