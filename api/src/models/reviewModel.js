const pool = require('../config/database');

class ReviewModel {
  static async create(data) {
    const { patient_id, provider_id, rating, comment } = data;
    const query = `
      INSERT INTO provider_reviews (patient_id, provider_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [patient_id, provider_id, rating, comment || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT r.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name,
        u.first_name as provider_first_name, u.last_name as provider_last_name
      FROM provider_reviews r
      LEFT JOIN users p ON r.patient_id = p.id
      LEFT JOIN providers prov ON r.provider_id = prov.id
      LEFT JOIN users u ON prov.id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.rating) {
      query += ` AND r.rating = $${paramCount}`;
      values.push(filters.rating);
      paramCount++;
    }

    query += ' ORDER BY r.created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT r.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name,
        u.first_name as provider_first_name, u.last_name as provider_last_name
      FROM provider_reviews r
      LEFT JOIN users p ON r.patient_id = p.id
      LEFT JOIN providers prov ON r.provider_id = prov.id
      LEFT JOIN users u ON prov.id = u.id
      WHERE r.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, data) {
    const { patient_id, provider_id, rating, comment } = data;
    const query = `
      UPDATE provider_reviews 
      SET patient_id = $1, provider_id = $2, rating = $3, comment = $4
      WHERE id = $5
      RETURNING *
    `;
    const values = [patient_id, provider_id, rating, comment || null, id];
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
