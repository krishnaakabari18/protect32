const pool = require('../config/database');

// Generate appointment code: p32-YYYYMMDD-XXX (using TODAY'S date, not appointment date)
async function generateAppointmentCode() {
  // Use today's date
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`; // YYYYMMDD
  
  try {
    // Get all appointments with today's code prefix
    const result = await pool.query(
      `SELECT appointment_code FROM appointments 
       WHERE appointment_code LIKE $1
       ORDER BY appointment_code DESC
       LIMIT 1`,
      [`p32-${dateStr}-%`]
    );
    
    let nextSeq = 1;
    if (result.rows.length > 0) {
      const lastCode = result.rows[0].appointment_code;
      const lastSeq = parseInt(lastCode.split('-')[2]) || 0;
      nextSeq = lastSeq + 1;
    }
    
    return `p32-${dateStr}-${nextSeq.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating appointment code:', error);
    return `p32-${dateStr}-001`;
  }
}

class AppointmentModel {
  static async create(appointmentData) {
    const {
      patient_id, provider_id, operatory_id, appointment_date,
      start_time, end_time, service, notes, status, cancellation_reason
    } = appointmentData;

    const appointment_code = await generateAppointmentCode(appointment_date);

    const result = await pool.query(
      `INSERT INTO appointments
         (patient_id, provider_id, operatory_id, appointment_date, start_time, end_time,
          service, notes, status, cancellation_reason, appointment_code)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [patient_id, provider_id, operatory_id || null, appointment_date, start_time, end_time,
       service, notes || null, status || 'Upcoming', cancellation_reason || null, appointment_code]
    );
    return result.rows[0];
  }

  static async findAll(filters = {}) {
      let query = `
        SELECT a.id, a.patient_id, a.provider_id, a.operatory_id,
          a.appointment_code,
          TO_CHAR(a.appointment_date, 'YYYY-MM-DD') as appointment_date,
          a.start_time, a.end_time, a.service, a.status, a.notes, a.cancellation_reason,
          a.created_at, a.updated_at,
          u1.first_name as patient_first_name, u1.last_name as patient_last_name,
          u2.first_name as provider_first_name, u2.last_name as provider_last_name,
          pr.clinic_name,
          EXTRACT(EPOCH FROM (a.end_time - a.start_time))/60 as duration_minutes
        FROM appointments a
        JOIN users u1 ON a.patient_id = u1.id
        JOIN users u2 ON a.provider_id = u2.id
        JOIN providers pr ON a.provider_id = pr.id
        WHERE 1=1
      `;
      const values = [];
      let p = 1;

      if (filters.patient_id)  { query += ` AND a.patient_id = $${p}`;         values.push(filters.patient_id);  p++; }
      if (filters.provider_id) { query += ` AND a.provider_id = $${p}`;        values.push(filters.provider_id); p++; }
      if (filters.status)      { query += ` AND a.status = $${p}`;             values.push(filters.status);      p++; }
      if (filters.date)        { query += ` AND a.appointment_date = $${p}`;   values.push(filters.date);        p++; }
      if (filters.from_date)   { query += ` AND a.appointment_date >= $${p}`;  values.push(filters.from_date);   p++; }
      if (filters.to_date)     { query += ` AND a.appointment_date <= $${p}`;  values.push(filters.to_date);     p++; }

      if (filters.search) {
        query += ` AND (
          u1.first_name ILIKE $${p} OR
          u1.last_name ILIKE $${p} OR
          CONCAT(u1.first_name, ' ', u1.last_name) ILIKE $${p} OR
          u2.first_name ILIKE $${p} OR
          u2.last_name ILIKE $${p} OR
          CONCAT(u2.first_name, ' ', u2.last_name) ILIKE $${p} OR
          a.appointment_code ILIKE $${p} OR
          a.service ILIKE $${p}
        )`;
        values.push(`%${filters.search}%`);
        p++;
      }

      // Count total matching rows for pagination
      const countResult = await pool.query(
        `SELECT COUNT(*) FROM (${query}) AS sub`,
        values
      );
      const total = parseInt(countResult.rows[0].count);

      // SQL-level pagination
      const page  = parseInt(filters.page)  || 1;
      const limit = parseInt(filters.limit) || 10;
      const offset = (page - 1) * limit;

      query += ` ORDER BY a.appointment_date DESC, a.start_time DESC LIMIT $${p} OFFSET $${p + 1}`;
      values.push(limit, offset);

      const result = await pool.query(query, values);
      return { rows: result.rows, total };
    }

  static async findById(id) {
    const result = await pool.query(
      `SELECT a.*,
        a.appointment_code,
        u1.first_name as patient_first_name, u1.last_name as patient_last_name, u1.email as patient_email,
        u2.first_name as provider_first_name, u2.last_name as provider_last_name,
        pr.clinic_name, pr.contact_number as clinic_contact,
        EXTRACT(EPOCH FROM (a.end_time - a.start_time))/60 as duration_minutes,
        TO_CHAR(a.appointment_date, 'YYYY-MM-DD') as appointment_date
       FROM appointments a
       JOIN users u1 ON a.patient_id = u1.id
       JOIN users u2 ON a.provider_id = u2.id
       JOIN providers pr ON a.provider_id = pr.id
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async update(id, appointmentData) {
    const fields = [];
    const values = [];
    let p = 1;

    // duration_minutes is calculated, not stored; appointment_code is immutable
    const { duration_minutes, appointment_code, ...dataToUpdate } = appointmentData;

    Object.keys(dataToUpdate).forEach(key => {
      if (dataToUpdate[key] !== undefined) {
        fields.push(`${key} = $${p++}`);
        values.push(dataToUpdate[key]);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const result = await pool.query(
      `UPDATE appointments SET ${fields.join(', ')} WHERE id = $${p} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = AppointmentModel;
