const pool = require('../config/database');

class ProviderModel {
  static async create(providerData) {
    const { 
      id, specialty, experience_years, clinic_name, contact_number, 
      location, coordinates, about, clinic_photos, clinic_video_url, 
      availability, time_slots,
      // New fields
      dental_chairs, iopa_xray_type, has_opg, has_ultrasonic_cleaner,
      intraoral_camera_type, rct_equipment, autoclave_type,
      sterilization_protocol, disinfection_protocol,
      specialists_availability,
      bank_name, bank_branch_name, bank_account_name, bank_account_number,
      bank_account_type, bank_micr_no, bank_ifsc_code,
      number_of_clinics, clinics,
      full_name, date_of_birth, pincode, mobile_number, whatsapp_number,
      email, years_of_experience, state_dental_council_reg_number,
      state_dental_council_reg_photo, profile_photo
    } = providerData;
    
    const query = `
      INSERT INTO providers (
        id, specialty, experience_years, clinic_name, contact_number, 
        location, coordinates, about, clinic_photos, clinic_video_url, 
        availability, time_slots,
        dental_chairs, iopa_xray_type, has_opg, has_ultrasonic_cleaner,
        intraoral_camera_type, rct_equipment, autoclave_type,
        sterilization_protocol, disinfection_protocol,
        specialists_availability,
        bank_name, bank_branch_name, bank_account_name, bank_account_number,
        bank_account_type, bank_micr_no, bank_ifsc_code,
        number_of_clinics, clinics,
        full_name, date_of_birth, pincode, mobile_number, whatsapp_number,
        email, years_of_experience, state_dental_council_reg_number,
        state_dental_council_reg_photo, profile_photo
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41)
      RETURNING *
    `;
    
    const values = [
      id, specialty, experience_years || 0, clinic_name, contact_number, 
      location, coordinates, about, clinic_photos || [], clinic_video_url, 
      availability, time_slots ? JSON.stringify(time_slots) : null,
      dental_chairs || 2, iopa_xray_type || 'Digital', has_opg || false, has_ultrasonic_cleaner || true,
      intraoral_camera_type || 'USB Model', rct_equipment || 'Endomotor', autoclave_type || 'Pressure cooker type',
      sterilization_protocol || 'Autoclave', disinfection_protocol || 'Chemical based',
      specialists_availability ? JSON.stringify(specialists_availability) : '[]',
      bank_name, bank_branch_name, bank_account_name, bank_account_number,
      bank_account_type, bank_micr_no, bank_ifsc_code,
      number_of_clinics || 1, clinics ? JSON.stringify(clinics) : '[]',
      full_name, date_of_birth, pincode, mobile_number, whatsapp_number,
      email, years_of_experience, state_dental_council_reg_number,
      state_dental_council_reg_photo, profile_photo
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT 
        p.*, 
        u.first_name, 
        u.last_name, 
        u.email as user_email, 
        u.profile_picture as user_profile_picture 
      FROM providers p 
      LEFT JOIN users u ON p.id = u.id 
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.specialty) {
      query += ` AND p.specialty ILIKE $${paramCount}`;
      values.push(`%${filters.specialty}%`);
      paramCount++;
    }

    if (filters.location) {
      query += ` AND p.location ILIKE $${paramCount}`;
      values.push(`%${filters.location}%`);
      paramCount++;
    }

    if (filters.pincode) {
      query += ` AND p.pincode = $${paramCount}`;
      values.push(filters.pincode);
      paramCount++;
    }

    query += ' ORDER BY p.rating DESC, p.created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT 
        p.*, 
        u.first_name, 
        u.last_name, 
        u.email as user_email, 
        u.profile_picture as user_profile_picture 
      FROM providers p 
      LEFT JOIN users u ON p.id = u.id 
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, providerData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // All updatable fields
    const allowedFields = [
      'specialty', 'experience_years', 'clinic_name', 'contact_number', 
      'location', 'coordinates', 'about', 'clinic_photos', 'clinic_video_url', 
      'availability', 'time_slots',
      'dental_chairs', 'iopa_xray_type', 'has_opg', 'has_ultrasonic_cleaner',
      'intraoral_camera_type', 'rct_equipment', 'autoclave_type',
      'sterilization_protocol', 'disinfection_protocol',
      'specialists_availability',
      'bank_name', 'bank_branch_name', 'bank_account_name', 'bank_account_number',
      'bank_account_type', 'bank_micr_no', 'bank_ifsc_code',
      'number_of_clinics', 'clinics',
      'full_name', 'date_of_birth', 'pincode', 'mobile_number', 'whatsapp_number',
      'email', 'years_of_experience', 'state_dental_council_reg_number',
      'state_dental_council_reg_photo', 'profile_photo'
    ];

    allowedFields.forEach(key => {
      if (providerData[key] !== undefined) {
        // Handle JSON fields
        if (['time_slots', 'specialists_availability', 'clinics', 'coordinates'].includes(key) && providerData[key]) {
          fields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(providerData[key]));
          paramCount++;
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(providerData[key]);
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
    const query = `
      UPDATE providers 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM providers WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = ProviderModel;