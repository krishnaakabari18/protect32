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

      // 1. Delete user_permissions
      await client.query('DELETE FROM user_permissions WHERE user_id = $1', [id]);

      // 2. Delete notifications
      await client.query('DELETE FROM notifications WHERE user_id = $1', [id]);

      // 3. Delete refresh tokens & OTP
      await client.query('DELETE FROM refresh_tokens WHERE user_id = $1', [id]);
      await client.query('DELETE FROM otp_verifications WHERE user_id = $1', [id]);

      // 4. Delete econsents (patient or provider side)
      await client.query('DELETE FROM econsents WHERE patient_id = $1 OR provider_id = $1', [id]);

      // 5. Delete subscriptions
      await client.query('DELETE FROM subscriptions WHERE patient_id = $1', [id]);

      // 6. Delete payments
      await client.query('DELETE FROM payments WHERE patient_id = $1 OR provider_id = $1', [id]);

      // 7. Delete prescriptions
      await client.query('DELETE FROM prescriptions WHERE patient_id = $1 OR provider_id = $1', [id]);

      // 8. Delete reviews
      await client.query('DELETE FROM reviews WHERE patient_id = $1 OR provider_id = $1', [id]);

      // 9. Delete treatment plans
      await client.query('DELETE FROM treatment_plans WHERE patient_id = $1 OR provider_id = $1', [id]);

      // 10. Delete appointments
      await client.query('DELETE FROM appointments WHERE patient_id = $1 OR provider_id = $1', [id]);

      // 11. Delete documents
      await client.query('DELETE FROM documents WHERE patient_id = $1 OR uploaded_by = $1', [id]);

      // 12. Delete support tickets
      await client.query('DELETE FROM support_tickets WHERE patient_id = $1 OR provider_id = $1', [id]);

      // 13. Delete chat messages/conversations
      await client.query('DELETE FROM chat_messages WHERE sender_id = $1', [id]);
      await client.query(`
        DELETE FROM chat_conversations
        WHERE patient_id = $1 OR provider_id = $1
      `, [id]);

      // 14. Delete patient record (if patient)
      await client.query('DELETE FROM patients WHERE id = $1', [id]);

      // 15. Delete provider record (if provider)
      await client.query('DELETE FROM providers WHERE id = $1', [id]);

      // 16. Finally delete the user
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
