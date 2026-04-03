const pool = require('../config/database');

// Resolves comma-separated procedure IDs to a comma-separated names string
const PROCEDURE_NAMES_EXPR = `
  (SELECT string_agg(pr.name, ', ' ORDER BY pr.name)
   FROM procedures pr
   WHERE r.diagnosis IS NOT NULL
     AND r.diagnosis != ''
     AND pr.id::text = ANY(string_to_array(trim(r.diagnosis), ',')))
  AS diagnosis_names
`;

class ReviewModel {
  static async create(data) {
    const { patient_id, provider_id, rating, comment, diagnosis } = data;
    const result = await pool.query(
      `INSERT INTO provider_reviews (patient_id, provider_id, rating, comment, diagnosis)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [patient_id, provider_id, rating, comment || null, diagnosis || null]
    );
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT r.*,
        p.first_name as patient_first_name, p.last_name as patient_last_name,
        u.first_name as provider_first_name, u.last_name as provider_last_name,
        ${PROCEDURE_NAMES_EXPR}
      FROM provider_reviews r
      LEFT JOIN users p ON r.patient_id = p.id
      LEFT JOIN providers prov ON r.provider_id = prov.id
      LEFT JOIN users u ON prov.id = u.id
      WHERE 1=1
    `;
    const values = [];
    let p = 1;

    if (filters.rating) {
      query += ` AND r.rating = $${p++}`;
      values.push(filters.rating);
    }
    if (filters.provider_id) {
      query += ` AND r.provider_id = $${p++}`;
      values.push(filters.provider_id);
    }
    if (filters.patient_id) {
      query += ` AND r.patient_id = $${p++}`;
      values.push(filters.patient_id);
    }

    query += ' ORDER BY r.created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT r.*,
        p.first_name as patient_first_name, p.last_name as patient_last_name,
        u.first_name as provider_first_name, u.last_name as provider_last_name,
        ${PROCEDURE_NAMES_EXPR}
       FROM provider_reviews r
       LEFT JOIN users p ON r.patient_id = p.id
       LEFT JOIN providers prov ON r.provider_id = prov.id
       LEFT JOIN users u ON prov.id = u.id
       WHERE r.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const { patient_id, provider_id, rating, comment, diagnosis } = data;
    const result = await pool.query(
      `UPDATE provider_reviews
       SET patient_id = $1, provider_id = $2, rating = $3, comment = $4, diagnosis = $5
       WHERE id = $6 RETURNING *`,
      [patient_id, provider_id, rating, comment || null, diagnosis || null, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM provider_reviews WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = ReviewModel;
