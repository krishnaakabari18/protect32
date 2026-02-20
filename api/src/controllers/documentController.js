const DocumentModel = require('../models/documentModel');
const { deleteFiles, getFileInfo } = require('../utils/documentUpload');

class DocumentController {
  static async create(req, res) {
    try {
      const { patient_id, provider_id, name, document_type, notes } = req.body;
      const uploaded_by = req.user.id;

      // Get uploaded files info
      const files = req.files ? req.files.map(file => getFileInfo(file)) : [];

      if (files.length === 0) {
        return res.status(400).json({ error: 'At least one file is required' });
      }

      const documentData = {
        patient_id,
        provider_id,
        name,
        document_type,
        files,
        notes,
        uploaded_by
      };

      const data = await DocumentModel.create(documentData);
      res.status(201).json({ 
        message: 'Document created successfully', 
        data,
        filesUploaded: files.length
      });
    } catch (error) {
      // Clean up uploaded files if database insert fails
      if (req.files) {
        const filePaths = req.files.map(file => file.path);
        deleteFiles(filePaths);
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10, patient_id, provider_id, document_type } = req.query;
      
      const filters = {};
      if (patient_id) filters.patient_id = patient_id;
      if (provider_id) filters.provider_id = provider_id;
      if (document_type) filters.document_type = document_type;

      const data = await DocumentModel.findAll(filters);
      
      // Pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedData = data.slice(startIndex, endIndex);
      
      res.json({ 
        data: paginatedData,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: data.length,
          totalPages: Math.ceil(data.length / limitNum)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const data = await DocumentModel.findById(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'Document not found' });
      }
      res.json({ data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { patient_id, provider_id, name, document_type, notes, keep_existing_files } = req.body;
      
      // Get existing document
      const existingDoc = await DocumentModel.findById(req.params.id);
      if (!existingDoc) {
        // Clean up uploaded files if document not found
        if (req.files) {
          const filePaths = req.files.map(file => file.path);
          deleteFiles(filePaths);
        }
        return res.status(404).json({ error: 'Document not found' });
      }

      // Get new uploaded files
      const newFiles = req.files ? req.files.map(file => getFileInfo(file)) : [];
      
      // Handle existing files
      let files = [];
      if (keep_existing_files === 'true' && existingDoc.files) {
        // Keep existing files and add new ones
        const existingFiles = typeof existingDoc.files === 'string' 
          ? JSON.parse(existingDoc.files) 
          : existingDoc.files;
        files = [...existingFiles, ...newFiles];
      } else {
        // Replace with new files only
        files = newFiles;
        
        // Delete old files from filesystem
        if (existingDoc.files) {
          const oldFiles = typeof existingDoc.files === 'string' 
            ? JSON.parse(existingDoc.files) 
            : existingDoc.files;
          const oldFilePaths = oldFiles.map(f => f.path);
          deleteFiles(oldFilePaths);
        }
      }

      if (files.length === 0) {
        return res.status(400).json({ error: 'At least one file is required' });
      }

      const documentData = {
        patient_id,
        provider_id,
        name,
        document_type,
        files,
        notes
      };

      const data = await DocumentModel.update(req.params.id, documentData);
      res.json({ 
        message: 'Document updated successfully', 
        data,
        filesCount: files.length
      });
    } catch (error) {
      // Clean up uploaded files if update fails
      if (req.files) {
        const filePaths = req.files.map(file => file.path);
        deleteFiles(filePaths);
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      // Get document to retrieve file paths
      const document = await DocumentModel.findById(req.params.id);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Delete from database
      await DocumentModel.delete(req.params.id);

      // Delete all associated files from filesystem
      if (document.files) {
        const files = typeof document.files === 'string' 
          ? JSON.parse(document.files) 
          : document.files;
        const filePaths = files.map(f => f.path);
        const deletedFiles = deleteFiles(filePaths);
        const successCount = deletedFiles.filter(result => result === true).length;
        
        res.json({ 
          message: 'Document deleted successfully',
          filesDeleted: successCount,
          totalFiles: filePaths.length
        });
      } else {
        res.json({ message: 'Document deleted successfully' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete a specific file from a document
  static async deleteFile(req, res) {
    try {
      const { id, fileIndex } = req.params;
      
      const document = await DocumentModel.findById(id);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const files = typeof document.files === 'string' 
        ? JSON.parse(document.files) 
        : document.files;

      const index = parseInt(fileIndex);
      if (index < 0 || index >= files.length) {
        return res.status(400).json({ error: 'Invalid file index' });
      }

      // Delete file from filesystem
      const fileToDelete = files[index];
      deleteFiles([fileToDelete.path]);

      // Remove from array
      files.splice(index, 1);

      if (files.length === 0) {
        return res.status(400).json({ error: 'Cannot delete last file. Delete the entire document instead.' });
      }

      // Update document
      const documentData = {
        patient_id: document.patient_id,
        provider_id: document.provider_id,
        name: document.name,
        document_type: document.document_type,
        files,
        notes: document.notes
      };

      const data = await DocumentModel.update(id, documentData);
      res.json({ 
        message: 'File deleted successfully', 
        data,
        remainingFiles: files.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = DocumentController;
