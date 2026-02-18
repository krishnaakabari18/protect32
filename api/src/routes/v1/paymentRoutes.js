const express = require('express');
const router = express.Router();
const PaymentController = require('../../controllers/paymentController');
const AuthMiddleware = require('../../middleware/auth');

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - provider_id
 *               - amount
 *               - payment_method
 *             properties:
 *               patient_id:
 *                 type: string
 *               provider_id:
 *                 type: string
 *               appointment_id:
 *                 type: string
 *               treatment_plan_id:
 *                 type: string
 *               amount:
 *                 type: number
 *               payment_method:
 *                 type: string
 *               transaction_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment created successfully
 */
router.post('/', AuthMiddleware.authenticate, PaymentController.create);

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patient_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: provider_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of payments
 */
router.get('/', AuthMiddleware.authenticate, PaymentController.getAll);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
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
 *         description: Payment details
 */
router.get('/:id', AuthMiddleware.authenticate, PaymentController.getById);

/**
 * @swagger
 * /payments/{id}:
 *   put:
 *     summary: Update payment
 *     tags: [Payments]
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
 *         description: Payment updated successfully
 */
router.put('/:id', AuthMiddleware.authenticate, PaymentController.update);

module.exports = router;
