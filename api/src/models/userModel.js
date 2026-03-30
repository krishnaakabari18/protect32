const pool = require('../config/database');

class UserModel {
  static async create(userData) {
    const { email, password_hash, mobile_number, first_name, last_name, user_type, profile_picture, date_of_birth, address, menu_permissions } = userData;
    const query = `
      INSERT INTO users (email, password_hash, mobile_number, first_name, last_name, user_type, profile_picture, date_of_birth, address, menu_permissions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [email, password_hash, mobile_number, first_name, last_name, user_type, profile_picture, date_of_birth, address, menu_permissions || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM users WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.user_type) {
      query += ` AND user_type = $${paramCount}`;
      values.push(filters.user_type);
      paramCount++;
    } else if (filters.user_types) {
      // Support comma-separated list of user types
      const types = filters.user_types.split(',').map(t => t.trim()).filter(Boolean);
      if (types.length > 0) {
        const placeholders = types.map((_, i) => `$${paramCount + i}`).join(', ');
        query += ` AND user_type IN (${placeholders})`;
        values.push(...types);
        paramCount += types.length;
      }
    }

    if (filters.is_active !== undefined) {
      query += ` AND is_active = $${paramCount}`;
      values.push(filters.is_active);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async update(id, userData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(userData[key]);
        paramCount++;
      }
    });

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = UserModel;
