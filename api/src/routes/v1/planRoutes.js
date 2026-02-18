const express = require('express');
const router = express.Router();
const PlanController = require('../../controllers/planController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Plan:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         price:
 *           type: number
 *         features:
 *           type: array
 *           items:
 *             type: string
 *         is_popular:
 *           type: boolean
 *         max_members:
 *           type: integer
 *         discount_percent:
 *           type: integer
 *         free_checkups_annually:
 *           type: integer
 *         free_cleanings_annually:
 *           type: integer
 *         free_xrays_annually:
 *           type: integer
 *         is_active:
 *           type: boolean
 */

/**
 * @swagger
 * /plans:
 *   post:
 *     summary: Create a new plan
 *     tags: [Plans]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - features
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               is_popular:
 *                 type: boolean
 *               max_members:
 *                 type: integer
 *               discount_percent:
 *                 type: integer
 *               free_checkups_annually:
 *                 type: integer
 *               free_cleanings_annually:
 *                 type: integer
 *               free_xrays_annually:
 *                 type: integer
 *               color_scheme:
 *                 type: object
 *     responses:
 *       201:
 *         description: Plan created successfully
 */
router.post('/', PlanController.createPlan);

/**
 * @swagger
 * /plans:
 *   get:
 *     summary: Get all plans
 *     tags: [Plans]
 *     parameters:
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of plans
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Plan'
 */
router.get('/', PlanController.getAllPlans);

/**
 * @swagger
 * /plans/{id}:
 *   get:
 *     summary: Get plan by ID
 *     tags: [Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Plan details
 *       404:
 *         description: Plan not found
 */
router.get('/:id', PlanController.getPlanById);

/**
 * @swagger
 * /plans/{id}:
 *   put:
 *     summary: Update plan
 *     tags: [Plans]
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
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               is_popular:
 *                 type: boolean
 *               max_members:
 *                 type: integer
 *               discount_percent:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *       404:
 *         description: Plan not found
 */
router.put('/:id', PlanController.updatePlan);

/**
 * @swagger
 * /plans/{id}:
 *   delete:
 *     summary: Delete plan
 *     tags: [Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Plan deleted successfully
 *       404:
 *         description: Plan not found
 */
router.delete('/:id', PlanController.deletePlan);

module.exports = router;
