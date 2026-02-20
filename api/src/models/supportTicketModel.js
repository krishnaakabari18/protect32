const pool = require('../config/database');

class SupportTicketModel {
  static async create(ticketData) {
    const { patient_id, provider_id, subject, description, status } = ticketData;
    const query = `
      INSERT INTO support_tickets (patient_id, provider_id, subject, description, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [patient_id, provider_id || null, subject, description, status || 'Open'];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT 
        st.id, st.patient_id, st.provider_id, st.subject, st.description, st.status,
        TO_CHAR(st.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
        TO_CHAR(st.updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at,
        u1.first_name as patient_first_name, 
        u1.last_name as patient_last_name,
        u1.mobile_number as patient_phone,
        u2.first_name as provider_first_name,
        u2.last_name as provider_last_name
      FROM support_tickets st
      JOIN patients p ON st.patient_id = p.id
      JOIN users u1 ON p.id = u1.id
      LEFT JOIN providers pr ON st.provider_id = pr.id
      LEFT JOIN users u2 ON pr.id = u2.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.patient_id) {
      query += ` AND st.patient_id = $${paramCount}`;
      values.push(filters.patient_id);
      paramCount++;
    }

    if (filters.provider_id) {
      query += ` AND st.provider_id = $${paramCount}`;
      values.push(filters.provider_id);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND st.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.from_date) {
      query += ` AND DATE(st.created_at) >= $${paramCount}`;
      values.push(filters.from_date);
      paramCount++;
    }

    if (filters.to_date) {
      query += ` AND DATE(st.created_at) <= $${paramCount}`;
      values.push(filters.to_date);
      paramCount++;
    }

    query += ' ORDER BY st.created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT 
        st.*,
        TO_CHAR(st.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
        TO_CHAR(st.updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at,
        u1.first_name as patient_first_name, 
        u1.last_name as patient_last_name,
        u1.email as patient_email,
        u1.mobile_number as patient_phone,
        u2.first_name as provider_first_name,
        u2.last_name as provider_last_name
      FROM support_tickets st
      JOIN patients p ON st.patient_id = p.id
      JOIN users u1 ON p.id = u1.id
      LEFT JOIN providers pr ON st.provider_id = pr.id
      LEFT JOIN users u2 ON pr.id = u2.id
      WHERE st.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, ticketData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['patient_id', 'provider_id', 'subject', 'description', 'status'];
    
    allowedFields.forEach(key => {
      if (ticketData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(ticketData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return null;
    }

    values.push(id);
    const query = `
      UPDATE support_tickets 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM support_tickets WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = SupportTicketModel;
