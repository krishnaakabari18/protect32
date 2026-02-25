const PrescriptionModel = require('../models/prescriptionModel');

// Helper function to format date fields to avoid timezone issues
const formatDateFields = (data) => {
  const dateFields = ['date_prescribed', 'start_date', 'end_date'];
  const formatted = { ...data };
  
  dateFields.forEach(field => {
    if (formatted[field]) {
      // Extract just the date part (YYYY-MM-DD) to avoid timezone conversion
      if (typeof formatted[field] === 'string') {
        formatted[field] = formatted[field].split('T')[0];
      }
    }
  });
  
  return formatted;
};

class PrescriptionController {
  static async create(req, res) {
    try {
      // Format date fields before saving
      const formattedData = formatDateFields(req.body);
      const data = await PrescriptionModel.create(formattedData);
      res.status(201).json({ message: 'prescription created successfully', data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const data = await PrescriptionModel.findAll(req.query);
      
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
      const data = await PrescriptionModel.findById(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'prescription not found' });
      }
      res.json({ data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      // Format date fields before updating
      const formattedData = formatDateFields(req.body);
      const data = await PrescriptionModel.update(req.params.id, formattedData);
      if (!data) {
        return res.status(404).json({ error: 'prescription not found' });
      }
      res.json({ message: 'prescription updated successfully', data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const data = await PrescriptionModel.delete(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'prescription not found' });
      }
      res.json({ message: 'prescription deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PrescriptionController;
