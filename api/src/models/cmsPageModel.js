const pool = require('../config/database');

class CmsPageModel {
  static async create(data) {
    const { title, slug, content, meta_title, meta_description, status } = data;
    const query = `
      INSERT INTO cms_pages (title, slug, content, meta_title, meta_description, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [title, slug, content || null, meta_title || null, meta_description || null, status || 'Draft'];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `SELECT * FROM cms_pages WHERE 1=1`;
    const values = [];
    let p = 1;

    if (filters.status) {
      query += ` AND status = $${p++}`;
      values.push(filters.status);
    }

    if (filters.search) {
      query += ` AND (title ILIKE $${p} OR slug ILIKE $${p})`;
      values.push(`%${filters.search}%`);
      p++;
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM cms_pages WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findBySlug(slug) {
    const result = await pool.query('SELECT * FROM cms_pages WHERE slug = $1', [slug]);
    return result.rows[0];
  }

  static async update(id, data) {
    const allowed = ['title', 'slug', 'content', 'meta_title', 'meta_description', 'status'];
    const fields = [];
    const values = [];
    let p = 1;

    allowed.forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${p++}`);
        values.push(data[key]);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE cms_pages SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${p} RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE cms_pages SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM cms_pages WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = CmsPageModel;
