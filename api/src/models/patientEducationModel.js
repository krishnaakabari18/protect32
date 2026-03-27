const pool = require('../config/database');

class PatientEducationModel {
  static async create(data) {
      const { title, category, content, summary, tags, author_id, status, feature_image } = data;

      // Normalize tags to a JS array for pg driver (handles text[] column)
      let tagsArray = null;
      if (tags) {
        tagsArray = Array.isArray(tags) ? tags : JSON.parse(tags);
      }

      const query = `
        INSERT INTO patient_education_content (title, category, content, summary, tags, author_id, status, feature_image)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const values = [
        title,
        category,
        content,
        summary || null,
        tagsArray,
        author_id || null,
        status || 'Active',
        feature_image || null
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    }

  static async findAll(filters = {}) {
      let query = `
        SELECT e.*, 
          u.first_name as author_first_name, 
          u.last_name as author_last_name
        FROM patient_education_content e
        LEFT JOIN users u ON e.author_id = u.id
        WHERE 1=1
      `;
      const values = [];
      let paramCount = 1;

      if (filters.category) {
        query += ` AND e.category = $${paramCount}`;
        values.push(filters.category);
        paramCount++;
      }

      if (filters.status) {
        query += ` AND e.status = $${paramCount}`;
        values.push(filters.status);
        paramCount++;
      }

      if (filters.search) {
        query += ` AND (e.title ILIKE $${paramCount} OR e.content ILIKE $${paramCount} OR e.summary ILIKE $${paramCount})`;
        values.push(`%${filters.search}%`);
        paramCount++;
      }

      query += ' ORDER BY e.created_at DESC';
      const result = await pool.query(query, values);
      return result.rows;
    }

  static async findById(id) {
    const query = `
      SELECT e.*, 
        u.first_name as author_first_name, 
        u.last_name as author_last_name
      FROM patient_education_content e
      LEFT JOIN users u ON e.author_id = u.id
      WHERE e.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, data) {
      const { title, category, content, summary, tags, status, feature_image } = data;

      // Normalize tags to a JS array for pg driver (handles text[] column)
      let tagsArray = null;
      if (tags) {
        tagsArray = Array.isArray(tags) ? tags : JSON.parse(tags);
      }

      const query = `
        UPDATE patient_education_content 
        SET title = $1, category = $2, content = $3, summary = $4, tags = $5, status = $6, feature_image = $7
        WHERE id = $8
        RETURNING *
      `;

      const values = [
        title,
        category,
        content,
        summary || null,
        tagsArray,
        status || 'Active',
        feature_image || null,
        id
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    }

  static async updateStatus(id, status) {
    const query = `
      UPDATE patient_education_content 
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM patient_education_content WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async incrementViewCount(id) {
    const query = `
      UPDATE patient_education_content 
      SET view_count = view_count + 1
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getCategories() {
    const query = 'SELECT DISTINCT category FROM patient_education_content ORDER BY category';
    const result = await pool.query(query);
    return result.rows.map(row => row.category);
  }

  static async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as total_content,
        COUNT(*) FILTER (WHERE status = 'Active') as active_content,
        COUNT(*) FILTER (WHERE status = 'Inactive') as inactive_content,
        SUM(view_count) as total_views,
        COUNT(DISTINCT category) as total_categories
      FROM patient_education_content
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = PatientEducationModel;
