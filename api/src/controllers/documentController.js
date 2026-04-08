const DocumentModel = require('../models/documentModel');
const { deleteFiles, getFileInfo } = require('../utils/documentUpload');

class DocumentController {
  static async create(req, res) {
    try {
      const { patient_id, provider_id } = req.body;
      const uploaded_by = req.user?.id || null;

      if (!patient_id) return res.status(400).json({ error: 'patient_id is required' });

      // Parse items metadata sent as JSON string
      let items = [];
      try { items = JSON.parse(req.body.items || '[]'); } catch { items = []; }

      if (items.length === 0) return res.status(400).json({ error: 'At least one document item is required' });

      // Create parent record
      const doc = await DocumentModel.create({ patient_id, provider_id, uploaded_by, upload_date: items[0]?.upload_date });

      // Map uploaded files by index
      const uploadedFiles = req.files || [];

      // Create each item
      for (let i = 0; i < items.length; i++) {
        const meta = items[i];
        const file = uploadedFiles[i];
        await DocumentModel.createItem(doc.id, {
          name: meta.name,
          document_type: meta.document_type,
          upload_date: meta.upload_date || null,
          file_path: file ? file.path.replace(/\\/g, '/') : null,
          file_originalname: file ? file.originalname : null,
          file_mimetype: file ? file.mimetype : null,
          file_size: file ? file.size : 0,
        });
      }

      const full = await DocumentModel.findById(doc.id);
      res.status(201).json({ message: 'Document created successfully', data: full });
    } catch (error) {
      if (req.files) deleteFiles(req.files.map(f => f.path));
      res.status(500).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10, patient_id, document_type, search } = req.query;
      const filters = { page, limit };
      if (patient_id)     filters.patient_id     = patient_id;
      if (document_type)  filters.document_type  = document_type;
      if (search)         filters.search         = search;

      const { rows, total } = await DocumentModel.findAll(filters);
      const pageNum = parseInt(page), limitNum = parseInt(limit);
      res.json({
        data: rows,
        pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
      });
    } catch (error) { res.status(500).json({ error: error.message }); }
  }

  static async getById(req, res) {
    try {
      const data = await DocumentModel.findById(req.params.id);
      if (!data) return res.status(404).json({ error: 'Document not found' });
      res.json({ data });
    } catch (error) { res.status(500).json({ error: error.message }); }
  }

  static async update(req, res) {
    try {
      const { patient_id } = req.body;
      const existing = await DocumentModel.findById(req.params.id);
      if (!existing) {
        if (req.files) deleteFiles(req.files.map(f => f.path));
        return res.status(404).json({ error: 'Document not found' });
      }

      let items = [];
      try { items = JSON.parse(req.body.items || '[]'); } catch { items = []; }

      const uploadedFiles = req.files || [];

      // Build new items list — if uploaded file is 0 bytes it means "keep existing"
      const newItems = items.map((meta, i) => {
        const newFile = uploadedFiles[i];
        const hasRealFile = newFile && newFile.size > 0;
        const existingItem = existing.items?.find(it => it.id === meta.id);

        // Clean up 0-byte placeholder files
        if (newFile && !hasRealFile) {
          try { require('fs').unlinkSync(newFile.path); } catch {}
        }

        return {
          name: meta.name,
          document_type: meta.document_type,
          upload_date: meta.upload_date || null,
          file_path: hasRealFile ? newFile.path.replace(/\\/g, '/') : (existingItem?.file_path || null),
          file_originalname: hasRealFile ? newFile.originalname : (existingItem?.file_originalname || null),
          file_mimetype: hasRealFile ? newFile.mimetype : (existingItem?.file_mimetype || null),
          file_size: hasRealFile ? newFile.size : (existingItem?.file_size || 0),
        };
      });

      await DocumentModel.update(req.params.id, { patient_id, upload_date: newItems[0]?.upload_date });
      await DocumentModel.replaceItems(req.params.id, newItems);

      const full = await DocumentModel.findById(req.params.id);
      res.json({ message: 'Document updated successfully', data: full });
    } catch (error) {
      if (req.files) deleteFiles(req.files.map(f => f.path));
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const doc = await DocumentModel.findById(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Document not found' });
      // Delete physical files
      if (doc.items) {
        const paths = doc.items.map(it => it.file_path).filter(Boolean);
        if (paths.length) deleteFiles(paths);
      }
      await DocumentModel.delete(req.params.id);
      res.json({ message: 'Document deleted successfully' });
    } catch (error) { res.status(500).json({ error: error.message }); }
  }
}

module.exports = DocumentController;
