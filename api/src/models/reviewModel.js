const pool = require('../config/database');

class ReviewModel {
  static async create(data) {
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(data);
    
    const query = `INSERT INTO provider_reviews (${fields}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT r.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name,
        prov.first_name as provider_first_name, prov.last_name as provider_last_name
      FROM provider_reviews r
      LEFT JOIN users p ON r.patient_id = p.id
      LEFT JOIN users prov ON r.provider_id = prov.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && key !== 'page' && key !== 'limit') {
        query += ` AND r.${key} = $${paramCount}`;
        values.push(filters[key]);
        paramCount++;
      }
    });

    query += ' ORDER BY r.created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM provider_reviews WHERE id = $1';
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
    const query = `UPDATE provider_reviews SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM provider_reviews WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = ReviewModel;
