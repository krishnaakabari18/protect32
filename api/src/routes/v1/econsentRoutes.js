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

// GET /econsents — list with filters
router.get('/', auth, async (req, res) => {
  try {
    const { provider_id, patient_id, status, page = 1, limit = 20 } = req.query;
    const vals = [];
    let p = 1;
    let q = `
      SELECT e.*,
        u1.first_name as patient_first_name, u1.last_name as patient_last_name,
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

// GET /econsents/:id — single record with full patient/provider details
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

// POST /econsents — create
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

// PUT /econsents/:id — update status + signature fields
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, notes, place, sign_date, sign_time, signature } = req.body;
    const signed_at = status === 'signed' ? new Date() : null;
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

// DELETE /econsents/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM econsents WHERE id=$1 RETURNING id', [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

module.exports = router;
