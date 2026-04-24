const express = require('express');
const router = express.Router();
const { AuthMiddleware } = require('../../middleware/auth');
const auth = AuthMiddleware.authenticate;
const pool = require('../../config/database');

// GET /econsents — list with filters
router.get('/', auth, async (req, res) => {
  try {
    const { provider_id, patient_id, status, page = 1, limit = 20 } = req.query;
    const vals = [];
    let p = 1;
    let q = `
      SELECT e.*,
        u1.first_name as patient_first_name, u1.last_name as patient_last_name,
        u2.first_name as provider_first_name, u2.last_name as provider_last_name
      FROM econsents e
      JOIN users u1 ON e.patient_id = u1.id
      JOIN users u2 ON e.provider_id = u2.id
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

// PUT /econsents/:id — update status
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const signed_at = status === 'signed' ? new Date() : null;
    const r = await pool.query(
      `UPDATE econsents SET status=$2, notes=$3, signed_at=COALESCE($4, signed_at), updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [req.params.id, status, notes || null, signed_at]
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
