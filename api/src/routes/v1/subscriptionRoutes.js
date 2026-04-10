const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { authenticate } = require('../../middleware/auth');
const pool = require('../../config/database');
const Razorpay = require('razorpay');

const getRazorpay = async () => {
  const r = await pool.query('SELECT razorpay_key_id, razorpay_key_secret FROM settings LIMIT 1');
  const s = r.rows[0];
  if (!s?.razorpay_key_id || !s?.razorpay_key_secret)
    throw new Error('Razorpay keys not configured in Settings');
  return {
    instance: new Razorpay({ key_id: s.razorpay_key_id, key_secret: s.razorpay_key_secret }),
    key_id: s.razorpay_key_id,
    key_secret: s.razorpay_key_secret,
  };
};

const computeExpiry = (period, prevExpiry) => {
  const now = new Date();
  const base = prevExpiry && new Date(prevExpiry) > now ? new Date(prevExpiry) : now;
  const d = new Date(base);
  if      (period === 'monthly') d.setMonth(d.getMonth() + 1);
  else if (period === 'yearly')  d.setFullYear(d.getFullYear() + 1);
  else if (period === 'weekly')  d.setDate(d.getDate() + 7);
  else if (period === 'daily')   d.setDate(d.getDate() + 1);
  else                           d.setMonth(d.getMonth() + 1);
  return d;
};

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Razorpay subscription management
 */

/**
 * @swagger
 * /subscriptions/create:
 *   post:
 *     summary: Create a Razorpay subscription — only plan_id needed, user from JWT token
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plan_id]
 *             properties:
 *               plan_id:
 *                 type: string
 *                 description: Razorpay Plan ID
 *                 example: plan_RUUMyuCKfRyfDt
 *     responses:
 *       201:
 *         description: Subscription created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:         { type: boolean }
 *                 subscription_id: { type: string }
 *                 razorpay_key:    { type: string }
 *                 subscription:    { type: object }
 */
router.post('/create', authenticate, async (req, res) => {
  try {
    const { plan_id } = req.body;

    // User comes from JWT token — no patient_id needed in body
    const user_id = req.user?.id;

    if (!plan_id) {
      return res.status(400).json({ success: false, error: 'plan_id is required' });
    }

    // 1. Get user details from token
    const userResult = await pool.query(
      'SELECT id, first_name, last_name, email, mobile_number FROM users WHERE id = $1',
      [user_id]
    );
    if (!userResult.rows[0]) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const user = userResult.rows[0];

    // 2. Razorpay instance
    const { instance: razorpay, key_id } = await getRazorpay();

    // 3. Fetch plan from Razorpay
    let rzPlan;
    try {
      rzPlan = await razorpay.plans.fetch(plan_id);
    } catch (e) {
      const msg = e?.error?.description || e?.message || JSON.stringify(e);
      return res.status(400).json({ success: false, error: 'Invalid plan_id: ' + msg });
    }

    // 4. Check previous subscription for same plan (expiry extension)
    const prevResult = await pool.query(
      'SELECT expiry_date FROM subscriptions WHERE patient_id = $1 AND razorpay_plan_id = $2 ORDER BY created_at DESC LIMIT 1',
      [user_id, plan_id]
    );
    const prevExpiry = prevResult.rows[0]?.expiry_date || null;
    const newExpiry  = computeExpiry(rzPlan.period, prevExpiry);

    // 5. Create Razorpay customer — sanitize contact (digits only, max 10)
    const contact = (user.mobile_number || '').replace(/\D/g, '').slice(-10);
    const customer = await razorpay.customers.create({
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
      email: user.email || '',
      contact: contact || undefined,
      fail_existing: 0,
    });

    // 6. total_count based on period
    const periodCount = { daily: 365, weekly: 52, monthly: 12, yearly: 1 };
    const total_count = periodCount[rzPlan.period] || 12;

    // 7. Create Razorpay subscription
    const rzSub = await razorpay.subscriptions.create({
      plan_id,
      customer_notify: 1,
      quantity: 1,
      total_count,
      customer_id: customer.id,
      notes: { user_id, user_email: user.email },
    });

    // 8. Store in DB
    const dbResult = await pool.query(
      `INSERT INTO subscriptions
         (patient_id, razorpay_plan_id, razorpay_subscription_id, razorpay_customer_id,
          status, short_url, start_date, expiry_date, is_active,
          plan_title, plan_price, total_count, remaining_count, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (razorpay_subscription_id)
       DO UPDATE SET status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        user_id, plan_id, rzSub.id, customer.id,
        rzSub.status, rzSub.short_url,
        new Date(), newExpiry, false,
        rzPlan.item?.name || '',
        rzPlan.item?.amount ? rzPlan.item.amount / 100 : null,
        total_count, total_count,
        JSON.stringify({ user_email: user.email, extended_from: prevExpiry }),
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
        expiry_date: newExpiry,
        extended_from: prevExpiry,
      },
    });

  } catch (e) {
    console.error('Subscription create error:', JSON.stringify(e));
    const msg = e?.error?.description || e?.error?.reason || e?.message || JSON.stringify(e);
    res.status(500).json({ success: false, error: msg });
  }
});

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
      SELECT s.*, u.first_name, u.last_name, u.email
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

/**
 * @swagger
 * /subscriptions/webhook:
 *   post:
 *     summary: Razorpay webhook — configure in Razorpay Dashboard
 *     tags: [Subscriptions]
 *     description: |
 *       Events: subscription.activated, subscription.charged,
 *       subscription.cancelled, subscription.completed, payment.captured, payment.failed
 *     responses:
 *       200: { description: Webhook processed }
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (signature) {
      const settingsR = await pool.query('SELECT razorpay_key_secret FROM settings LIMIT 1');
      const secret = settingsR.rows[0]?.razorpay_key_secret;
      if (secret) {
        const rawBody = req.rawBody || JSON.stringify(req.body);
        const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
        if (expected !== signature) return res.status(400).json({ error: 'Invalid signature' });
      }
    }

    const { event, payload } = req.body;
    const sub     = payload?.subscription?.entity;
    const payment = payload?.payment?.entity;

    const updateSub = async (razorpay_subscription_id, fields) => {
      if (!razorpay_subscription_id || !Object.keys(fields).length) return;
      const sets = Object.keys(fields).map((k, i) => `${k} = $${i + 2}`).join(', ');
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
        if (payment?.subscription_id)
          await updateSub(payment.subscription_id, { razorpay_payment_id: payment.id, status: 'active', is_active: true });
        break;
      case 'payment.failed':
        if (payment?.subscription_id)
          await updateSub(payment.subscription_id, { status: 'payment_failed' });
        break;
      default:
        console.log('Unhandled Razorpay event:', event);
    }

    res.json({ success: true, event });
  } catch (e) {
    console.error('Webhook error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
