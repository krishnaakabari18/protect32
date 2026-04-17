const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { AuthMiddleware } = require('../../middleware/auth');
const pool = require('../../config/database');
const Razorpay = require('razorpay');

const auth = AuthMiddleware.authenticate;

const getRazorpay = async () => {
  const r = await pool.query('SELECT razorpay_key_id, razorpay_key_secret FROM settings LIMIT 1');
  const s = r.rows[0];
  if (!s?.razorpay_key_id || !s?.razorpay_key_secret) throw new Error('Razorpay keys not configured');
  return { rz: new Razorpay({ key_id: s.razorpay_key_id, key_secret: s.razorpay_key_secret }), key_id: s.razorpay_key_id, key_secret: s.razorpay_key_secret };
};

/**
 * @swagger
 * tags:
 *   name: Appointment Payments
 *   description: Appointment booking with payment handling
 */

// ─────────────────────────────────────────────────────────────────────────────
// POST /appointment-payments/book
// Book appointment — cash (pending) or online (create Razorpay order first)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /appointment-payments/book:
 *   post:
 *     summary: Book appointment with payment method
 *     tags: [Appointment Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patient_id, provider_id, appointment_date, start_time, end_time, amount, payment_method]
 *             properties:
 *               patient_id:       { type: string }
 *               provider_id:      { type: string }
 *               appointment_date: { type: string, format: date }
 *               start_time:       { type: string, example: "09:00" }
 *               end_time:         { type: string, example: "09:30" }
 *               amount:           { type: number, example: 500 }
 *               payment_method:   { type: string, enum: [cash, online] }
 *               notes:            { type: string }
 *               procedure_items:  { type: array }
 *     responses:
 *       201:
 *         description: |
 *           Cash: appointment created with payment_status=pending
 *           Online: returns razorpay_order_id + key for checkout
 */
router.post('/book', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      patient_id, provider_id, appointment_date, start_time, end_time,
      amount, payment_method = 'cash', notes, procedure_items, estimated_cost,
    } = req.body;

    if (!patient_id || !provider_id || !appointment_date || !start_time || !end_time || !amount) {
      return res.status(400).json({ success: false, error: 'patient_id, provider_id, appointment_date, start_time, end_time, amount are required' });
    }

    // ── ONLINE PAYMENT: Create Razorpay order first, don't create appointment yet ──
    if (payment_method === 'online') {
      const { rz, key_id } = await getRazorpay();
      const order = await rz.orders.create({
        amount: Math.round(parseFloat(amount) * 100), // paise
        currency: 'INR',
        receipt: `appt_${Date.now()}`,
        notes: { patient_id, provider_id, appointment_date },
      });

      return res.status(201).json({
        success: true,
        payment_method: 'online',
        message: 'Complete payment to confirm appointment',
        razorpay_order_id: order.id,
        razorpay_key: key_id,
        amount: parseFloat(amount),
        // Appointment details to pass back after payment
        appointment_data: { patient_id, provider_id, appointment_date, start_time, end_time, notes, procedure_items, estimated_cost, amount },
      });
    }

    // ── CASH PAYMENT: Create appointment immediately with pending status ──
    await client.query('BEGIN');

    // Generate appointment code
    const codeResult = await client.query(
      `SELECT appointment_code FROM appointments WHERE appointment_code ~ '^p32-[0-9]+-[0-9]+$' ORDER BY LENGTH(appointment_code) DESC, appointment_code DESC LIMIT 1`
    );
    let nextSeq = 1;
    if (codeResult.rows.length > 0) {
      const parts = codeResult.rows[0].appointment_code.split('-');
      nextSeq = (parseInt(parts[parts.length - 1]) || 0) + 1;
    }
    const today = new Date();
    const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
    const appointment_code = `p32-${dateStr}-${nextSeq.toString().padStart(3,'0')}`;

    // Create appointment
    const apptResult = await client.query(
      `INSERT INTO appointments
         (patient_id, provider_id, appointment_date, start_time, end_time,
          notes, status, appointment_code, payment_method, payment_status, is_paid,
          procedure_items, estimated_cost)
       VALUES ($1,$2,$3,$4,$5,$6,'Upcoming',$7,'cash','pending',false,$8,$9)
       RETURNING *`,
      [patient_id, provider_id, appointment_date, start_time, end_time,
       notes || null, appointment_code,
       procedure_items ? JSON.stringify(procedure_items) : '[]',
       estimated_cost || amount]
    );
    const appointment = apptResult.rows[0];

    // Insert payment record with pending status
    await client.query(
      `INSERT INTO payments (patient_id, provider_id, appointment_id, amount, payment_method, payment_status, is_paid, payment_date)
       VALUES ($1,$2,$3,$4,'cash','pending',false,NOW())
       ON CONFLICT (appointment_id) DO NOTHING`,
      [patient_id, provider_id, appointment.id, parseFloat(amount)]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      payment_method: 'cash',
      message: 'Appointment booked. Payment pending (cash on service completion).',
      appointment,
    });

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Book appointment error:', e.message);
    res.status(500).json({ success: false, error: e.message });
  } finally {
    client.release();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /appointment-payments/verify-online
// After Razorpay payment success — verify signature, create appointment
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /appointment-payments/verify-online:
 *   post:
 *     summary: Verify online payment and create appointment
 *     tags: [Appointment Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpay_order_id, razorpay_payment_id, razorpay_signature, appointment_data]
 *             properties:
 *               razorpay_order_id:   { type: string }
 *               razorpay_payment_id: { type: string }
 *               razorpay_signature:  { type: string }
 *               appointment_data:    { type: object, description: "Same data from /book response" }
 *     responses:
 *       201:
 *         description: Payment verified, appointment created with payment_status=paid
 *       400:
 *         description: Invalid payment signature
 */
router.post('/verify-online', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointment_data } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !appointment_data) {
      return res.status(400).json({ success: false, error: 'razorpay_order_id, razorpay_payment_id, razorpay_signature, appointment_data are required' });
    }

    // Verify signature
    const { key_secret } = await getRazorpay();
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac('sha256', key_secret).update(body).digest('hex');
    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    const { patient_id, provider_id, appointment_date, start_time, end_time, notes, procedure_items, estimated_cost, amount } = appointment_data;

    await client.query('BEGIN');

    // Generate appointment code
    const codeResult = await client.query(
      `SELECT appointment_code FROM appointments WHERE appointment_code ~ '^p32-[0-9]+-[0-9]+$' ORDER BY LENGTH(appointment_code) DESC, appointment_code DESC LIMIT 1`
    );
    let nextSeq = 1;
    if (codeResult.rows.length > 0) {
      const parts = codeResult.rows[0].appointment_code.split('-');
      nextSeq = (parseInt(parts[parts.length - 1]) || 0) + 1;
    }
    const today = new Date();
    const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
    const appointment_code = `p32-${dateStr}-${nextSeq.toString().padStart(3,'0')}`;

    // Create appointment with paid status
    const apptResult = await client.query(
      `INSERT INTO appointments
         (patient_id, provider_id, appointment_date, start_time, end_time,
          notes, status, appointment_code, payment_method, payment_status, is_paid,
          procedure_items, estimated_cost)
       VALUES ($1,$2,$3,$4,$5,$6,'Upcoming',$7,'online','paid',true,$8,$9)
       RETURNING *`,
      [patient_id, provider_id, appointment_date, start_time, end_time,
       notes || null, appointment_code,
       procedure_items ? JSON.stringify(procedure_items) : '[]',
       estimated_cost || amount]
    );
    const appointment = apptResult.rows[0];

    // Insert payment record with success status
    await client.query(
      `INSERT INTO payments
         (patient_id, provider_id, appointment_id, amount, payment_method, payment_status,
          transaction_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, is_paid, payment_date)
       VALUES ($1,$2,$3,$4,'online','success',$5,$6,$5,$7,true,NOW())
       ON CONFLICT (appointment_id) DO UPDATE SET
         payment_status='success', transaction_id=EXCLUDED.transaction_id,
         razorpay_payment_id=EXCLUDED.razorpay_payment_id, is_paid=true`,
      [patient_id, provider_id, appointment.id, parseFloat(amount),
       razorpay_payment_id, razorpay_order_id, razorpay_signature]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      payment_method: 'online',
      message: 'Payment verified. Appointment confirmed.',
      appointment,
      transaction_id: razorpay_payment_id,
    });

  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: e.message });
  } finally {
    client.release();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /appointment-payments/failed-online
// Record failed online payment (no appointment created)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /appointment-payments/failed-online:
 *   post:
 *     summary: Record failed online payment (appointment NOT created)
 *     tags: [Appointment Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpay_order_id, patient_id, amount]
 *             properties:
 *               razorpay_order_id: { type: string }
 *               patient_id:        { type: string }
 *               provider_id:       { type: string }
 *               amount:            { type: number }
 *               error_reason:      { type: string }
 *     responses:
 *       200:
 *         description: Failed payment recorded
 */
router.post('/failed-online', auth, async (req, res) => {
  try {
    const { razorpay_order_id, patient_id, provider_id, amount, error_reason } = req.body;
    await pool.query(
      `INSERT INTO payments (patient_id, provider_id, amount, payment_method, payment_status, razorpay_order_id, is_paid, notes, payment_date)
       VALUES ($1,$2,$3,'online','failed',$4,false,$5,NOW())`,
      [patient_id, provider_id || null, parseFloat(amount) || 0, razorpay_order_id || null, error_reason || null]
    );
    res.json({ success: true, message: 'Failed payment recorded. Appointment not created.' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /appointment-payments/complete-cash/:appointmentId
// Mark cash payment as completed after service
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /appointment-payments/complete-cash/{appointmentId}:
 *   post:
 *     summary: Mark cash payment as completed after service delivery
 *     tags: [Appointment Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               received_by: { type: string, description: "User ID who received payment" }
 *               notes:       { type: string }
 *     responses:
 *       200:
 *         description: Cash payment marked as completed
 */
router.post('/complete-cash/:appointmentId', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { appointmentId } = req.params;
    const { received_by, notes } = req.body;

    await client.query('BEGIN');

    // Update appointment
    await client.query(
      `UPDATE appointments SET payment_status='completed', is_paid=true, status='Completed', updated_at=NOW() WHERE id=$1`,
      [appointmentId]
    );

    // Update payment record
    await client.query(
      `UPDATE payments SET
         payment_status='completed', is_paid=true,
         received_by=$1, received_at=NOW(),
         notes=COALESCE($2, notes),
         payment_date=NOW()
       WHERE appointment_id=$3`,
      [received_by || req.user.id, notes || null, appointmentId]
    );

    await client.query('COMMIT');

    res.json({ success: true, message: 'Cash payment marked as completed. Appointment closed.' });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: e.message });
  } finally {
    client.release();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /appointment-payments/status/:appointmentId
// Get payment status for an appointment
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /appointment-payments/status/{appointmentId}:
 *   get:
 *     summary: Get payment status for an appointment
 *     tags: [Appointment Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Payment status details
 */
router.get('/status/:appointmentId', auth, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT a.id as appointment_id, a.appointment_code, a.status as appointment_status,
              a.payment_method, a.payment_status, a.is_paid, a.estimated_cost,
              p.id as payment_id, p.amount, p.transaction_id, p.razorpay_order_id,
              p.razorpay_payment_id, p.payment_date, p.received_at, p.notes as payment_notes
       FROM appointments a
       LEFT JOIN payments p ON a.id = p.appointment_id
       WHERE a.id = $1`,
      [req.params.appointmentId]
    );
    if (!r.rows[0]) return res.status(404).json({ success: false, error: 'Appointment not found' });
    res.json({ success: true, data: r.rows[0] });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
