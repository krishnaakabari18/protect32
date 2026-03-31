const pool = require('../config/database');

// diagnosis is stored as a PostgreSQL text[] array literal e.g. {"uuid1","uuid2"}
const DIAG_NAMES = `(SELECT string_agg(pr.name, ', ' ORDER BY pr.name)
   FROM procedures pr
   WHERE tp.diagnosis IS NOT NULL
     AND pr.id = ANY(tp.diagnosis::uuid[])) AS diagnosis_names`;

class TreatmentPlanModel {
  static async create(data) {
    const keys = Object.keys(data);
    const placeholders = keys.map((_, i) => '$' + (i + 1)).join(', ');
    const values = Object.values(data);
    const query = 'INSERT INTO treatment_plans (' + keys.join(', ') + ') VALUES (' + placeholders + ') RETURNING *';
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT tp.*,
        u.first_name as patient_first_name, u.last_name as patient_last_name,
        COALESCE(NULLIF(prov.full_name, ''), prov.clinic_name) as provider_full_name,
        ${DIAG_NAMES}
      FROM treatment_plans tp
      LEFT JOIN users u ON tp.patient_id = u.id
      LEFT JOIN providers prov ON tp.provider_id = prov.id
      WHERE 1=1
    `;
    const values = [];
    let p = 1;

    const allowedFilters = ['status', 'patient_id', 'provider_id'];
    Object.keys(filters).forEach(key => {
      if (allowedFilters.includes(key) && filters[key] !== undefined && filters[key] !== '') {
        query += ' AND tp.' + key + ' = $' + p;
        values.push(filters[key]);
        p++;
      }
    });

    query += ' ORDER BY tp.created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(`
      SELECT tp.*,
        u.first_name as patient_first_name, u.last_name as patient_last_name,
        COALESCE(NULLIF(prov.full_name, ''), prov.clinic_name) as provider_full_name,
        ${DIAG_NAMES}
      FROM treatment_plans tp
      LEFT JOIN users u ON tp.patient_id = u.id
      LEFT JOIN providers prov ON tp.provider_id = prov.id
      WHERE tp.id = $1`, [id]);
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
    const result = await pool.query('DELETE FROM treatment_plans WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = TreatmentPlanModel;
