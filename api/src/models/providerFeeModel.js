const pool = require('../config/database');

// Resolves comma-separated procedure IDs to names
const PROCEDURE_NAMES_EXPR = `
  (SELECT string_agg(pr.name, ', ' ORDER BY pr.name)
   FROM procedures pr
   WHERE pr.id::text = ANY(string_to_array(pf.procedure, ',')))
  AS procedure_names
`;

class ProviderFeeModel {
  static async create(feeData) {
    const { provider_id, procedure, fee, discount_percent, status } = feeData;
    const result = await pool.query(
      `INSERT INTO provider_fees (provider_id, procedure, fee, discount_percent, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [provider_id, procedure, fee, discount_percent || 0, status || 'approved']
    );
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT pf.*,
             u.first_name as provider_first_name,
             u.last_name as provider_last_name,
             u.email as provider_email,
             ${PROCEDURE_NAMES_EXPR}
      FROM provider_fees pf
      LEFT JOIN providers p ON pf.provider_id = p.id
      LEFT JOIN users u ON p.id = u.id
      WHERE 1=1
    `;
    const values = [];
    let p = 1;

    if (filters.provider_id) {
      query += ` AND pf.provider_id = $${p++}`;
      values.push(filters.provider_id);
    }
    if (filters.status) {
      query += ` AND pf.status = $${p++}`;
      values.push(filters.status);
    }
    if (filters.search) {
      query += ` AND (pf.procedure ILIKE $${p} OR u.first_name ILIKE $${p} OR u.last_name ILIKE $${p})`;
      values.push(`%${filters.search}%`);
      p++;
    }

    query += ' ORDER BY pf.created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT pf.*,
              u.first_name as provider_first_name,
              u.last_name as provider_last_name,
              u.email as provider_email,
              ${PROCEDURE_NAMES_EXPR}
       FROM provider_fees pf
       LEFT JOIN providers p ON pf.provider_id = p.id
       LEFT JOIN users u ON p.id = u.id
       WHERE pf.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByProviderId(providerId) {
    const result = await pool.query(
      `SELECT pf.*,
              u.first_name as provider_first_name,
              u.last_name as provider_last_name,
              ${PROCEDURE_NAMES_EXPR}
       FROM provider_fees pf
       LEFT JOIN providers p ON pf.provider_id = p.id
       LEFT JOIN users u ON p.id = u.id
       WHERE pf.provider_id = $1
       ORDER BY pf.procedure ASC`,
      [providerId]
    );
    return result.rows[0];
  }

  static async update(id, feeData) {
    const fields = [];
    const values = [];
    let p = 1;

    Object.keys(feeData).forEach(key => {
      if (feeData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${p++}`);
        values.push(feeData[key]);
      }
    });

    if (fields.length === 0) throw new Error('No fields to update');

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    const result = await pool.query(
      `UPDATE provider_fees SET ${fields.join(', ')} WHERE id = $${p} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM provider_fees WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async bulkUpsert(providerId, fees) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const results = [];
      for (const fee of fees) {
        const result = await client.query(
          `INSERT INTO provider_fees (provider_id, procedure, fee, discount_percent, status)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (provider_id, procedure)
           DO UPDATE SET fee = EXCLUDED.fee, discount_percent = EXCLUDED.discount_percent,
             status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP
           RETURNING *`,
          [providerId, fee.procedure, fee.fee, fee.discount_percent || 0, fee.status || 'approved']
        );
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
