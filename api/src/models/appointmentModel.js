const pool = require('../config/database');

class AppointmentModel {
  static async create(appointmentData) {
    const { patient_id, provider_id, operatory_id, appointment_date, start_time, end_time, service, notes, status, cancellation_reason } = appointmentData;
    const query = `
      INSERT INTO appointments (patient_id, provider_id, operatory_id, appointment_date, start_time, end_time, service, notes, status, cancellation_reason)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [patient_id, provider_id, operatory_id || null, appointment_date, start_time, end_time, service, notes || null, status || 'Upcoming', cancellation_reason || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
      let query = `
        SELECT a.id, a.patient_id, a.provider_id, a.operatory_id, 
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
      let paramCount = 1;

      if (filters.patient_id) {
        query += ` AND a.patient_id = $${paramCount}`;
        values.push(filters.patient_id);
        paramCount++;
      }

      if (filters.provider_id) {
        query += ` AND a.provider_id = $${paramCount}`;
        values.push(filters.provider_id);
        paramCount++;
      }

      if (filters.status) {
        query += ` AND a.status = $${paramCount}`;
        values.push(filters.status);
        paramCount++;
      }

      if (filters.date) {
        query += ` AND a.appointment_date = $${paramCount}`;
        values.push(filters.date);
        paramCount++;
      }

      if (filters.from_date) {
        query += ` AND a.appointment_date >= $${paramCount}`;
        values.push(filters.from_date);
        paramCount++;
      }

      if (filters.to_date) {
        query += ` AND a.appointment_date <= $${paramCount}`;
        values.push(filters.to_date);
        paramCount++;
      }

      query += ' ORDER BY a.appointment_date DESC, a.start_time DESC';
      const result = await pool.query(query, values);
      return result.rows;
    }

  static async findById(id) {
    const query = `
      SELECT a.*, 
        u1.first_name as patient_first_name, u1.last_name as patient_last_name, u1.email as patient_email,
        u2.first_name as provider_first_name, u2.last_name as provider_last_name,
        pr.clinic_name, pr.contact_number as clinic_contact,
        EXTRACT(EPOCH FROM (a.end_time - a.start_time))/60 as duration_minutes,
        TO_CHAR(a.appointment_date, 'YYYY-MM-DD') as appointment_date
      FROM appointments a
      JOIN users u1 ON a.patient_id = u1.id
      JOIN users u2 ON a.provider_id = u2.id
      JOIN providers pr ON a.provider_id = pr.id
      WHERE a.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, appointmentData) {
      const fields = [];
      const values = [];
      let paramCount = 1;

      // Filter out duration_minutes as it's calculated, not stored
      const { duration_minutes, ...dataToUpdate } = appointmentData;

      Object.keys(dataToUpdate).forEach(key => {
        if (dataToUpdate[key] !== undefined) {
          fields.push(`${key} = $${paramCount}`);
          values.push(dataToUpdate[key]);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        return null;
      }

      values.push(id);
      const query = `UPDATE appointments SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
      const result = await pool.query(query, values);
      return result.rows[0];
    }

  static async delete(id) {
    const query = 'DELETE FROM appointments WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = AppointmentModel;
