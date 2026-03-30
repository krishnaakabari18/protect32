const pool = require('../config/database');

class PaymentModel {
  static async create(paymentData) {
    const { patient_id, provider_id, appointment_id, treatment_plan_id, amount, payment_method, transaction_id, payment_status, payment_date } = paymentData;
    const resolvedStatus = payment_status || 'Pending';
    const query = `
      INSERT INTO payments (patient_id, provider_id, appointment_id, treatment_plan_id, amount, payment_method, transaction_id, status, payment_status, payment_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9)
      RETURNING *
    `;
    const result = await pool.query(query, [
      patient_id || null, provider_id || null, appointment_id || null,
      treatment_plan_id || null, amount, payment_method || null,
      transaction_id || null, resolvedStatus, payment_date || null
    ]);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT p.*,
        u1.first_name as patient_first_name, u1.last_name as patient_last_name
      FROM payments p
      LEFT JOIN users u1 ON p.patient_id = u1.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.patient_id) {
      query += ` AND p.patient_id = $${paramCount}`;
      values.push(filters.patient_id);
      paramCount++;
    }

    if (filters.provider_id) {
      query += ` AND p.provider_id = $${paramCount}`;
      values.push(filters.provider_id);
      paramCount++;
    }

    if (filters.payment_status) {
      query += ` AND p.payment_status = $${paramCount}`;
      values.push(filters.payment_status);
      paramCount++;
    }

    query += ' ORDER BY p.created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM payments WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, paymentData) {
    const allowed = ['amount', 'payment_method', 'transaction_id', 'payment_status', 'payment_date', 'notes', 'appointment_id', 'patient_id'];
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(paymentData).forEach(key => {
      if (allowed.includes(key) && paymentData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(paymentData[key]);
        // Keep legacy status column in sync
        if (key === 'payment_status') {
          fields.push(`status = $${paramCount}`);
        }
        paramCount++;
      }
    });

    if (fields.length === 0) throw new Error('No fields to update');

    values.push(id);
    const query = `UPDATE payments SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = PaymentModel;
