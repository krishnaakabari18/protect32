const express = require('express');
const router = express.Router();
const SubscriptionController = require('../../controllers/subscriptionController');
const { authenticate } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Razorpay subscription management
 */

/**
 * @swagger
 * /subscriptions/plans/create:
 *   post:
 *     summary: Create a plan in Razorpay and store in DB
 *     tags: [Subscriptions]
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
 *               - amount
 *             properties:
 *               name:
 *                 type: string
 *                 example: Gold Plan
 *               amount:
 *                 type: number
 *                 description: Amount in INR
 *                 example: 999
 *               currency:
 *                 type: string
 *                 default: INR
 *               interval:
 *                 type: string
 *                 enum: [daily, weekly, monthly, yearly]
 *                 default: monthly
 *               interval_count:
 *                 type: integer
 *                 default: 1
 *               plan_id:
 *                 type: string
 *                 description: Existing DB plan UUID to link (optional)
 *     responses:
 *       201:
 *         description: Plan created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/plans/create', authenticate, SubscriptionController.createPlan);

/**
 * @swagger
 * /subscriptions/plans:
 *   get:
 *     summary: Get all plans with Razorpay info
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
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
 *                     type: object
 *                 total:
 *                   type: integer
 */
router.get('/plans', authenticate, SubscriptionController.getPlans);

/**
 * @swagger
 * /subscriptions/create:
 *   post:
 *     summary: Create a Razorpay subscription for a user
 *     tags: [Subscriptions]
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
 *               - name
 *               - email
 *               - contact
 *             properties:
 *               plan_id:
 *                 type: string
 *                 description: DB plan UUID
 *               user_id:
 *                 type: string
 *                 description: DB user UUID (optional)
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               contact:
 *                 type: string
 *                 example: "9999999999"
 *               total_count:
 *                 type: integer
 *                 default: 12
 *                 description: Number of billing cycles
 *     responses:
 *       201:
 *         description: Subscription created with payment link
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscription_id:
 *                       type: string
 *                     razorpay_subscription_id:
 *                       type: string
 *                     payment_link:
 *                       type: string
 *                     status:
 *                       type: string
 *                     razorpay_key:
 *                       type: string
 */
router.post('/create', authenticate, SubscriptionController.createSubscription);

/**
 * @swagger
 * /subscriptions:
 *   get:
 *     summary: Get all subscriptions
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [created, active, cancelled, completed, payment_failed]
 *         description: Filter by status
 *       - in: query
 *         name: plan_id
 *         schema:
 *           type: string
 *         description: Filter by plan ID
 *     responses:
 *       200:
 *         description: List of subscriptions
 */
router.get('/', authenticate, SubscriptionController.getSubscriptions);

/**
 * @swagger
 * /subscriptions/{id}:
 *   get:
 *     summary: Get subscription by ID
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription UUID
 *     responses:
 *       200:
 *         description: Subscription details
 *       404:
 *         description: Subscription not found
 */
router.get('/:id', authenticate, SubscriptionController.getSubscriptionById);

/**
 * @swagger
 * /subscriptions/verify:
 *   post:
 *     summary: Verify Razorpay payment signature and activate subscription
 *     tags: [Subscriptions]
 *     description: Call this after successful payment on the frontend
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_payment_id
 *               - razorpay_subscription_id
 *               - razorpay_signature
 *             properties:
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_subscription_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified and subscription activated
 *       400:
 *         description: Invalid signature
 */
router.post('/verify', SubscriptionController.verifyPayment);

/**
 * @swagger
 * /subscriptions/cancel:
 *   post:
 *     summary: Cancel a Razorpay subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subscription_id
 *             properties:
 *               subscription_id:
 *                 type: string
 *                 description: DB subscription UUID
 *               cancel_at_cycle_end:
 *                 type: integer
 *                 enum: [0, 1]
 *                 default: 0
 *                 description: 0 = cancel immediately, 1 = cancel at end of billing cycle
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *       404:
 *         description: Subscription not found
 */
router.post('/cancel', authenticate, SubscriptionController.cancelSubscription);

/**
 * @swagger
 * /subscriptions/webhook:
 *   post:
 *     summary: Razorpay webhook endpoint
 *     tags: [Subscriptions]
 *     description: |
 *       Configure this URL in Razorpay Dashboard > Settings > Webhooks.
 *       Handles events: subscription.activated, subscription.cancelled,
 *       subscription.completed, payment.captured, payment.failed
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 example: subscription.activated
 *               payload:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/webhook', SubscriptionController.webhook);

module.exports = router;
