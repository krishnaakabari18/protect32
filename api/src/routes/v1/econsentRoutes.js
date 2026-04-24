const express = require('express');
const router = express.Router();
const { AuthMiddleware } = require('../../middleware/auth');
const auth = AuthMiddleware.authenticate;
const pool = require('../../config/database');

// Auto-create table on first load
pool.query(`
  CREATE TABLE IF NOT EXISTS econsents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    procedure_names TEXT NOT NULL,
    patient_age INT,
    patient_address TEXT,
    place TEXT,
    sign_date TEXT,
    sign_time TEXT,
    signature TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'rejected')),
    signed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).catch(e => console.error('[eConsent] Table create error:', e.message));

/**
 * @swagger
 * tags:
 *   name: eConsent
 *   description: Electronic consent management
 */

/**
 * @swagger
 * /econsents:
 *   get:
 *     summary: Get all eConsents with filters
 *     tags: [eConsent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: provider_id
 *         schema: { type: string, format: uuid }
 *         description: Filter by provider
 *       - in: query
 *         name: patient_id
 *         schema: { type: string, format: uuid }
 *         description: Filter by patient
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, signed, rejected] }
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of eConsents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EConsent'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 */
router.get('/', auth, async (req, res) => {
  try {
    const { provider_id, patient_id, status, page = 1, limit = 20 } = req.query;
    const vals = [];
    let p = 1;
    let q = `
      SELECT e.*,
        u1.first_name as patient_first_name, u1.last_name as patient_last_name, u1.email as patient_email,
        u2.first_name as provider_first_name, u2.last_name as provider_last_name,
        pr.clinic_name as provider_clinic
      FROM econsents e
      JOIN users u1 ON e.patient_id = u1.id
      JOIN users u2 ON e.provider_id = u2.id
      LEFT JOIN providers pr ON e.provider_id = pr.id
      WHERE 1=1
    `;
    if (provider_id) { q += ` AND e.provider_id = $${p++}`; vals.push(provider_id); }
    if (patient_id)  { q += ` AND e.patient_id = $${p++}`;  vals.push(patient_id); }
    if (status)      { q += ` AND e.status = $${p++}`;      vals.push(status); }

    const countR = await pool.query(`SELECT COUNT(*) FROM (${q}) sub`, vals);
    const total = parseInt(countR.rows[0].count);
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    q += ` ORDER BY e.created_at DESC LIMIT $${p++} OFFSET $${p++}`;
    vals.push(limitNum, (pageNum - 1) * limitNum);

    const r = await pool.query(q, vals);
    res.json({ success: true, data: r.rows, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

/**
 * @swagger
 * /econsents/{id}:
 *   get:
 *     summary: Get single eConsent by ID
 *     tags: [eConsent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: eConsent details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/EConsent' }
 *       404:
 *         description: Not found
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT e.*,
        u1.first_name as patient_first_name, u1.last_name as patient_last_name, u1.email as patient_email,
        u2.first_name as provider_first_name, u2.last_name as provider_last_name,
        pr.clinic_name as provider_clinic
       FROM econsents e
       JOIN users u1 ON e.patient_id = u1.id
       JOIN users u2 ON e.provider_id = u2.id
       LEFT JOIN providers pr ON e.provider_id = pr.id
       WHERE e.id = $1`,
      [req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: r.rows[0] });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

/**
 * @swagger
 * /econsents:
 *   post:
 *     summary: Create a new eConsent request
 *     tags: [eConsent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [provider_id, patient_id, procedure_names]
 *             properties:
 *               provider_id:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               patient_id:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440001"
 *               procedure_names:
 *                 type: string
 *                 example: "Root Canal Treatment, Tooth Extraction"
 *               patient_age:
 *                 type: integer
 *                 example: 35
 *               patient_address:
 *                 type: string
 *                 example: "123 Main St, Mumbai"
 *     responses:
 *       201:
 *         description: eConsent created with status pending
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/EConsent' }
 *       400:
 *         description: Missing required fields
 */
router.post('/', auth, async (req, res) => {
  try {
    const { provider_id, patient_id, procedure_names, patient_age, patient_address } = req.body;
    if (!provider_id || !patient_id || !procedure_names)
      return res.status(400).json({ success: false, error: 'provider_id, patient_id and procedure_names are required' });

    const r = await pool.query(
      `INSERT INTO econsents (provider_id, patient_id, procedure_names, patient_age, patient_address, status)
       VALUES ($1,$2,$3,$4,$5,'pending') RETURNING *`,
      [provider_id, patient_id, procedure_names, patient_age || null, patient_address || null]
    );
    res.status(201).json({ success: true, data: r.rows[0] });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

/**
 * @swagger
 * /econsents/{id}:
 *   put:
 *     summary: Update eConsent status and signature details
 *     tags: [eConsent]
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
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, signed, rejected]
 *                 example: signed
 *               place:
 *                 type: string
 *                 example: "Mumbai"
 *               sign_date:
 *                 type: string
 *                 example: "2026-04-24"
 *               sign_time:
 *                 type: string
 *                 example: "14:30"
 *               signature:
 *                 type: string
 *                 example: "Rohan Gupta"
 *               notes:
 *                 type: string
 *                 example: "Patient signed voluntarily"
 *     responses:
 *       200:
 *         description: eConsent updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/EConsent' }
 *       404:
 *         description: Not found
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, notes, place, sign_date, sign_time, signature } = req.body;
    const r = await pool.query(
      `UPDATE econsents SET
        status = COALESCE($2, status),
        notes = COALESCE($3, notes),
        place = COALESCE($4, place),
        sign_date = COALESCE($5, sign_date),
        sign_time = COALESCE($6, sign_time),
        signature = COALESCE($7, signature),
        signed_at = CASE WHEN $2 = 'signed' THEN NOW() ELSE signed_at END,
        updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [req.params.id, status || null, notes || null, place || null, sign_date || null, sign_time || null, signature || null]
    );
    if (!r.rows[0]) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: r.rows[0] });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

/**
 * @swagger
 * /econsents/{id}:
 *   delete:
 *     summary: Delete an eConsent
 *     tags: [eConsent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Not found
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM econsents WHERE id=$1 RETURNING id', [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     EConsent:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         provider_id:
 *           type: string
 *           format: uuid
 *         patient_id:
 *           type: string
 *           format: uuid
 *         procedure_names:
 *           type: string
 *           example: "Root Canal Treatment, Tooth Extraction"
 *         patient_age:
 *           type: integer
 *           example: 35
 *         patient_address:
 *           type: string
 *           example: "123 Main St, Mumbai"
 *         place:
 *           type: string
 *           example: "Mumbai"
 *         sign_date:
 *           type: string
 *           example: "2026-04-24"
 *         sign_time:
 *           type: string
 *           example: "14:30"
 *         signature:
 *           type: string
 *           example: "Rohan Gupta"
 *         status:
 *           type: string
 *           enum: [pending, signed, rejected]
 *           example: pending
 *         signed_at:
 *           type: string
 *           format: date-time
 *         notes:
 *           type: string
 *         patient_first_name:
 *           type: string
 *         patient_last_name:
 *           type: string
 *         patient_email:
 *           type: string
 *         provider_first_name:
 *           type: string
 *         provider_last_name:
 *           type: string
 *         provider_clinic:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

module.exports = router;
