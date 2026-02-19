const pool = require('../config/database');

class ProviderFeeModel {
  static async create(feeData) {
    const { provider_id, procedure, fee, discount_percent, status } = feeData;
    const query = `
      INSERT INTO provider_fees (provider_id, procedure, fee, discount_percent, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [provider_id, procedure, fee, discount_percent || 0, status || 'approved'];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT pf.*, 
             u.first_name as provider_first_name, 
             u.last_name as provider_last_name,
             u.email as provider_email
      FROM provider_fees pf
      LEFT JOIN providers p ON pf.provider_id = p.id
      LEFT JOIN users u ON p.id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.provider_id) {
      query += ` AND pf.provider_id = $${paramCount}`;
      values.push(filters.provider_id);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND pf.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (pf.procedure ILIKE $${paramCount} OR u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ' ORDER BY pf.created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT pf.*, 
             u.first_name as provider_first_name, 
             u.last_name as provider_last_name,
             u.email as provider_email
      FROM provider_fees pf
      LEFT JOIN providers p ON pf.provider_id = p.id
      LEFT JOIN users u ON p.id = u.id
      WHERE pf.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByProviderId(providerId) {
    const query = `
      SELECT pf.*, 
             u.first_name as provider_first_name, 
             u.last_name as provider_last_name
      FROM provider_fees pf
      LEFT JOIN providers p ON pf.provider_id = p.id
      LEFT JOIN users u ON p.id = u.id
      WHERE pf.provider_id = $1
      ORDER BY pf.procedure ASC
    `;
    const result = await pool.query(query, [providerId]);
    return result.rows;
  }

  static async update(id, feeData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(feeData).forEach(key => {
      if (feeData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(feeData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    const query = `UPDATE provider_fees SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM provider_fees WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async bulkUpsert(providerId, fees) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const results = [];
      for (const fee of fees) {
        const query = `
          INSERT INTO provider_fees (provider_id, procedure, fee, discount_percent, status)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (provider_id, procedure) 
          DO UPDATE SET 
            fee = EXCLUDED.fee,
            discount_percent = EXCLUDED.discount_percent,
            status = EXCLUDED.status,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `;
        const values = [
          providerId,
          fee.procedure,
          fee.fee,
          fee.discount_percent || 0,
          fee.status || 'approved'
        ];
        const result = await client.query(query, values);
        results.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = ProviderFeeModel;
