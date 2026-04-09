const pool = require('../config/database');

// Auto-migrate on first use
const migrate = async () => {
  await pool.query(`
    ALTER TABLE plans ADD COLUMN IF NOT EXISTS razorpay_plan_id VARCHAR(100);
    ALTER TABLE plans ADD COLUMN IF NOT EXISTS interval VARCHAR(20) DEFAULT 'monthly';
    ALTER TABLE plans ADD COLUMN IF NOT EXISTS interval_count INTEGER DEFAULT 1;
    ALTER TABLE plans ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';
    ALTER TABLE plans ADD COLUMN IF NOT EXISTS name VARCHAR(255);
  `).catch(() => {});

  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID,
      plan_id UUID,
      razorpay_subscription_id VARCHAR(100) UNIQUE,
      razorpay_customer_id VARCHAR(100),
      razorpay_payment_id VARCHAR(100),
      razorpay_signature VARCHAR(500),
      status VARCHAR(30) DEFAULT 'created',
      short_url TEXT,
      start_date TIMESTAMP,
      end_date TIMESTAMP,
      charge_at TIMESTAMP,
      notes JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).catch(() => {});
};
migrate();

class SubscriptionModel {
  static async create(data) {
    const { user_id, plan_id, razorpay_subscription_id, razorpay_customer_id, status, short_url, notes } = data;
    const r = await pool.query(
      `INSERT INTO subscriptions (user_id, plan_id, razorpay_subscription_id, razorpay_customer_id, status, short_url, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [user_id, plan_id, razorpay_subscription_id, razorpay_customer_id, status || 'created', short_url, notes ? JSON.stringify(notes) : null]
    );
    return r.rows[0];
  }

  static async findAll(filters = {}) {
    let q = `
      SELECT s.*, u.first_name, u.last_name, u.email,
             p.title as plan_title, p.price as plan_price, p.name as plan_name,
             p.interval as plan_interval
      FROM subscriptions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN plans p ON s.plan_id = p.id
      WHERE 1=1
    `;
    const vals = []; let idx = 1;
    if (filters.user_id)  { q += ` AND s.user_id = $${idx++}`;  vals.push(filters.user_id); }
    if (filters.status)   { q += ` AND s.status = $${idx++}`;   vals.push(filters.status); }
    if (filters.plan_id)  { q += ` AND s.plan_id = $${idx++}`;  vals.push(filters.plan_id); }
    q += ' ORDER BY s.created_at DESC';
    const r = await pool.query(q, vals);
    return r.rows;
  }

  static async findById(id) {
    const r = await pool.query(
      `SELECT s.*, u.first_name, u.last_name, u.email,
              p.title as plan_title, p.price as plan_price, p.name as plan_name
       FROM subscriptions s
       LEFT JOIN users u ON s.user_id = u.id
       LEFT JOIN plans p ON s.plan_id = p.id
       WHERE s.id = $1`, [id]
    );
    return r.rows[0];
  }

  static async findByRazorpayId(razorpay_subscription_id) {
    const r = await pool.query('SELECT * FROM subscriptions WHERE razorpay_subscription_id = $1', [razorpay_subscription_id]);
    return r.rows[0];
  }

  static async updateStatus(id, status, extra = {}) {
    const fields = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
    const vals = [status];
    let idx = 2;
    if (extra.razorpay_payment_id) { fields.push(`razorpay_payment_id = $${idx++}`); vals.push(extra.razorpay_payment_id); }
    if (extra.razorpay_signature)  { fields.push(`razorpay_signature = $${idx++}`);  vals.push(extra.razorpay_signature); }
    if (extra.start_date)          { fields.push(`start_date = $${idx++}`);           vals.push(extra.start_date); }
    if (extra.end_date)            { fields.push(`end_date = $${idx++}`);             vals.push(extra.end_date); }
    if (extra.charge_at)           { fields.push(`charge_at = $${idx++}`);            vals.push(extra.charge_at); }
    vals.push(id);
    const r = await pool.query(`UPDATE subscriptions SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, vals);
    return r.rows[0];
  }

  static async updateByRazorpayId(razorpay_subscription_id, status, extra = {}) {
    const sub = await this.findByRazorpayId(razorpay_subscription_id);
    if (!sub) return null;
    return this.updateStatus(sub.id, status, extra);
  }
}

module.exports = SubscriptionModel;
