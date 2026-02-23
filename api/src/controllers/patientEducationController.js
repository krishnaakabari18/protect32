const PatientEducationModel = require('../models/patientEducationModel');
const { deleteImage } = require('../utils/educationImageUpload');

class PatientEducationController {
  static async create(req, res) {
    try {
      const { title, category, content, summary, tags, status } = req.body;
      const author_id = req.user.id;

      if (!title || !category || !content) {
        return res.status(400).json({ error: 'Title, category, and content are required' });
      }

      // Handle feature image upload
      let feature_image = null;
      if (req.file) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        feature_image = `education/${year}/${month}/${day}/${req.file.filename}`;
      }

      const data = await PatientEducationModel.create({
        title,
        category,
        content,
        summary,
        tags,
        author_id,
        status: status || 'Active',
        feature_image
      });

      res.status(201).json({ 
        message: 'Patient education content created successfully', 
        data 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10, category, status, search } = req.query;
      
      const filters = {};
      if (category) filters.category = category;
      if (status) filters.status = status;
      if (search) filters.search = search;

      const data = await PatientEducationModel.findAll(filters);
      
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
      const data = await PatientEducationModel.findById(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'Content not found' });
      }

      // Increment view count
      await PatientEducationModel.incrementViewCount(req.params.id);

      res.json({ data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { title, category, content, summary, tags, status, removeImage } = req.body;

      if (!title || !category || !content) {
        return res.status(400).json({ error: 'Title, category, and content are required' });
      }

      // Get existing content to check for old image
      const existingContent = await PatientEducationModel.findById(req.params.id);
      if (!existingContent) {
        return res.status(404).json({ error: 'Content not found' });
      }

      let feature_image = existingContent.feature_image;

      // Handle image removal
      if (removeImage === 'true' && existingContent.feature_image) {
        deleteImage(existingContent.feature_image);
        feature_image = null;
      }

      // Handle new image upload
      if (req.file) {
        // Delete old image if exists
        if (existingContent.feature_image) {
          deleteImage(existingContent.feature_image);
        }
        
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        feature_image = `education/${year}/${month}/${day}/${req.file.filename}`;
      }

      const data = await PatientEducationModel.update(req.params.id, {
        title,
        category,
        content,
        summary,
        tags,
        status,
        feature_image
      });

      res.json({ 
        message: 'Patient education content updated successfully', 
        data 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { status } = req.body;

      if (!status || !['Active', 'Inactive'].includes(status)) {
        return res.status(400).json({ error: 'Valid status (Active or Inactive) is required' });
      }

      const data = await PatientEducationModel.updateStatus(req.params.id, status);

      if (!data) {
        return res.status(404).json({ error: 'Content not found' });
      }

      res.json({ 
        message: `Content status updated to ${status}`, 
        data 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const data = await PatientEducationModel.findById(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'Content not found' });
      }

      // Delete associated image if exists
      if (data.feature_image) {
        deleteImage(data.feature_image);
      }

      await PatientEducationModel.delete(req.params.id);
      res.json({ message: 'Patient education content deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCategories(req, res) {
    try {
      const categories = await PatientEducationModel.getCategories();
      res.json({ data: categories });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getStatistics(req, res) {
    try {
      const stats = await PatientEducationModel.getStatistics();
      res.json({ data: stats });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PatientEducationController;
