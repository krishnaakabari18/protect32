const pool = require('../config/database');

class PaymentModel {
  static async create(paymentData) {
    const { patient_id, provider_id, appointment_id, treatment_plan_id, amount, payment_method, transaction_id } = paymentData;
    const query = `
      INSERT INTO payments (patient_id, provider_id, appointment_id, treatment_plan_id, amount, payment_method, transaction_id, status, payment_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Paid', NOW())
      RETURNING *
    `;
    const result = await pool.query(query, [patient_id, provider_id, appointment_id, treatment_plan_id, amount, payment_method, transaction_id]);
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

    if (filters.status && filters.status !== 'page' && filters.status !== 'limit') {
      query += ` AND p.status = $${paramCount}`;
      values.push(filters.status);
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
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(paymentData).forEach(key => {
      if (paymentData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(paymentData[key]);
        paramCount++;
      }
    });

    values.push(id);
    const query = `UPDATE payments SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = PaymentModel;
