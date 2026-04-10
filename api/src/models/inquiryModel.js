const pool = require('../config/database');

// Auto-migrate
pool.query(`
  CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    subject VARCHAR(500),
    message TEXT NOT NULL,
    source VARCHAR(100),
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new','in_progress','completed','rejected')),
    is_read BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).catch(() => {});

class InquiryModel {
  static async create(data) {
    const { name, email, phone, subject, message, source } = data;
    const r = await pool.query(
      `INSERT INTO inquiries (name, email, phone, subject, message, source)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, email, phone, subject || null, message, source || null]
    );
    return r.rows[0];
  }

  static async findAll(filters = {}) {
    let q = `SELECT * FROM inquiries WHERE 1=1`;
    const vals = []; let p = 1;

    if (filters.status)     { q += ` AND status = $${p++}`;                    vals.push(filters.status); }
    if (filters.is_read !== undefined && filters.is_read !== '') {
                              q += ` AND is_read = $${p++}`;                    vals.push(filters.is_read === 'true' || filters.is_read === true); }
    if (filters.from_date)  { q += ` AND created_at >= $${p++}`;               vals.push(filters.from_date); }
    if (filters.to_date)    { q += ` AND created_at <= $${p++}::date + 1`;     vals.push(filters.to_date); }
    if (filters.search) {
      q += ` AND (name ILIKE $${p} OR email ILIKE $${p} OR phone ILIKE $${p} OR subject ILIKE $${p})`;
      vals.push(`%${filters.search}%`); p++;
    }

    // Count
    const countResult = await pool.query(`SELECT COUNT(*) FROM (${q}) sub`, vals);
    const total = parseInt(countResult.rows[0].count);

    // Paginate
    const page  = parseInt(filters.page)  || 1;
    const limit = parseInt(filters.limit) || 10;
    q += ` ORDER BY created_at DESC LIMIT $${p++} OFFSET $${p++}`;
    vals.push(limit, (page - 1) * limit);

    const r = await pool.query(q, vals);
    return { rows: r.rows, total };
  }

  static async findById(id) {
    const r = await pool.query('SELECT * FROM inquiries WHERE id = $1', [id]);
    return r.rows[0];
  }

  static async update(id, data) {
    const allowed = ['status', 'notes', 'is_read'];
    const fields = []; const vals = []; let p = 1;
    allowed.forEach(k => {
      if (data[k] !== undefined) { fields.push(`${k} = $${p++}`); vals.push(data[k]); }
    });
    if (!fields.length) return this.findById(id);
    fields.push('updated_at = CURRENT_TIMESTAMP');
    vals.push(id);
    const r = await pool.query(
      `UPDATE inquiries SET ${fields.join(', ')} WHERE id = $${p} RETURNING *`, vals
    );
    return r.rows[0];
  }

  static async delete(id) {
    const r = await pool.query('DELETE FROM inquiries WHERE id = $1 RETURNING *', [id]);
    return r.rows[0];
  }

  static async bulkDelete(ids) {
    const r = await pool.query(
      `DELETE FROM inquiries WHERE id = ANY($1::uuid[]) RETURNING id`, [ids]
    );
    return r.rows;
  }

  static async bulkUpdateStatus(ids, status) {
    const r = await pool.query(
      `UPDATE inquiries SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($2::uuid[]) RETURNING id`,
      [status, ids]
    );
    return r.rows;
  }

  static async exportAll(filters = {}) {
    let q = `SELECT id, name, email, phone, subject, message, source, status, is_read, notes, created_at FROM inquiries WHERE 1=1`;
    const vals = []; let p = 1;
    if (filters.status)    { q += ` AND status = $${p++}`;    vals.push(filters.status); }
    if (filters.from_date) { q += ` AND created_at >= $${p++}`; vals.push(filters.from_date); }
    if (filters.to_date)   { q += ` AND created_at <= $${p++}::date + 1`; vals.push(filters.to_date); }
    if (filters.search) {
      q += ` AND (name ILIKE $${p} OR email ILIKE $${p} OR phone ILIKE $${p})`;
      vals.push(`%${filters.search}%`); p++;
    }
    q += ' ORDER BY created_at DESC';
    const r = await pool.query(q, vals);
    return r.rows;
  }
}

module.exports = InquiryModel;
