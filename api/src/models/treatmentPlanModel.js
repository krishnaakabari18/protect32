const pool = require('../config/database');

// diagnosis stored as JSON string e.g. '["uuid1","uuid2"]' OR PG array '{"uuid1","uuid2"}'
const DIAG_NAMES = `(
  SELECT string_agg(pr.name, ', ' ORDER BY pr.name)
  FROM procedures pr
  WHERE tp.diagnosis IS NOT NULL
    AND tp.diagnosis != ''
    AND pr.id::text = ANY(
      CASE
        WHEN tp.diagnosis LIKE '[%]'
          THEN ARRAY(SELECT jsonb_array_elements_text(tp.diagnosis::jsonb))
        WHEN tp.diagnosis LIKE '{%}'
          THEN ARRAY(SELECT unnest(tp.diagnosis::text[]))
        ELSE ARRAY[]::text[]
      END
    )
) AS diagnosis_names`;

// Provider name from users table (first_name + last_name preferred over full_name)
const PROVIDER_NAME = `COALESCE(
  NULLIF(TRIM(COALESCE(pu.first_name,'') || ' ' || COALESCE(pu.last_name,'')), ''),
  NULLIF(prov.full_name, ''),
  prov.clinic_name
) as provider_full_name,
pu.email as provider_email`;

class TreatmentPlanModel {
  static async create(data) {
    // Ensure procedure_items column exists
    await pool.query(`ALTER TABLE treatment_plans ADD COLUMN IF NOT EXISTS procedure_items JSONB`).catch(() => {});
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
        ${PROVIDER_NAME},
        ${DIAG_NAMES}
      FROM treatment_plans tp
      LEFT JOIN users u ON tp.patient_id = u.id
      LEFT JOIN providers prov ON tp.provider_id = prov.id
      LEFT JOIN users pu ON prov.id = pu.id
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
        ${PROVIDER_NAME},
        ${DIAG_NAMES}
      FROM treatment_plans tp
      LEFT JOIN users u ON tp.patient_id = u.id
      LEFT JOIN providers prov ON tp.provider_id = prov.id
      LEFT JOIN users pu ON prov.id = pu.id
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
