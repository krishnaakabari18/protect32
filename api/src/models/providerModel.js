const pool = require('../config/database');

class ProviderModel {
  static async create(providerData) {
    const { 
      id, 
      specialty, 
      experience_years, 
      clinic_name, 
      contact_number, 
      location, 
      coordinates, 
      about, 
      clinic_photos, 
      clinic_video_url, 
      availability 
    } = providerData;
    
    const query = `
      INSERT INTO providers (
        id, specialty, experience_years, clinic_name, contact_number, 
        location, coordinates, about, clinic_photos, clinic_video_url, availability
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      id, 
      specialty, 
      experience_years || 0, 
      clinic_name, 
      contact_number, 
      location, 
      coordinates, 
      about, 
      clinic_photos || [], 
      clinic_video_url, 
      availability
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
        u.email, 
        u.profile_picture 
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
        u.email, 
        u.profile_picture 
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

    // Only update fields that are provided
    const allowedFields = [
      'specialty', 
      'experience_years', 
      'clinic_name', 
      'contact_number', 
      'location', 
      'coordinates', 
      'about', 
      'clinic_photos', 
      'clinic_video_url', 
      'availability'
    ];

    allowedFields.forEach(key => {
      if (providerData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(providerData[key]);
        paramCount++;
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
