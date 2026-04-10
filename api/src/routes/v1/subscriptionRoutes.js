const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { authenticate } = require('../../middleware/auth');
const pool = require('../../config/database');
const Razorpay = require('razorpay');

// Helper: get Razorpay instance from settings table
const getRazorpay = async () => {
  const r = await pool.query('SELECT razorpay_key_id, razorpay_key_secret FROM settings LIMIT 1');
  const s = r.rows[0];
  if (!s?.razorpay_key_id || !s?.razorpay_key_secret) {
    throw new Error('Razorpay keys not configured in Settings');
  }
  return { instance: new Razorpay({ key_id: s.razorpay_key_id, key_secret: s.razorpay_key_secret }), key_id: s.razorpay_key_id, key_secret: s.razorpay_key_secret };
};

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Razorpay subscription management
 */

// ─────────────────────────────────────────────────────────────────────────────
// POST /subscriptions/create
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /subscriptions/create:
 *   post:
 *     summary: Create a Razorpay subscription for a patient
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patient_id, plan_id]
 *             properties:
 *               patient_id:
 *                 type: string
 *                 description: Patient UUID from DB
 *               plan_id:
 *                 type: string
 *                 description: Razorpay Plan ID (e.g. plan_RUUMLjYnKKUuKR)
 *               total_count:
 *                 type: integer
 *                 default: 12
 *     responses:
 *       201:
 *         description: Subscription created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:          { type: boolean }
 *                 subscription_id:  { type: string }
 *                 razorpay_key:     { type: string }
 *                 subscription:     { type: object }
 */
router.post('/create', authenticate, async (req, res) => {
  try {
    const { patient_id, plan_id, total_count = 12 } = req.body;
    if (!patient_id || !plan_id) {
      return res.status(400).json({ success: false, error: 'patient_id and plan_id are required' });
    }

    // Get patient (user) details
    const userResult = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.mobile_number
       FROM users u
       JOIN patients p ON p.id = u.id
       WHERE u.id = $1`, [patient_id]
    );
    if (!userResult.rows[0]) return res.status(404).json({ success: false, error: 'Patient not found' });
    const user = userResult.rows[0];

    // Get Razorpay instance
    const { instance: razorpay, key_id } = await getRazorpay();

    // Fetch plan details from Razorpay to get amount/interval
    let rzPlan;
    try {
      rzPlan = await razorpay.plans.fetch(plan_id);
    } catch (e) {
      return res.status(400).json({ success: false, error: `Invalid Razorpay plan_id: ${e.message}` });
    }

    // Create Razorpay customer
    const customer = await razorpay.customers.create({
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Patient',
      email: user.email || '',
      contact: user.mobile_number || '',
      fail_existing: 0,
    });

    // Create Razorpay subscription
    const rzSub = await razorpay.subscriptions.create({
      plan_id,
      customer_notify: 1,
      quantity: 1,
      total_count: parseInt(total_count),
      customer_id: customer.id,
      notes: { patient_id, user_email: user.email },
    });

    // Calculate dates
    const startDate = rzSub.start_at ? new Date(rzSub.start_at * 1000) : new Date();
    const endDate   = rzSub.end_at   ? new Date(rzSub.end_at   * 1000) : null;
    // Expiry = end_at or start + (total_count * interval months)
    const expiryDate = endDate || (() => {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + parseInt(total_count));
      return d;
    })();

    // Store in DB
    const dbResult = await pool.query(
      `INSERT INTO subscriptions
         (patient_id, plan_id, razorpay_plan_id, razorpay_subscription_id, razorpay_customer_id,
          status, short_url, start_date, end_date, expiry_date, is_active,
          plan_title, plan_price, total_count, remaining_count, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       ON CONFLICT (razorpay_subscription_id)
       DO UPDATE SET status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        patient_id,
        null,                          // DB plan UUID (not required here)
        plan_id,                       // razorpay plan id
        rzSub.id,
        customer.id,
        rzSub.status,
        rzSub.short_url,
        startDate,
        endDate,
        expiryDate,
        false,                         // not active until payment captured
        rzPlan.item?.name || '',
        rzPlan.item?.amount ? rzPlan.item.amount / 100 : null,
        parseInt(total_count),
        parseInt(total_count),
        JSON.stringify({ patient_name: `${user.first_name} ${user.last_name}`, email: user.email }),
      ]
    );

    res.status(201).json({
      success: true,
      subscription_id: rzSub.id,
      razorpay_key: key_id,
      subscription: {
        ...rzSub,
        db_id: dbResult.rows[0].id,
        payment_link: rzSub.short_url,
        expiry_date: expiryDate,
      },
    });

  } catch (e) {
    console.error('Subscription create error:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /subscriptions  — list all subscriptions
// ─────────────────────────────────────────────────────────────────────────────
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
 *         name: patient_id
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: is_active
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: List of subscriptions }
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { patient_id, status, is_active, page = 1, limit = 10 } = req.query;
    let q = `
      SELECT s.*,
        u.first_name, u.last_name, u.email
      FROM subscriptions s
      LEFT JOIN users u ON s.patient_id = u.id
      WHERE 1=1
    `;
    const vals = []; let p = 1;
    if (patient_id) { q += ` AND s.patient_id = $${p++}`; vals.push(patient_id); }
    if (status)     { q += ` AND s.status = $${p++}`;     vals.push(status); }
    if (is_active !== undefined && is_active !== '') {
      q += ` AND s.is_active = $${p++}`; vals.push(is_active === 'true');
    }

    const countR = await pool.query(`SELECT COUNT(*) FROM (${q}) sub`, vals);
    const total = parseInt(countR.rows[0].count);
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    q += ` ORDER BY s.created_at DESC LIMIT $${p++} OFFSET $${p++}`;
    vals.push(limitNum, (pageNum - 1) * limitNum);

    const r = await pool.query(q, vals);
    res.json({ data: r.rows, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /subscriptions/webhook  — Razorpay webhook
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /subscriptions/webhook:
 *   post:
 *     summary: Razorpay webhook — configure URL in Razorpay Dashboard
 *     tags: [Subscriptions]
 *     description: |
 *       Handles: subscription.activated, subscription.charged,
 *       subscription.cancelled, subscription.completed, payment.captured, payment.failed
 *     responses:
 *       200: { description: Webhook processed }
 */
router.post('/webhook', async (req, res) => {
  try {
    // Verify webhook signature if secret configured
    const signature = req.headers['x-razorpay-signature'];
    if (signature) {
      const settingsR = await pool.query('SELECT razorpay_key_secret FROM settings LIMIT 1');
      const webhookSecret = settingsR.rows[0]?.razorpay_key_secret;
      if (webhookSecret) {
        const rawBody = req.rawBody || JSON.stringify(req.body);
        const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
        if (expected !== signature) {
          return res.status(400).json({ error: 'Invalid webhook signature' });
        }
      }
    }

    const { event, payload } = req.body;
    const sub     = payload?.subscription?.entity;
    const payment = payload?.payment?.entity;

    const updateSub = async (razorpay_subscription_id, fields) => {
      if (!razorpay_subscription_id) return;
      const keys = Object.keys(fields);
      if (!keys.length) return;
      const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
      await pool.query(
        `UPDATE subscriptions SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE razorpay_subscription_id = $1`,
        [razorpay_subscription_id, ...Object.values(fields)]
      ).catch(() => {});
    };

    switch (event) {
      case 'subscription.activated':
        await updateSub(sub?.id, {
          status: 'active', is_active: true,
          start_date: sub?.start_at ? new Date(sub.start_at * 1000) : new Date(),
          end_date:   sub?.end_at   ? new Date(sub.end_at   * 1000) : null,
          expiry_date: sub?.end_at  ? new Date(sub.end_at   * 1000) : null,
          charge_at:  sub?.charge_at ? new Date(sub.charge_at * 1000) : null,
          remaining_count: sub?.remaining_count ?? null,
          paid_count: sub?.paid_count ?? null,
        });
        break;

      case 'subscription.charged':
        await updateSub(sub?.id, {
          status: 'active', is_active: true,
          paid_count: sub?.paid_count ?? null,
          remaining_count: sub?.remaining_count ?? null,
          charge_at: sub?.charge_at ? new Date(sub.charge_at * 1000) : null,
        });
        break;

      case 'subscription.cancelled':
        await updateSub(sub?.id, { status: 'cancelled', is_active: false });
        break;

      case 'subscription.completed':
        await updateSub(sub?.id, { status: 'completed', is_active: false });
        break;

      case 'subscription.halted':
        await updateSub(sub?.id, { status: 'halted', is_active: false });
        break;

      case 'payment.captured':
        if (payment?.subscription_id) {
          await updateSub(payment.subscription_id, {
            razorpay_payment_id: payment.id,
            status: 'active', is_active: true,
          });
        }
        break;

      case 'payment.failed':
        if (payment?.subscription_id) {
          await updateSub(payment.subscription_id, { status: 'payment_failed' });
        }
        break;

      default:
        console.log(`Unhandled Razorpay event: ${event}`);
    }

    res.json({ success: true, event });
  } catch (e) {
    console.error('Webhook error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
