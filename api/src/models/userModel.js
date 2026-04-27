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
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Safe delete using savepoints - handles missing tables AND constraint errors
      const safe = async (sql, params) => {
        try {
          await client.query('SAVEPOINT sp');
          await client.query(sql, params);
          await client.query('RELEASE SAVEPOINT sp');
        } catch (e) {
          await client.query('ROLLBACK TO SAVEPOINT sp');
          // Only ignore "table does not exist" errors
          if (!e.message.includes('does not exist') && !e.message.includes('relation')) {
            console.warn('[UserDelete] Skipped:', e.message);
          }
        }
      };

      await safe('DELETE FROM user_permissions WHERE user_id = $1', [id]);
      await safe('DELETE FROM notifications WHERE user_id = $1', [id]);
      await safe('DELETE FROM refresh_tokens WHERE user_id = $1', [id]);
      await safe('DELETE FROM otp_verifications WHERE user_id = $1', [id]);
      await safe('DELETE FROM econsents WHERE patient_id = $1 OR provider_id = $1', [id]);
      await safe('DELETE FROM subscriptions WHERE patient_id = $1', [id]);
      await safe('DELETE FROM payments WHERE patient_id = $1 OR provider_id = $1', [id]);
      await safe('DELETE FROM prescriptions WHERE patient_id = $1 OR provider_id = $1', [id]);
      await safe('DELETE FROM provider_reviews WHERE patient_id = $1 OR provider_id = $1', [id]);
      await safe('DELETE FROM reviews WHERE patient_id = $1 OR provider_id = $1', [id]);
      await safe('DELETE FROM treatment_plans WHERE patient_id = $1 OR provider_id = $1', [id]);
      await safe('DELETE FROM appointments WHERE patient_id = $1 OR provider_id = $1', [id]);
      await safe('DELETE FROM documents WHERE patient_id = $1 OR uploaded_by = $1', [id]);
      await safe('DELETE FROM support_tickets WHERE patient_id = $1 OR provider_id = $1', [id]);
      await safe('DELETE FROM chat_messages WHERE sender_id = $1', [id]);
      await safe('DELETE FROM chat_conversations WHERE patient_id = $1 OR provider_id = $1', [id]);
      await safe('DELETE FROM patients WHERE id = $1', [id]);
      await safe('DELETE FROM providers WHERE id = $1', [id]);

      const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = UserModel;
