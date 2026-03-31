const pool = require('../config/database');

class FaqModel {
  static async create(data) {
    const { question, answer, category, sort_order, status } = data;
    const result = await pool.query(
      `INSERT INTO faqs (question, answer, category, sort_order, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [question, answer || null, category || null, sort_order || 0, status || 'Active']
    );
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `SELECT * FROM faqs WHERE 1=1`;
    const values = [];
    let p = 1;

    if (filters.status) {
      query += ` AND status = $${p++}`;
      values.push(filters.status);
    }

    if (filters.category) {
      query += ` AND category = $${p++}`;
      values.push(filters.category);
    }

    if (filters.search) {
      query += ` AND (question ILIKE $${p} OR answer ILIKE $${p})`;
      values.push(`%${filters.search}%`);
      p++;
    }

    query += ' ORDER BY sort_order ASC, created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM faqs WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async update(id, data) {
    const allowed = ['question', 'answer', 'category', 'sort_order', 'status'];
    const fields = [];
    const values = [];
    let p = 1;

    allowed.forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${p++}`);
        values.push(data[key]);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const result = await pool.query(
      `UPDATE faqs SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${p} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE faqs SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM faqs WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = FaqModel;
