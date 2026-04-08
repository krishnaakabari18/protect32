const pool = require('../config/database');

class DocumentModel {
  static async create(data) {
    const { patient_id, provider_id, uploaded_by, upload_date } = data;
    const result = await pool.query(
      'INSERT INTO documents (patient_id, provider_id, uploaded_by, upload_date, name, document_type, file_url, mime_type, file_size, files) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [patient_id || null, provider_id || null, uploaded_by || null, upload_date || new Date(), '', '', '', '', 0, '[]']
    );
    return result.rows[0];
  }

  static async createItem(documentId, item) {
    const { name, document_type, upload_date, file_path, file_originalname, file_mimetype, file_size } = item;
    const result = await pool.query(
      'INSERT INTO document_items (document_id, name, document_type, upload_date, file_path, file_originalname, file_mimetype, file_size) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [documentId, name, document_type, upload_date || null, file_path || null, file_originalname || null, file_mimetype || null, file_size || 0]
    );
    return result.rows[0];
  }

  static async replaceItems(documentId, items) {
    await pool.query('DELETE FROM document_items WHERE document_id = $1', [documentId]);
    const results = [];
    for (const item of items) {
      results.push(await DocumentModel.createItem(documentId, item));
    }
    return results;
  }

  static async findAll(filters = {}) {
      let query =
        'SELECT d.id, d.patient_id, d.provider_id, d.upload_date,' +
        ' p.first_name as patient_first_name, p.last_name as patient_last_name,' +
        ' (SELECT string_agg(di.name, \', \' ORDER BY di.created_at) FROM document_items di WHERE di.document_id = d.id) AS document_names,' +
        ' (SELECT string_agg(DISTINCT di.document_type, \', \' ORDER BY di.document_type) FROM document_items di WHERE di.document_id = d.id) AS document_types,' +
        ' (SELECT COUNT(*) FROM document_items di WHERE di.document_id = d.id) AS items_count' +
        ' FROM documents d' +
        ' LEFT JOIN patients pat ON d.patient_id = pat.id' +
        ' LEFT JOIN users p ON pat.id = p.id' +
        ' WHERE 1=1';

      const values = [];
      let idx = 1;

      if (filters.patient_id) {
        query += ` AND d.patient_id = $${idx}`;
        values.push(filters.patient_id);
        idx++;
      }
      if (filters.document_type) {
        query += ` AND EXISTS (SELECT 1 FROM document_items di WHERE di.document_id = d.id AND di.document_type = $${idx})`;
        values.push(filters.document_type);
        idx++;
      }
      if (filters.search) {
        query += ` AND (
          p.first_name ILIKE $${idx} OR
          p.last_name ILIKE $${idx} OR
          CONCAT(p.first_name, ' ', p.last_name) ILIKE $${idx} OR
          EXISTS (SELECT 1 FROM document_items di WHERE di.document_id = d.id AND (di.name ILIKE $${idx} OR di.document_type ILIKE $${idx}))
        )`;
        values.push(`%${filters.search}%`);
        idx++;
      }

      // Count for pagination
      const countResult = await pool.query(`SELECT COUNT(*) FROM (${query}) AS sub`, values);
      const total = parseInt(countResult.rows[0].count);

      const page  = parseInt(filters.page)  || 1;
      const limit = parseInt(filters.limit) || 10;
      const offset = (page - 1) * limit;

      query += ` ORDER BY d.upload_date DESC LIMIT $${idx} OFFSET $${idx + 1}`;
      values.push(limit, offset);

      const result = await pool.query(query, values);
      return { rows: result.rows, total };
    }

  static async findById(id) {
    const doc = await pool.query(
      'SELECT d.*, p.first_name as patient_first_name, p.last_name as patient_last_name' +
      ' FROM documents d' +
      ' LEFT JOIN patients pat ON d.patient_id = pat.id' +
      ' LEFT JOIN users p ON pat.id = p.id' +
      ' WHERE d.id = $1',
      [id]
    );
    if (!doc.rows[0]) return null;
    const items = await pool.query('SELECT * FROM document_items WHERE document_id = $1 ORDER BY created_at ASC', [id]);
    return { ...doc.rows[0], items: items.rows };
  }

  static async update(id, data) {
    const { patient_id, upload_date } = data;
    const result = await pool.query(
      'UPDATE documents SET patient_id=$1, upload_date=$2 WHERE id=$3 RETURNING *',
      [patient_id || null, upload_date || new Date(), id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM documents WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async getItemsByDocumentId(id) {
    const result = await pool.query('SELECT * FROM document_items WHERE document_id = $1 ORDER BY created_at ASC', [id]);
    return result.rows;
  }
}

module.exports = DocumentModel;
