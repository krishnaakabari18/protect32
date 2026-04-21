const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { AuthMiddleware } = require('../../middleware/auth');
const authenticate = AuthMiddleware.authenticate;
const pool = require('../../config/database');
const Razorpay = require('razorpay');

const getRazorpay = async () => {
  const r = await pool.query('SELECT razorpay_key_id, razorpay_key_secret FROM settings LIMIT 1');
  const s = r.rows[0];
  if (!s?.razorpay_key_id || !s?.razorpay_key_secret) throw new Error('Razorpay keys not configured');
  return {
    rz: new Razorpay({ key_id: s.razorpay_key_id, key_secret: s.razorpay_key_secret }),
    key_id: s.razorpay_key_id,
    key_secret: s.razorpay_key_secret,
  };
};

const addPeriod = (date, period) => {
  const d = new Date(date);
  if (period === 'monthly') d.setMonth(d.getMonth() + 1);
  else if (period === 'yearly') d.setFullYear(d.getFullYear() + 1);
  else if (period === 'weekly') d.setDate(d.getDate() + 7);
  else if (period === 'daily') d.setDate(d.getDate() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
};

const getOrCreateCustomer = async (rz, user, userId) => {
  const contact = (user.mobile_number || '').replace(/\D/g, '').slice(-10);
  const name = ((user.first_name || '') + ' ' + (user.last_name || '')).trim() || 'User';
  try {
    return await rz.customers.create({ name, email: user.email, contact: contact || undefined, fail_existing: 0 });
  } catch (e) {}
  const dbRow = await pool.query(
    'SELECT razorpay_customer_id FROM subscriptions WHERE patient_id = $1 AND razorpay_customer_id IS NOT NULL ORDER BY created_at DESC LIMIT 1',
    [userId]
  );
  if (dbRow.rows[0]?.razorpay_customer_id) return { id: dbRow.rows[0].razorpay_customer_id };
  const list = await rz.customers.all({ count: 100 });
  const found = (list.items || []).find(c => c.email === user.email);
  if (found) return found;
  throw new Error('Could not create or retrieve Razorpay customer');
};

// Upsert payment row for subscription
const upsertSubscriptionPayment = async (rzSubId, rzPaymentId, dbStatus, subscriptionDbId, patientId, planAmount, planTitle) => {
  if (!rzSubId) return;
  const isPaid = dbStatus === 'Paid';
  const existing = await pool.query('SELECT id FROM payments WHERE razorpay_order_id = $1', [rzSubId]);
  if (existing.rows.length > 0) {
    console.log('[Payment] Updating existing row to', dbStatus, 'for sub:', rzSubId);
    await pool.query(
      'UPDATE payments SET payment_status=$2, status=$2, is_paid=$3, razorpay_payment_id=COALESCE($4, razorpay_payment_id), transaction_id=COALESCE($4, transaction_id), payment_date=NOW() WHERE razorpay_order_id = $1',
      [rzSubId, dbStatus, isPaid, rzPaymentId || null]
    ).catch(e => console.error('[Payment] Update error:', e.message));
  } else if (patientId) {
    console.log('[Payment] Inserting new row with status', dbStatus, 'for sub:', rzSubId);
    await pool.query(
      'INSERT INTO payments (patient_id, amount, payment_method, payment_status, status, razorpay_order_id, razorpay_payment_id, transaction_id, is_paid, subscription_id, notes, payment_date) VALUES ($1,$2,$3,$4,$4,$5,$6,$6,$7,$8,$9,NOW())',
      [patientId, planAmount || 0, 'online', dbStatus, rzSubId, rzPaymentId || null, isPaid, subscriptionDbId, 'Plan: ' + (planTitle || '') + ' | Sub: ' + rzSubId]
    ).catch(e => console.error('[Payment] Insert error:', e.message));
  }
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
 *     summary: Create subscription (Step 1) OR verify payment (Step 2)
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
 *               plan_id:                  { type: string, example: plan_RUUMyuCKfRyfDt }
 *               razorpay_payment_id:      { type: string, description: "Step 2 only" }
 *               razorpay_subscription_id: { type: string, description: "Step 2 only" }
 *               razorpay_signature:       { type: string, description: "Step 2 only" }
 *     responses:
 *       201: { description: "Step 1: subscription created | Step 2: payment verified" }
 */
router.post('/create', authenticate, async (req, res) => {
  const { plan_id, razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;
  const user_id = req.user?.id;
  console.log('[Subscription] POST /create | user_id:', user_id, '| plan_id:', plan_id, '| step:', (razorpay_payment_id ? '2-verify' : '1-create'));

  try {
    if (!plan_id) return res.status(400).json({ success: false, error: 'plan_id is required' });

    console.log('[Subscription] Fetching Razorpay keys');
    const { rz, key_id, key_secret } = await getRazorpay();
    console.log('[Subscription] Keys loaded | key_id:', key_id);

    // ── STEP 2: Verify payment ────────────────────────────────────────────────
    if (razorpay_payment_id && razorpay_subscription_id && razorpay_signature) {
      console.log('[Subscription] STEP 2: Verifying | payment_id:', razorpay_payment_id, '| sub_id:', razorpay_subscription_id);

      const expected = crypto.createHmac('sha256', key_secret)
        .update(razorpay_payment_id + '|' + razorpay_subscription_id)
        .digest('hex');

      if (expected !== razorpay_signature) {
        console.error('[Subscription] Signature MISMATCH | expected:', expected, '| got:', razorpay_signature);
        return res.status(400).json({ success: false, error: 'Invalid payment signature' });
      }
      console.log('[Subscription] Signature OK');

      console.log('[Subscription] Updating subscription to active in DB');
      const updateResult = await pool.query(
        'UPDATE subscriptions SET status=$2, is_active=true, razorpay_payment_id=$3, paid_count=COALESCE(paid_count,0)+1, remaining_count=GREATEST(COALESCE(remaining_count,1)-1,0), updated_at=NOW() WHERE razorpay_subscription_id=$1 RETURNING id',
        [razorpay_subscription_id, 'active', razorpay_payment_id]
      );
      console.log('[Subscription] Subscription updated | rows affected:', updateResult.rowCount);

      console.log('[Subscription] Upserting payment row to Paid');
      await upsertSubscriptionPayment(razorpay_subscription_id, razorpay_payment_id, 'Paid');
      console.log('[Subscription] Payment row updated to Paid');

      const updated = await pool.query('SELECT * FROM subscriptions WHERE razorpay_subscription_id = $1', [razorpay_subscription_id]);
      console.log('[Subscription] STEP 2 complete | db_id:', updated.rows[0]?.id, '| status:', updated.rows[0]?.status);

      return res.json({
        success: true,
        step: 'payment_verified',
        message: 'Payment verified. Subscription is now active.',
        subscription: updated.rows[0],
      });
    }

    // ── STEP 1: Create subscription ───────────────────────────────────────────
    console.log('[Subscription] STEP 1: Creating subscription');

    console.log('[Subscription] Fetching user from DB');
    const userRow = await pool.query('SELECT id, first_name, last_name, email, mobile_number FROM users WHERE id = $1', [user_id]);
    if (!userRow.rows[0]) {
      console.error('[Subscription] User not found:', user_id);
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const user = userRow.rows[0];
    console.log('[Subscription] User:', user.email);

    console.log('[Subscription] Fetching Razorpay plan:', plan_id);
    let rzPlan;
    try {
      rzPlan = await rz.plans.fetch(plan_id);
      console.log('[Subscription] Plan:', rzPlan.item?.name, '| amount (paise):', rzPlan.item?.amount, '| period:', rzPlan.period);
    } catch (e) {
      console.error('[Subscription] Invalid plan_id:', e?.error?.description || e?.message);
      return res.status(400).json({ success: false, error: 'Invalid plan_id: ' + (e?.error?.description || e?.message || String(e)) });
    }

    console.log('[Subscription] Checking previous subscriptions for start date');
    const prevRow = await pool.query('SELECT MAX(expiry_date) AS last_expiry FROM subscriptions WHERE patient_id = $1 AND expiry_date > NOW()', [user_id]);
    const lastExpiry = prevRow.rows[0]?.last_expiry || null;
    const startDate  = lastExpiry ? new Date(new Date(lastExpiry).getTime() + 86400000) : new Date();
    const expiryDate = addPeriod(startDate, rzPlan.period);
    console.log('[Subscription] start_date:', startDate.toISOString(), '| expiry_date:', expiryDate.toISOString(), '| extended_from:', lastExpiry);

    console.log('[Subscription] Getting/creating Razorpay customer');
    const customer = await getOrCreateCustomer(rz, user, user_id);
    console.log('[Subscription] Customer ID:', customer.id);

    const periodCount = { daily: 365, weekly: 52, monthly: 12, yearly: 1 };
    const total_count = periodCount[rzPlan.period] || 12;
    console.log('[Subscription] total_count:', total_count, '| period:', rzPlan.period);

    console.log('[Subscription] Creating Razorpay subscription via API');
    const rzSub = await rz.subscriptions.create({
      plan_id, customer_notify: 1, quantity: 1, total_count,
      customer_id: customer.id,
      notes: { user_id, user_email: user.email },
    });
    console.log('[Subscription] Razorpay sub created | id:', rzSub.id, '| status:', rzSub.status, '| short_url:', rzSub.short_url);

    console.log('[Subscription] Saving to subscriptions table');
    const dbRow = await pool.query(
      'INSERT INTO subscriptions (patient_id, razorpay_plan_id, razorpay_subscription_id, razorpay_customer_id, status, short_url, start_date, expiry_date, is_active, plan_title, plan_price, total_count, remaining_count, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT (razorpay_subscription_id) DO UPDATE SET status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP RETURNING *',
      [user_id, plan_id, rzSub.id, customer.id, rzSub.status, rzSub.short_url, startDate, expiryDate, false, rzPlan.item?.name || '', rzPlan.item?.amount ? rzPlan.item.amount / 100 : null, total_count, total_count, JSON.stringify({ user_email: user.email, extended_from: lastExpiry })]
    );
    const subscription = dbRow.rows[0];
    const planAmount = rzPlan.item?.amount ? rzPlan.item.amount / 100 : 0;
    console.log('[Subscription] Saved to DB | db_id:', subscription.id);

    console.log('[Subscription] Checking patient record');
    const patientCheck = await pool.query('SELECT id FROM patients WHERE id = $1', [user_id]);
    if (patientCheck.rows.length > 0) {
      console.log('[Subscription] Patient found — inserting Pending payment row');
      await upsertSubscriptionPayment(rzSub.id, null, 'Pending', subscription.id, user_id, planAmount, rzPlan.item?.name || plan_id);
    } else {
      console.log('[Subscription] Not a patient — skipping payment row');
    }

    console.log('[Subscription] STEP 1 complete — returning to frontend');
    return res.status(201).json({
      success: true,
      step: 'subscription_created',
      message: 'Complete payment to activate subscription',
      razorpay_subscription_id: rzSub.id,
      razorpay_key: key_id,
      amount: planAmount,
      subscription: {
        ...rzSub,
        db_id: subscription.id,
        payment_link: rzSub.short_url,
        start_date: startDate,
        expiry_date: expiryDate,
        extended_from: lastExpiry,
      },
    });

  } catch (e) {
    console.error('[Subscription] ERROR:', e?.error?.description || e?.message || JSON.stringify(e));
    res.status(500).json({ success: false, error: e?.error?.description || e?.message || JSON.stringify(e) });
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
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: List of subscriptions }
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { patient_id, status, is_active, page = 1, limit = 10 } = req.query;
    const vals = [];
    let p = 1;
    let q = 'SELECT s.*, u.first_name, u.last_name, u.email FROM subscriptions s LEFT JOIN users u ON s.patient_id = u.id WHERE 1=1';
    if (patient_id) { q += ' AND s.patient_id = $' + p++; vals.push(patient_id); }
    if (status)     { q += ' AND s.status = $' + p++;     vals.push(status); }
    if (is_active !== undefined && is_active !== '') { q += ' AND s.is_active = $' + p++; vals.push(is_active === 'true'); }
    const countR = await pool.query('SELECT COUNT(*) FROM (' + q + ') sub', vals);
    const total = parseInt(countR.rows[0].count);
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    q += ' ORDER BY s.created_at DESC LIMIT $' + p++ + ' OFFSET $' + p++;
    vals.push(limitNum, (pageNum - 1) * limitNum);
    const r = await pool.query(q, vals);
    res.json({ data: r.rows, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @swagger
 * /subscriptions/sync/{razorpay_subscription_id}:
 *   post:
 *     summary: Sync subscription status from Razorpay and update payment row
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: razorpay_subscription_id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Subscription synced }
 */
router.post('/sync/:razorpay_subscription_id', authenticate, async (req, res) => {
  const { razorpay_subscription_id } = req.params;
  console.log('[Subscription] SYNC called for sub_id:', razorpay_subscription_id);
  try {
    const { rz } = await getRazorpay();

    console.log('[Subscription] Fetching live status from Razorpay');
    const rzSub = await rz.subscriptions.fetch(razorpay_subscription_id);
    console.log('[Subscription] Live status:', rzSub.status, '| paid_count:', rzSub.paid_count, '| remaining:', rzSub.remaining_count);

    const isActive = ['active', 'authenticated'].includes(rzSub.status);
    const isPaid   = rzSub.paid_count > 0;

    console.log('[Subscription] Updating subscriptions table | is_active:', isActive, '| status:', rzSub.status);
    await pool.query(
      'UPDATE subscriptions SET status=$2, is_active=$3, paid_count=$4, remaining_count=$5, updated_at=NOW() WHERE razorpay_subscription_id=$1',
      [razorpay_subscription_id, rzSub.status, isActive, rzSub.paid_count || 0, rzSub.remaining_count || 0]
    );

    if (isPaid) {
      console.log('[Subscription] paid_count > 0 — updating payment row to Paid');
      await upsertSubscriptionPayment(razorpay_subscription_id, rzSub.payment_id || null, 'Paid');
      console.log('[Subscription] Payment row updated to Paid');
    } else {
      console.log('[Subscription] paid_count = 0 — payment still Pending');
    }

    const updated = await pool.query('SELECT * FROM subscriptions WHERE razorpay_subscription_id = $1', [razorpay_subscription_id]);
    const payment = await pool.query('SELECT payment_status, status, is_paid, razorpay_payment_id FROM payments WHERE razorpay_order_id = $1', [razorpay_subscription_id]);

    console.log('[Subscription] SYNC complete | db status:', updated.rows[0]?.status, '| payment_status:', payment.rows[0]?.payment_status);

    res.json({
      success: true,
      message: 'Subscription synced from Razorpay',
      razorpay_status: rzSub.status,
      is_active: isActive,
      payment_updated_to_paid: isPaid,
      subscription: updated.rows[0],
      payment: payment.rows[0] || null,
    });
  } catch (e) {
    console.error('[Subscription] SYNC ERROR:', e?.error?.description || e?.message);
    res.status(500).json({ success: false, error: e?.error?.description || e?.message || e.message });
  }
});

/**
 * @swagger
 * /subscriptions/webhook:
 *   post:
 *     summary: Razorpay webhook
 *     tags: [Subscriptions]
 *     responses:
 *       200: { description: Webhook processed }
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (signature) {
      const sr = await pool.query('SELECT razorpay_key_secret FROM settings LIMIT 1');
      const secret = sr.rows[0]?.razorpay_key_secret;
      if (secret) {
        const body = req.rawBody || JSON.stringify(req.body);
        const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
        if (expected !== signature) return res.status(400).json({ error: 'Invalid signature' });
      }
    }

    const { event, payload } = req.body;
    const sub     = payload?.subscription?.entity;
    const payment = payload?.payment?.entity;
    console.log('[Webhook] Event:', event);

    const updateSub = async (rzSubId, fields) => {
      if (!rzSubId || !Object.keys(fields).length) return;
      const sets = Object.keys(fields).map((k, i) => k + ' = $' + (i + 2)).join(', ');
      await pool.query(
        'UPDATE subscriptions SET ' + sets + ', updated_at = CURRENT_TIMESTAMP WHERE razorpay_subscription_id = $1',
        [rzSubId, ...Object.values(fields)]
      ).catch(e => console.error('[Webhook] updateSub error:', e.message));
    };

    switch (event) {
      case 'subscription.activated':
        console.log('[Webhook] subscription.activated | sub_id:', sub?.id);
        await updateSub(sub?.id, { status: 'active', is_active: true, start_date: sub?.start_at ? new Date(sub.start_at * 1000) : new Date(), end_date: sub?.end_at ? new Date(sub.end_at * 1000) : null, charge_at: sub?.charge_at ? new Date(sub.charge_at * 1000) : null, paid_count: sub?.paid_count ?? null, remaining_count: sub?.remaining_count ?? null });
        break;
      case 'subscription.charged':
        console.log('[Webhook] subscription.charged | sub_id:', sub?.id);
        await updateSub(sub?.id, { status: 'active', is_active: true, paid_count: sub?.paid_count ?? null, remaining_count: sub?.remaining_count ?? null, charge_at: sub?.charge_at ? new Date(sub.charge_at * 1000) : null });
        await upsertSubscriptionPayment(sub?.id, null, 'Paid');
        break;
      case 'subscription.cancelled':
        console.log('[Webhook] subscription.cancelled | sub_id:', sub?.id);
        await updateSub(sub?.id, { status: 'cancelled', is_active: false });
        break;
      case 'subscription.completed':
        console.log('[Webhook] subscription.completed | sub_id:', sub?.id);
        await updateSub(sub?.id, { status: 'completed', is_active: false });
        break;
      case 'subscription.halted':
        console.log('[Webhook] subscription.halted | sub_id:', sub?.id);
        await updateSub(sub?.id, { status: 'halted', is_active: false });
        break;
      case 'payment.captured':
        console.log('[Webhook] payment.captured | payment_id:', payment?.id, '| sub_id:', payment?.subscription_id);
        if (payment?.subscription_id) {
          await updateSub(payment.subscription_id, { razorpay_payment_id: payment.id, status: 'active', is_active: true });
          await upsertSubscriptionPayment(payment.subscription_id, payment.id, 'Paid');
        }
        break;
      case 'payment.failed':
        console.log('[Webhook] payment.failed | sub_id:', payment?.subscription_id);
        if (payment?.subscription_id) {
          await updateSub(payment.subscription_id, { status: 'payment_failed' });
          await upsertSubscriptionPayment(payment.subscription_id, null, 'Failed');
        }
        break;
      default:
        console.log('[Webhook] Unhandled event:', event);
    }

    res.json({ success: true, event });
  } catch (e) {
    console.error('[Webhook] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
