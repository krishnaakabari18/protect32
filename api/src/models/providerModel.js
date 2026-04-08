const pool = require('../config/database');

class ProviderModel {
  static async create(providerData) {
    const {
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
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41)
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
        u.first_name, u.last_name,
        u.email as user_email,
        u.profile_picture as user_profile_picture,
        COALESCE(
          (SELECT json_agg(
            json_build_object('procedure_id', pp.procedure_id::text, 'price', pp.price)
            ORDER BY pp.procedure_id
          ) FROM provider_procedures pp WHERE pp.provider_id = p.id),
          '[]'::json
        ) as procedure_fees,
        COALESCE(
          (SELECT json_agg(pp.procedure_id::text)
           FROM provider_procedures pp WHERE pp.provider_id = p.id),
          '[]'::json
        ) as procedure_ids,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', pr.id,
              'patient_id', pr.patient_id,
              'rating', pr.rating,
              'comment', pr.comment,
              'created_at', pr.created_at
            ) ORDER BY pr.created_at DESC
          )
          FROM provider_reviews pr WHERE pr.provider_id = p.id),
          '[]'::json
        ) as reviews,
        (SELECT COUNT(*) FROM provider_reviews pr WHERE pr.provider_id = p.id) as total_reviews,
        (SELECT COALESCE(ROUND(AVG(pr.rating)::numeric, 1), 0) FROM provider_reviews pr WHERE pr.provider_id = p.id) as average_rating
      FROM providers p
      LEFT JOIN users u ON p.id = u.id
      WHERE 1=1
    `;
    const values = [];
    let idx = 1;

    // keyword — search by name, clinic, specialty
    if (filters.keyword) {
      query += ` AND (
        u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx}
        OR p.full_name ILIKE $${idx} OR p.clinic_name ILIKE $${idx}
        OR p.specialty ILIKE $${idx}
      )`;
      values.push('%' + filters.keyword + '%');
      idx++;
    }

    if (filters.specialty) {
      query += ` AND p.specialty ILIKE $${idx++}`;
      values.push('%' + filters.specialty + '%');
    }
    if (filters.location) {
      query += ` AND p.location ILIKE $${idx++}`;
      values.push('%' + filters.location + '%');
    }
    if (filters.pincode) {
      query += ` AND p.pincode = $${idx++}`;
      values.push(filters.pincode);
    }
    if (filters.search) {
      query += ` AND (u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx} OR p.full_name ILIKE $${idx} OR p.clinic_name ILIKE $${idx} OR p.specialty ILIKE $${idx})`;
      values.push('%' + filters.search + '%');
      idx++;
    }

    // min_experience
    if (filters.min_experience) {
      query += ` AND COALESCE(p.years_of_experience, p.experience_years, 0) >= $${idx++}`;
      values.push(parseInt(filters.min_experience));
    }

    // min_rating — filter by average rating
    if (filters.min_rating) {
      query += ` AND (
        SELECT COALESCE(ROUND(AVG(pr.rating)::numeric,1),0)
        FROM provider_reviews pr WHERE pr.provider_id = p.id
      ) >= $${idx++}`;
      values.push(parseFloat(filters.min_rating));
    }

    // daytime — filter by session availability (morning/afternoon/evening)
    if (filters.daytime) {
      const session = filters.daytime.toLowerCase(); // morning | afternoon | evening
      query += ` AND p.time_slots::text ILIKE $${idx++}`;
      values.push('%"' + session + '"%enabled":true%');
    }

    // procedure_id — filter providers who have this procedure assigned
    if (filters.procedure_id) {
      query += ` AND EXISTS (
        SELECT 1 FROM provider_procedures pp
        WHERE pp.provider_id = p.id AND pp.procedure_id = $${idx++}
      )`;
      values.push(filters.procedure_id);
    }

    query += ' ORDER BY p.created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT
        p.*,
        u.first_name, u.last_name,
        u.email as user_email,
        u.profile_picture as user_profile_picture,
        COALESCE(
          (SELECT json_agg(
            json_build_object('procedure_id', pp.procedure_id::text, 'price', pp.price)
            ORDER BY pp.procedure_id
          ) FROM provider_procedures pp WHERE pp.provider_id = p.id),
          '[]'::json
        ) as procedure_fees,
        COALESCE(
          (SELECT json_agg(pp.procedure_id::text)
           FROM provider_procedures pp WHERE pp.provider_id = p.id),
          '[]'::json
        ) as procedure_ids,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', pr.id,
              'patient_id', pr.patient_id,
              'rating', pr.rating,
              'comment', pr.comment,
              'created_at', pr.created_at
            ) ORDER BY pr.created_at DESC
          )
          FROM provider_reviews pr WHERE pr.provider_id = p.id),
          '[]'::json
        ) as reviews,
        (SELECT COUNT(*) FROM provider_reviews pr WHERE pr.provider_id = p.id) as total_reviews,
        (SELECT COALESCE(ROUND(AVG(pr.rating)::numeric, 1), 0) FROM provider_reviews pr WHERE pr.provider_id = p.id) as average_rating
       FROM providers p
       LEFT JOIN users u ON p.id = u.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async syncProcedures(providerId, procedureFees = []) {
    await pool.query('DELETE FROM provider_procedures WHERE provider_id = $1', [providerId]);
    if (!procedureFees || procedureFees.length === 0) return;
    // Add price column if not exists (safe migration)
    await pool.query(`
      ALTER TABLE provider_procedures ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT NULL
    `).catch(() => {});
    for (const item of procedureFees) {
      const procedureId = typeof item === 'string' ? item : item.procedure_id;
      const price = typeof item === 'object' ? (item.price || null) : null;
      await pool.query(
        'INSERT INTO provider_procedures (provider_id, procedure_id, price) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [providerId, procedureId, price]
      );
    }
  }

  static async update(id, providerData) {
    const fields = [];
    const values = [];
    let p = 1;

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
        if (['time_slots', 'specialists_availability', 'clinics', 'coordinates'].includes(key) && providerData[key]) {
          fields.push(key + ' = $' + p++);
          values.push(JSON.stringify(providerData[key]));
        } else {
          fields.push(key + ' = $' + p++);
          values.push(providerData[key]);
        }
      }
    });

    if (fields.length === 0) throw new Error('No fields to update');

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await pool.query(
      'UPDATE providers SET ' + fields.join(', ') + ' WHERE id = $' + p + ' RETURNING *',
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM providers WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = ProviderModel;
