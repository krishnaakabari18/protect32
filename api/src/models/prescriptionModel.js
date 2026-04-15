const pool = require('../config/database');

class PrescriptionModel {
  static async create(data) {
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(data);
    
    const query = `INSERT INTO prescriptions (${fields}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT pr.*,
        p.first_name as patient_first_name, p.last_name as patient_last_name,
        prov.first_name as provider_first_name, prov.last_name as provider_last_name
      FROM prescriptions pr
      LEFT JOIN users p ON pr.patient_id = p.id
      LEFT JOIN users prov ON pr.provider_id = prov.id
      WHERE 1=1
    `;
    const values = [];
    let idx = 1;

    if (filters.patient_id)      { query += ` AND pr.patient_id = $${idx++}`;  values.push(filters.patient_id); }
    if (filters.provider_id)     { query += ` AND pr.provider_id = $${idx++}`; values.push(filters.provider_id); }
    if (filters.medication_name) { query += ` AND pr.medication_name ILIKE $${idx++}`; values.push('%' + filters.medication_name + '%'); }
    if (filters.date_prescribed) { query += ` AND DATE(pr.date_prescribed) = $${idx++}`; values.push(filters.date_prescribed); }
    if (filters.from_date)       { query += ` AND DATE(pr.date_prescribed) >= $${idx++}`; values.push(filters.from_date); }
    if (filters.to_date)         { query += ` AND DATE(pr.date_prescribed) <= $${idx++}`; values.push(filters.to_date); }
    if (filters.search) {
      query += ` AND (p.first_name ILIKE $${idx} OR p.last_name ILIKE $${idx} OR pr.medication_name ILIKE $${idx})`;
      values.push('%' + filters.search + '%'); idx++;
    }

    const countResult = await pool.query('SELECT COUNT(*) FROM (' + query + ') sub', values);
    const total = parseInt(countResult.rows[0].count);

    const page  = parseInt(filters.page)  || 1;
    const limit = parseInt(filters.limit) || 10;
    query += ` ORDER BY pr.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, (page - 1) * limit);

    const result = await pool.query(query, values);
    return { rows: result.rows, total };
  }
  static async findById(id) {
    const query = 'SELECT * FROM prescriptions WHERE id = $1';
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
    const query = `UPDATE prescriptions SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM prescriptions WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = PrescriptionModel;
