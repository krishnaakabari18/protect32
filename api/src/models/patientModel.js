const pool = require('../config/database');

// Helper function to safely parse integers
const safeParseInt = (value, defaultValue = null) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Helper function to safely parse decimals
const safeParseFloat = (value, defaultValue = null) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

class PatientModel {
  static async create(patientData) {
    const {
      id, 
      // Basic patient info
      emergency_contact_name, emergency_contact_number, insurance_provider, insurance_policy_number,
      // Enhanced profile fields
      profile_photo, gender, blood_group, height_cm, weight_kg, occupation, marital_status,
      nationality, preferred_language, religion,
      // Medical information
      medical_history, current_medications, allergies, chronic_conditions, 
      previous_surgeries, family_medical_history,
      // Dental information
      dental_history, dental_concerns, previous_dental_treatments, 
      dental_anxiety_level, preferred_appointment_time, special_needs,
      // Contact information
      secondary_phone, work_phone, preferred_contact_method,
      // Address
      address_line_1, address_line_2, city, state, postal_code, country,
      // Insurance
      insurance_type, insurance_expiry_date, insurance_coverage_amount,
      // Preferences (JSON fields)
      communication_preferences, appointment_preferences, privacy_settings
    } = patientData;

    const query = `
      INSERT INTO patients (
        id, emergency_contact_name, emergency_contact_number, insurance_provider, insurance_policy_number,
        profile_photo, gender, blood_group, height_cm, weight_kg, occupation, marital_status,
        nationality, preferred_language, religion,
        medical_history, current_medications, allergies, chronic_conditions, 
        previous_surgeries, family_medical_history,
        dental_history, dental_concerns, previous_dental_treatments, 
        dental_anxiety_level, preferred_appointment_time, special_needs,
        secondary_phone, work_phone, preferred_contact_method,
        address_line_1, address_line_2, city, state, postal_code, country,
        insurance_type, insurance_expiry_date, insurance_coverage_amount,
        communication_preferences, appointment_preferences, privacy_settings
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42)
      RETURNING *
    `;
    
    const values = [
      id, emergency_contact_name, emergency_contact_number, insurance_provider, insurance_policy_number,
      profile_photo, gender, blood_group, safeParseInt(height_cm), safeParseFloat(weight_kg), 
      occupation, marital_status, nationality, preferred_language, religion,
      medical_history, current_medications, allergies, chronic_conditions, 
      previous_surgeries, family_medical_history,
      dental_history, dental_concerns, previous_dental_treatments, 
      safeParseInt(dental_anxiety_level), preferred_appointment_time, special_needs,
      secondary_phone, work_phone, preferred_contact_method,
      address_line_1, address_line_2, city, state, postal_code, country || 'India',
      insurance_type, insurance_expiry_date, safeParseFloat(insurance_coverage_amount),
      communication_preferences, appointment_preferences, privacy_settings
    ];
    
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

  static async findAll(filters = {}) {
    let query = `
      SELECT p.*, u.first_name, u.last_name, u.email, u.mobile_number, u.profile_picture, u.date_of_birth
      FROM patients p
      JOIN users u ON p.id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    // Add search filters
    if (filters.search) {
      query += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR u.mobile_number ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    if (filters.gender) {
      query += ` AND p.gender = $${paramCount}`;
      values.push(filters.gender);
      paramCount++;
    }

    if (filters.blood_group) {
      query += ` AND p.blood_group = $${paramCount}`;
      values.push(filters.blood_group);
      paramCount++;
    }

    if (filters.city) {
      query += ` AND p.city ILIKE $${paramCount}`;
      values.push(`%${filters.city}%`);
      paramCount++;
    }

    if (filters.state) {
      query += ` AND p.state ILIKE $${paramCount}`;
      values.push(`%${filters.state}%`);
      paramCount++;
    }

    query += ' ORDER BY u.created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async update(id, patientData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // All updatable fields
    const allowedFields = [
      'emergency_contact_name', 'emergency_contact_number', 'insurance_provider', 'insurance_policy_number',
      'profile_photo', 'gender', 'blood_group', 'height_cm', 'weight_kg', 'occupation', 'marital_status',
      'nationality', 'preferred_language', 'religion',
      'medical_history', 'current_medications', 'allergies', 'chronic_conditions', 
      'previous_surgeries', 'family_medical_history',
      'dental_history', 'dental_concerns', 'previous_dental_treatments', 
      'dental_anxiety_level', 'preferred_appointment_time', 'special_needs',
      'secondary_phone', 'work_phone', 'preferred_contact_method',
      'address_line_1', 'address_line_2', 'city', 'state', 'postal_code', 'country',
      'insurance_type', 'insurance_expiry_date', 'insurance_coverage_amount',
      'communication_preferences', 'appointment_preferences', 'privacy_settings'
    ];

    allowedFields.forEach(key => {
      if (patientData[key] !== undefined) {
        // Handle numeric fields
        if (['height_cm', 'dental_anxiety_level'].includes(key)) {
          fields.push(`${key} = $${paramCount}`);
          values.push(safeParseInt(patientData[key]));
          paramCount++;
        } else if (['weight_kg', 'insurance_coverage_amount'].includes(key)) {
          fields.push(`${key} = $${paramCount}`);
          values.push(safeParseFloat(patientData[key]));
          paramCount++;
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(patientData[key]);
          paramCount++;
        }
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // Add updated_at
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    values.push(id);
    const query = `UPDATE patients SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM patients WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Family Members with enhanced fields
  static async addFamilyMember(patientId, memberData) {
    const {
      first_name, last_name, relationship, mobile_number, date_of_birth,
      profile_photo, gender, blood_group, height_cm, weight_kg, occupation, email, secondary_phone,
      medical_history, current_medications, allergies, chronic_conditions, previous_surgeries,
      dental_history, dental_concerns, previous_dental_treatments, dental_anxiety_level, special_needs,
      insurance_provider, insurance_policy_number, insurance_type, insurance_expiry_date,
      is_primary_contact, emergency_contact, notes
    } = memberData;

    const query = `
      INSERT INTO family_members (
        patient_id, first_name, last_name, relationship, mobile_number, date_of_birth,
        profile_photo, gender, blood_group, height_cm, weight_kg, occupation, email, secondary_phone,
        medical_history, current_medications, allergies, chronic_conditions, previous_surgeries,
        dental_history, dental_concerns, previous_dental_treatments, dental_anxiety_level, special_needs,
        insurance_provider, insurance_policy_number, insurance_type, insurance_expiry_date,
        is_primary_contact, emergency_contact, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31)
      RETURNING *
    `;
    
    const values = [
      patientId, first_name, last_name, relationship, mobile_number, date_of_birth,
      profile_photo, gender, blood_group, safeParseInt(height_cm), safeParseFloat(weight_kg), 
      occupation, email, secondary_phone,
      medical_history, current_medications, allergies, chronic_conditions, previous_surgeries,
      dental_history, dental_concerns, previous_dental_treatments, safeParseInt(dental_anxiety_level), special_needs,
      insurance_provider, insurance_policy_number, insurance_type, insurance_expiry_date,
      is_primary_contact || false, emergency_contact || false, notes
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getFamilyMembers(patientId) {
    const query = 'SELECT * FROM family_members WHERE patient_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [patientId]);
    return result.rows;
  }

  static async updateFamilyMember(memberId, memberData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'first_name', 'last_name', 'relationship', 'mobile_number', 'date_of_birth',
      'profile_photo', 'gender', 'blood_group', 'height_cm', 'weight_kg', 'occupation', 'email', 'secondary_phone',
      'medical_history', 'current_medications', 'allergies', 'chronic_conditions', 'previous_surgeries',
      'dental_history', 'dental_concerns', 'previous_dental_treatments', 'dental_anxiety_level', 'special_needs',
      'insurance_provider', 'insurance_policy_number', 'insurance_type', 'insurance_expiry_date',
      'is_primary_contact', 'emergency_contact', 'notes'
    ];

    allowedFields.forEach(key => {
      if (memberData[key] !== undefined) {
        if (['height_cm', 'dental_anxiety_level'].includes(key)) {
          fields.push(`${key} = $${paramCount}`);
          values.push(safeParseInt(memberData[key]));
          paramCount++;
        } else if (['weight_kg'].includes(key)) {
          fields.push(`${key} = $${paramCount}`);
          values.push(safeParseFloat(memberData[key]));
          paramCount++;
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(memberData[key]);
          paramCount++;
        }
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(memberId);
    
    const query = `UPDATE family_members SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async deleteFamilyMember(memberId) {
    const query = 'DELETE FROM family_members WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [memberId]);
    return result.rows[0];
  }

  static async getFamilyMemberById(memberId) {
    const query = 'SELECT * FROM family_members WHERE id = $1';
    const result = await pool.query(query, [memberId]);
    return result.rows[0];
  }

  // Medical Records
  static async addMedicalRecord(recordData) {
    const {
      patient_id, family_member_id, record_type, title, description, record_date,
      provider_id, file_path, file_type, file_size, tags, is_sensitive
    } = recordData;

    const query = `
      INSERT INTO patient_medical_records (
        patient_id, family_member_id, record_type, title, description, record_date,
        provider_id, file_path, file_type, file_size, tags, is_sensitive
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    
    const values = [
      patient_id, family_member_id, record_type, title, description, record_date,
      provider_id, file_path, file_type, safeParseInt(file_size), tags, is_sensitive || false
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getMedicalRecords(patientId, familyMemberId = null) {
    let query = `
      SELECT pmr.*, p.first_name as provider_first_name, p.last_name as provider_last_name
      FROM patient_medical_records pmr
      LEFT JOIN providers pr ON pmr.provider_id = pr.id
      LEFT JOIN users p ON pr.id = p.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (familyMemberId) {
      query += ` AND pmr.family_member_id = $${paramCount}`;
      values.push(familyMemberId);
      paramCount++;
    } else {
      query += ` AND pmr.patient_id = $${paramCount}`;
      values.push(patientId);
      paramCount++;
    }

    query += ' ORDER BY pmr.record_date DESC, pmr.created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }
}

module.exports = PatientModel;