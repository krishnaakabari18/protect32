const pool = require('../config/database');

class PlanFeatureModel {
  static async findAll() {
    const result = await pool.query(
      'SELECT * FROM plan_features WHERE is_active = true ORDER BY name ASC'
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM plan_features WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(data) {
    const { name, description } = data;
    const result = await pool.query(
      'INSERT INTO plan_features (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const { name, description, is_active } = data;
    const result = await pool.query(
      `UPDATE plan_features SET name = COALESCE($1, name), description = COALESCE($2, description),
       is_active = COALESCE($3, is_active), updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [name, description, is_active, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM plan_features WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = PlanFeatureModel;
