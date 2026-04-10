const PlanModel = require('../models/planModel');
const SubscriptionModel = require('../models/subscriptionModel');
const rzService = require('../services/razorpayService');
const pool = require('../config/database');

class SubscriptionController {

  // ── Plans ────────────────────────────────────────────────────────────────

  /**
   * @swagger
   * /subscriptions/plans/create:
   *   post:
   *     summary: Create a plan in Razorpay and store in DB
   *     tags: [Subscriptions]
   *     security: [{bearerAuth: []}]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, amount]
   *             properties:
   *               name:        { type: string }
   *               amount:      { type: number, description: "Amount in INR" }
   *               currency:    { type: string, default: INR }
   *               interval:    { type: string, enum: [daily,weekly,monthly,yearly], default: monthly }
   *               interval_count: { type: integer, default: 1 }
   *               plan_id:     { type: string, description: "Existing DB plan UUID to link" }
   *     responses:
   *       201: { description: Plan created }
   */
  static async createPlan(req, res) {
    try {
      const { name, amount, currency = 'INR', interval = 'monthly', interval_count = 1, plan_id } = req.body;
      if (!name || !amount) return res.status(400).json({ error: 'name and amount are required' });

      const rzPlan = await rzService.createRazorpayPlan({ name, amount, currency, interval, interval_count });

      // Update existing plan or create new record
      let dbPlan;
      if (plan_id) {
        dbPlan = await PlanModel.update(plan_id, {
          razorpay_plan_id: rzPlan.id, name, interval, interval_count, currency,
        });
      } else {
        dbPlan = await PlanModel.create({
          title: name, name, price: amount, currency,
          interval, interval_count, razorpay_plan_id: rzPlan.id,
          is_active: true,
        });
      }

      res.status(201).json({ message: 'Plan created successfully', data: { db: dbPlan, razorpay: rzPlan } });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  /**
   * @swagger
   * /subscriptions/plans:
   *   get:
   *     summary: Get all plans with Razorpay info
   *     tags: [Subscriptions]
   *     security: [{bearerAuth: []}]
   *     responses:
   *       200: { description: List of plans }
   */
  static async getPlans(req, res) {
    try {
      const plans = await PlanModel.findAll();
      res.json({ data: plans, total: plans.length });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  // ── Subscriptions ─────────────────────────────────────────────────────────

  /**
   * @swagger
   * /subscriptions/create:
   *   post:
   *     summary: Create a Razorpay subscription for a user
   *     tags: [Subscriptions]
   *     security: [{bearerAuth: []}]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [plan_id, name, email, contact]
   *             properties:
   *               plan_id:    { type: string, description: "DB plan UUID" }
   *               user_id:    { type: string }
   *               name:       { type: string }
   *               email:      { type: string }
   *               contact:    { type: string }
   *               total_count:{ type: integer, default: 12 }
   *     responses:
   *       201: { description: Subscription created with payment link }
   */
  static async createSubscription(req, res) {
    try {
      const { plan_id, user_id, name, email, contact, total_count = 12 } = req.body;
      if (!plan_id || !name || !email || !contact) {
        return res.status(400).json({ error: 'plan_id, name, email, contact are required' });
      }

      // Get plan with razorpay_plan_id
      const plan = await PlanModel.findById(plan_id);
      if (!plan) return res.status(404).json({ error: 'Plan not found' });
      if (!plan.razorpay_plan_id) return res.status(400).json({ error: 'Plan not linked to Razorpay. Create it first via /subscriptions/plans/create' });

      // Create or fetch Razorpay customer
      const rzCustomer = await rzService.createRazorpayCustomer({ name, email, contact });

      // Create subscription
      const rzSub = await rzService.createRazorpaySubscription({
        razorpay_plan_id: plan.razorpay_plan_id,
        customer_id: rzCustomer.id,
        total_count,
        notes: { plan_name: plan.title || plan.name, user_email: email },
      });

      // Store in DB
      const dbSub = await SubscriptionModel.create({
        user_id: user_id || null,
        plan_id,
        razorpay_subscription_id: rzSub.id,
        razorpay_customer_id: rzCustomer.id,
        status: rzSub.status,
        short_url: rzSub.short_url,
        notes: { name, email, contact },
      });

      res.status(201).json({
        message: 'Subscription created successfully',
        data: {
          subscription_id: dbSub.id,
          razorpay_subscription_id: rzSub.id,
          payment_link: rzSub.short_url,
          status: rzSub.status,
          razorpay_key: process.env.RAZORPAY_KEY_ID,
        },
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  /**
   * @swagger
   * /subscriptions:
   *   get:
   *     summary: Get all subscriptions
   *     tags: [Subscriptions]
   *     security: [{bearerAuth: []}]
   *     parameters:
   *       - in: query
   *         name: user_id
   *         schema: { type: string }
   *       - in: query
   *         name: status
   *         schema: { type: string }
   *     responses:
   *       200: { description: List of subscriptions }
   */
  static async getSubscriptions(req, res) {
    try {
      const data = await SubscriptionModel.findAll(req.query);
      res.json({ data, total: data.length });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  /**
   * @swagger
   * /subscriptions/{id}:
   *   get:
   *     summary: Get subscription by ID
   *     tags: [Subscriptions]
   *     security: [{bearerAuth: []}]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200: { description: Subscription details }
   */
  static async getSubscriptionById(req, res) {
    try {
      const data = await SubscriptionModel.findById(req.params.id);
      if (!data) return res.status(404).json({ error: 'Subscription not found' });
      res.json({ data });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  /**
   * @swagger
   * /subscriptions/verify:
   *   post:
   *     summary: Verify Razorpay payment signature and activate subscription
   *     tags: [Subscriptions]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [razorpay_payment_id, razorpay_subscription_id, razorpay_signature]
   *             properties:
   *               razorpay_payment_id:    { type: string }
   *               razorpay_subscription_id: { type: string }
   *               razorpay_signature:     { type: string }
   *     responses:
   *       200: { description: Payment verified and subscription activated }
   */
  static async verifyPayment(req, res) {
    try {
      const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;
      if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
        return res.status(400).json({ error: 'razorpay_payment_id, razorpay_subscription_id, razorpay_signature are required' });
      }

      const isValid = rzService.verifyPaymentSignature({ razorpay_payment_id, razorpay_subscription_id, razorpay_signature });
      if (!isValid) return res.status(400).json({ error: 'Invalid payment signature' });

      // Fetch subscription details from Razorpay
      const rzSub = await rzService.fetchRazorpaySubscription(razorpay_subscription_id);

      const updated = await SubscriptionModel.updateByRazorpayId(razorpay_subscription_id, 'active', {
        razorpay_payment_id,
        razorpay_signature,
        start_date: rzSub.start_at ? new Date(rzSub.start_at * 1000) : new Date(),
        end_date: rzSub.end_at ? new Date(rzSub.end_at * 1000) : null,
        charge_at: rzSub.charge_at ? new Date(rzSub.charge_at * 1000) : null,
      });

      res.json({ message: 'Payment verified. Subscription activated.', data: updated });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  /**
   * @swagger
   * /subscriptions/cancel:
   *   post:
   *     summary: Cancel a Razorpay subscription
   *     tags: [Subscriptions]
   *     security: [{bearerAuth: []}]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [subscription_id]
   *             properties:
   *               subscription_id:       { type: string, description: "DB subscription UUID" }
   *               cancel_at_cycle_end:   { type: integer, enum: [0,1], default: 0 }
   *     responses:
   *       200: { description: Subscription cancelled }
   */
  static async cancelSubscription(req, res) {
    try {
      const { subscription_id, cancel_at_cycle_end = 0 } = req.body;
      if (!subscription_id) return res.status(400).json({ error: 'subscription_id is required' });

      const sub = await SubscriptionModel.findById(subscription_id);
      if (!sub) return res.status(404).json({ error: 'Subscription not found' });
      if (!sub.razorpay_subscription_id) return res.status(400).json({ error: 'No Razorpay subscription linked' });

      await rzService.cancelRazorpaySubscription(sub.razorpay_subscription_id, cancel_at_cycle_end);
      const updated = await SubscriptionModel.updateStatus(subscription_id, 'cancelled');

      res.json({ message: 'Subscription cancelled successfully', data: updated });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  // ── Webhook ───────────────────────────────────────────────────────────────

  /**
   * @swagger
   * /subscriptions/webhook:
   *   post:
   *     summary: Razorpay webhook handler
   *     tags: [Subscriptions]
   *     description: Configure this URL in Razorpay Dashboard > Webhooks
   *     responses:
   *       200: { description: Webhook processed }
   */
  static async webhook(req, res) {
    try {
      const signature = req.headers['x-razorpay-signature'];
      const rawBody = req.rawBody; // set by express middleware

      if (signature && rawBody) {
        const isValid = rzService.verifyWebhookSignature(rawBody, signature);
        if (!isValid) return res.status(400).json({ error: 'Invalid webhook signature' });
      }

      const { event, payload } = req.body;
      const sub = payload?.subscription?.entity;
      const payment = payload?.payment?.entity;

      switch (event) {
        case 'subscription.activated':
          if (sub?.id) {
            await SubscriptionModel.updateByRazorpayId(sub.id, 'active', {
              start_date: sub.start_at ? new Date(sub.start_at * 1000) : new Date(),
              end_date: sub.end_at ? new Date(sub.end_at * 1000) : null,
              charge_at: sub.charge_at ? new Date(sub.charge_at * 1000) : null,
            });
          }
          break;

        case 'subscription.cancelled':
        case 'subscription.completed':
          if (sub?.id) {
            await SubscriptionModel.updateByRazorpayId(sub.id, event === 'subscription.cancelled' ? 'cancelled' : 'completed');
          }
          break;

        case 'payment.captured':
          if (payment?.subscription_id) {
            await SubscriptionModel.updateByRazorpayId(payment.subscription_id, 'active', {
              razorpay_payment_id: payment.id,
            });
          }
          break;

        case 'payment.failed':
          if (payment?.subscription_id) {
            await SubscriptionModel.updateByRazorpayId(payment.subscription_id, 'payment_failed');
          }
          break;

        default:
          // Unhandled event — log and acknowledge
          console.log(`Unhandled Razorpay webhook event: ${event}`);
      }

      res.json({ status: 'ok', event });
    } catch (e) {
      console.error('Webhook error:', e.message);
      res.status(500).json({ error: e.message });
    }
  }
}

module.exports = SubscriptionController;
