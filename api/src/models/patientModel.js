const pool = require('../config/database');

class PatientModel {
  static async create(patientData) {
    const { id, emergency_contact_name, emergency_contact_number, insurance_provider, insurance_policy_number } = patientData;
    const query = `
      INSERT INTO patients (id, emergency_contact_name, emergency_contact_number, insurance_provider, insurance_policy_number)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [id, emergency_contact_name, emergency_contact_number, insurance_provider, insurance_policy_number];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT p.*, u.first_name, u.last_name, u.email, u.mobile_number, u.profile_picture, u.date_of_birth, u.address
      FROM patients p
      JOIN users u ON p.id = u.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll() {
    const query = `
      SELECT p.*, u.first_name, u.last_name, u.email, u.mobile_number
      FROM patients p
      JOIN users u ON p.id = u.id
      ORDER BY u.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async update(id, patientData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(patientData).forEach(key => {
      if (patientData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(patientData[key]);
        paramCount++;
      }
    });

    values.push(id);
    const query = `UPDATE patients SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Family Members
  static async addFamilyMember(patientId, memberData) {
    const { first_name, last_name, relationship, mobile_number, date_of_birth } = memberData;
    const query = `
      INSERT INTO family_members (patient_id, first_name, last_name, relationship, mobile_number, date_of_birth)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [patientId, first_name, last_name, relationship, mobile_number, date_of_birth]);
    return result.rows[0];
  }

  static async getFamilyMembers(patientId) {
    const query = 'SELECT * FROM family_members WHERE patient_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [patientId]);
    return result.rows;
  }
}

module.exports = PatientModel;
