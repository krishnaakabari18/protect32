const pool = require('../config/database');

class DocumentModel {
  // Create parent document record
  static async create(data) {
    const { patient_id, provider_id, uploaded_by, upload_date } = data;
    const result = await pool.query(
      `INSERT INTO documents (patient_id, provider_id, uploaded_by, upload_date, name, document_type, file_url, mime_type, file_size, files)
       VALUES ($1,$2,$3,$4,'','','','',$5,'[]'::jsonb) RETURNING *`,
      [patient_id || null, provider_id || null, uploaded_by || null, upload_date || new Date(), 0]
    );
    return result.rows[0];
  }

  // Insert one document_item child row
  static async createItem(documentId, item) {
    const { name, document_type, upload_date, file_path, file_originalname, file_mimetype, file_size } = item;
    const result = await pool.query(
      `INSERT INTO document_items (document_id, name, document_type, upload_date, file_path, file_originalname, file_mimetype, file_size)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [documentId, name, document_type, upload_date || null, file_path || null, file_originalname || null, file_mimetype || null, file_size || 0]
    );
    return result.rows[0];
  }

  // Delete all items for a document then re-insert
  static async replaceItems(documentId, items) {
    await pool.query('DELETE FROM document_items WHERE document_id = $1', [documentId]);
    const results = [];
    for (const item of items) {
      const r = await DocumentModel.createItem(documentId, item);
      results.push(r);
    }
    return results;
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT d.id, d.patient_id, d.provider_id, d.upload_date,
        p.first_name as patient_first_name, p.last_name as patient_last_name,
        (SELECT string_agg(di.name, ', ' ORDER BY di.created_at)
         FROM document_items di WHERE di.document_id = d.id) AS document_names,
        (SELECT string_agg(DISTINCT di.document_type, ', ' ORDER BY di.document_type)
         FROM document_items di WHERE di.document_id = d.id) AS document_types,
        (SELECT COUNT(*) FROM document_items di WHERE di.document_id = d.id) AS items_count
      FROM documents d
      LEFT JOIN patients pat ON d.patient_id = pat.id
      LEFT JOIN users p ON pat.id = p.id
      WHERE 1=1
    `;
    const values = [];
    let i = 1;
    if (filters.patient_id) { query += ` AND d.patient_id = $${i++}`; values.push(filters.patient_id); }
    if (filters.document_type) { query += ` AND EXISTS (SELECT 1 FROM document_items di WHERE di.document_id = d.id AND di.document_type = $${i++})`; values.push(filters.document_type); }
    query += ' ORDER BY d.upload_date DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const doc = await pool.query(
      `SELECT d.*, p.first_name as patient_first_name, p.last_name as patient_last_name
       FROM documents d
       LEFT JOIN patients pat ON d.patient_id = pat.id
       LEFT JOIN users p ON pat.id = p.id
       WHERE d.id = $1`, [id]
    );
    if (!doc.rows[0]) return null;
    const items = await pool.query(
      'SELECT * FROM document_items WHERE document_id = $1 ORDER BY created_at ASC', [id]
    );
    return { ...doc.rows[0], items: items.rows };
  }

  static async update(id, data) {
    const { patient_id, upload_date } = data;
    const result = await pool.query(
      `UPDATE documents SET patient_id=$1, upload_date=$2 WHERE id=$3 RETURNING *`,
      [patient_id || null, upload_date || new Date(), id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    // document_items cascade delete via FK
    const result = await pool.query('DELETE FROM documents WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async getItemsByDocumentId(id) {
    const result = await pool.query(
      'SELECT * FROM document_items WHERE document_id = $1 ORDER BY created_at ASC', [id]
    );
    return result.rows;
  }
}

module.exports = DocumentModel;
