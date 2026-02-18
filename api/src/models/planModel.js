const pool = require('../config/database');

class PlanModel {
  static async create(planData) {
    const { title, price, features, is_popular, max_members, discount_percent, free_checkups_annually, free_cleanings_annually, free_xrays_annually, color_scheme } = planData;
    const query = `
      INSERT INTO plans (title, price, features, is_popular, max_members, discount_percent, free_checkups_annually, free_cleanings_annually, free_xrays_annually, color_scheme)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [title, price, features, is_popular, max_members, discount_percent, free_checkups_annually, free_cleanings_annually, free_xrays_annually, color_scheme];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM plans WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.is_active !== undefined) {
      query += ` AND is_active = $${paramCount}`;
      values.push(filters.is_active);
      paramCount++;
    }

    query += ' ORDER BY price ASC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM plans WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, planData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(planData).forEach(key => {
      if (planData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(planData[key]);
        paramCount++;
      }
    });

    values.push(id);
    const query = `UPDATE plans SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM plans WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = PlanModel;
