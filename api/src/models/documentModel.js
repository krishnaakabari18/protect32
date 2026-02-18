const pool = require('../config/database');

class DocumentModel {
  static async create(data) {
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(data);
    
    const query = `INSERT INTO documents (${fields}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT d.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name,
        prov.first_name as provider_first_name, prov.last_name as provider_last_name
      FROM documents d
      LEFT JOIN users p ON d.patient_id = p.id
      LEFT JOIN users prov ON d.provider_id = prov.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && key !== 'page' && key !== 'limit') {
        query += ` AND d.${key} = $${paramCount}`;
        values.push(filters[key]);
        paramCount++;
      }
    });

    query += ' ORDER BY d.created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM documents WHERE id = $1';
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
    const query = `UPDATE documents SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM documents WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = DocumentModel;
