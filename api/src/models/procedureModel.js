const pool = require('../config/database');

class ProcedureModel {
  static async create(data) {
    const { name, category, description, is_active, display_order } = data;
    
    const query = `
      INSERT INTO procedures (name, category, description, is_active, display_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [name, category, description || null, is_active !== undefined ? is_active : true, display_order || 0];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT * FROM procedures
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.category) {
      query += ` AND category = $${paramCount}`;
      values.push(filters.category);
      paramCount++;
    }

    if (filters.is_active !== undefined) {
      query += ` AND is_active = $${paramCount}`;
      values.push(filters.is_active);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND name ILIKE $${paramCount}`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ' ORDER BY category, display_order, name';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM procedures WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByCategory() {
    const query = `
      SELECT 
        category,
        json_agg(
          json_build_object(
            'id', id,
            'name', name,
            'description', description,
            'display_order', display_order
          ) ORDER BY display_order, name
        ) as procedures
      FROM procedures
      WHERE is_active = true
      GROUP BY category
      ORDER BY category
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getCategories() {
    const query = `
      SELECT DISTINCT category, COUNT(*) as count
      FROM procedures
      WHERE is_active = true
      GROUP BY category
      ORDER BY category
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['name', 'category', 'description', 'is_active', 'display_order'];

    allowedFields.forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(data[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    values.push(id);
    const query = `
      UPDATE procedures 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM procedures WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = ProcedureModel;