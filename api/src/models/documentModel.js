const pool = require('../config/database');

class DocumentModel {
  static async create(data) {
    const { patient_id, provider_id, name, document_type, files, notes, uploaded_by } = data;
    
    // For backward compatibility, set file_url to first file's path
    const fileUrl = files && files.length > 0 ? files[0].path : 'placeholder.pdf';
    const mimeType = files && files.length > 0 ? files[0].mimetype : 'application/pdf';
    const fileSize = files && files.length > 0 ? files[0].size : 0;
    
    const query = `
      INSERT INTO documents (patient_id, provider_id, name, document_type, files, notes, uploaded_by, file_url, mime_type, file_size)
      VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      patient_id || null,
      provider_id || null,
      name,
      document_type,
      JSON.stringify(files || []),
      notes || null,
      uploaded_by || null,
      fileUrl,
      mimeType,
      fileSize
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT d.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name,
        u.first_name as provider_first_name, u.last_name as provider_last_name,
        uploader.first_name as uploaded_by_first_name, uploader.last_name as uploaded_by_last_name
      FROM documents d
      LEFT JOIN patients pat ON d.patient_id = pat.id
      LEFT JOIN users p ON pat.id = p.id
      LEFT JOIN providers prov ON d.provider_id = prov.id
      LEFT JOIN users u ON prov.id = u.id
      LEFT JOIN users uploader ON d.uploaded_by = uploader.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.patient_id) {
      query += ` AND d.patient_id = $${paramCount}`;
      values.push(filters.patient_id);
      paramCount++;
    }

    if (filters.provider_id) {
      query += ` AND d.provider_id = $${paramCount}`;
      values.push(filters.provider_id);
      paramCount++;
    }

    if (filters.document_type) {
      query += ` AND d.document_type = $${paramCount}`;
      values.push(filters.document_type);
      paramCount++;
    }

    query += ' ORDER BY d.upload_date DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT d.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name,
        u.first_name as provider_first_name, u.last_name as provider_last_name,
        uploader.first_name as uploaded_by_first_name, uploader.last_name as uploaded_by_last_name
      FROM documents d
      LEFT JOIN patients pat ON d.patient_id = pat.id
      LEFT JOIN users p ON pat.id = p.id
      LEFT JOIN providers prov ON d.provider_id = prov.id
      LEFT JOIN users u ON prov.id = u.id
      LEFT JOIN users uploader ON d.uploaded_by = uploader.id
      WHERE d.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, data) {
    const { patient_id, provider_id, name, document_type, files, notes } = data;
    
    // For backward compatibility, set file_url to first file's path
    const fileUrl = files && files.length > 0 ? files[0].path : 'placeholder.pdf';
    const mimeType = files && files.length > 0 ? files[0].mimetype : 'application/pdf';
    const fileSize = files && files.length > 0 ? files[0].size : 0;
    
    const query = `
      UPDATE documents 
      SET patient_id = $1, provider_id = $2, name = $3, document_type = $4, files = $5::jsonb, notes = $6,
          file_url = $7, mime_type = $8, file_size = $9
      WHERE id = $10
      RETURNING *
    `;
    
    const values = [
      patient_id || null,
      provider_id || null,
      name,
      document_type,
      JSON.stringify(files || []),
      notes || null,
      fileUrl,
      mimeType,
      fileSize,
      id
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM documents WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getFilesByDocumentId(id) {
    const query = 'SELECT files FROM documents WHERE id = $1';
    const result = await pool.query(query, [id]);
    if (result.rows[0] && result.rows[0].files) {
      return result.rows[0].files;
    }
    return [];
  }
}

module.exports = DocumentModel;
