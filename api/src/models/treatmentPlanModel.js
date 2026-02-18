const pool = require('../config/database');

class TreatmentPlanModel {
  static async create(data) {
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(data);
    
    const query = `INSERT INTO treatment_plans (${fields}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT tp.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name,
        prov.first_name as provider_first_name, prov.last_name as provider_last_name
      FROM treatment_plans tp
      LEFT JOIN users p ON tp.patient_id = p.id
      LEFT JOIN users prov ON tp.provider_id = prov.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && key !== 'page' && key !== 'limit') {
        query += ` AND tp.${key} = $${paramCount}`;
        values.push(filters[key]);
        paramCount++;
      }
    });

    query += ' ORDER BY tp.created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM treatment_plans WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(data[key]);
        paramCount++;
      }
    });

    values.push(id);
    const query = `UPDATE treatment_plans SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM treatment_plans WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = TreatmentPlanModel;
