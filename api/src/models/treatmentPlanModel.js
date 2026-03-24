const pool = require('../config/database');

class TreatmentPlanModel {
  static async create(data) {
    const keys = Object.keys(data);
    const fields = keys.join(', ');
    const placeholders = keys.map((_, i) => '$' + (i + 1)).join(', ');
    const values = Object.values(data);

    const query = 'INSERT INTO treatment_plans (' + fields + ') VALUES (' + placeholders + ') RETURNING *';
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT tp.*, 
        u.first_name as patient_first_name, u.last_name as patient_last_name,
        COALESCE(NULLIF(prov.full_name, ''), prov.clinic_name) as provider_full_name,
        SPLIT_PART(COALESCE(NULLIF(prov.full_name, ''), prov.clinic_name), ' ', 1) as provider_first_name,
        CASE WHEN POSITION(' ' IN COALESCE(NULLIF(prov.full_name, ''), prov.clinic_name)) > 0 
             THEN SUBSTRING(COALESCE(NULLIF(prov.full_name, ''), prov.clinic_name) FROM POSITION(' ' IN COALESCE(NULLIF(prov.full_name, ''), prov.clinic_name)) + 1) 
             ELSE '' END as provider_last_name
      FROM treatment_plans tp
      LEFT JOIN users u ON tp.patient_id = u.id
      LEFT JOIN providers prov ON tp.provider_id = prov.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    const allowedFilters = ['status', 'patient_id', 'provider_id'];
    Object.keys(filters).forEach(key => {
      if (allowedFilters.includes(key) && filters[key] !== undefined && filters[key] !== '') {
        query += ' AND tp.' + key + ' = $' + paramCount;
        values.push(filters[key]);
        paramCount++;
      }
    });

    query += ' ORDER BY tp.created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM treatment_plans WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, data) {
    const keys = Object.keys(data).filter(k => data[k] !== undefined);
    const fields = keys.map((key, i) => key + ' = $' + (i + 1)).join(', ');
    const values = keys.map(k => data[k]);
    values.push(id);

    const query = 'UPDATE treatment_plans SET ' + fields + ' WHERE id = $' + values.length + ' RETURNING *';
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM treatment_plans WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = TreatmentPlanModel;
