const pool = require('../config/database');

// Serialize JSONB fields before saving
const serializeJson = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val === 'string') return val; // already serialized
  return JSON.stringify(val);
};

class PlanModel {
  static async create(planData) {
    const {
      title, price, features, is_popular, max_members, discount_percent,
      free_checkups_annually, free_cleanings_annually, free_xrays_annually,
      color_scheme, provider_id, is_active, procedure_rows,
      razorpay_plan_id, interval, interval_count, currency, name,
    } = planData;

    const query = `
      INSERT INTO plans (
        title, price, features, is_popular, max_members, discount_percent,
        free_checkups_annually, free_cleanings_annually, free_xrays_annually,
        color_scheme, provider_id, is_active, procedure_rows,
        razorpay_plan_id, interval, interval_count, currency, name
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING *
    `;
    const values = [
      title, price,
      Array.isArray(features) ? features : [],
      is_popular || false,
      max_members || null,
      discount_percent || 0,
      free_checkups_annually || 0,
      free_cleanings_annually || 0,
      free_xrays_annually || 0,
      serializeJson(color_scheme),
      provider_id || null,
      is_active !== undefined ? is_active : true,
      serializeJson(procedure_rows || []),
      razorpay_plan_id || null,
      interval || null,
      interval_count || null,
      currency || null,
      name || null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT p.*,
             u.first_name as provider_first_name,
             u.last_name as provider_last_name
      FROM plans p
      LEFT JOIN users u ON p.provider_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let p = 1;

    if (filters.is_active !== undefined) {
      query += ` AND p.is_active = $${p++}`;
      values.push(filters.is_active);
    }

    query += ' ORDER BY p.price ASC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT p.*,
             u.first_name as provider_first_name,
             u.last_name as provider_last_name
      FROM plans p
      LEFT JOIN users u ON p.provider_id = u.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, planData) {
    const fields = [];
    const values = [];
    let p = 1;

    // Serialize JSONB/array fields before building query
    const data = { ...planData };
    if (data.color_scheme !== undefined)   data.color_scheme   = serializeJson(data.color_scheme);
    if (data.procedure_rows !== undefined) data.procedure_rows = serializeJson(data.procedure_rows);
    // features is a PG ARRAY — pass as JS array directly (pg driver handles it)
    if (data.features !== undefined && !Array.isArray(data.features)) {
      try { data.features = JSON.parse(data.features); } catch { data.features = []; }
    }

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${p++}`);
        values.push(data[key]);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE plans SET ${fields.join(', ')} WHERE id = $${p} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM plans WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = PlanModel;
