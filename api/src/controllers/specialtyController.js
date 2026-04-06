const SpecialtyModel = require('../models/specialtyModel');

class SpecialtyController {
  static async getAll(req, res) {
    try {
      const { is_active, search, page = 1, limit = 10 } = req.query;
      
      const filters = {};
      if (is_active !== undefined && is_active !== '') {
        filters.is_active = is_active === 'true';
      }
      if (search) {
        filters.search = search;
      }

      const allSpecialties = await SpecialtyModel.findAll(filters);
      
      // Pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      
      const paginatedData = allSpecialties.slice(startIndex, endIndex);
      
      res.json({
        success: true,
        data: paginatedData,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: allSpecialties.length,
          totalPages: Math.ceil(allSpecialties.length / limitNum)
        }
      });
    } catch (error) {
      console.error('Error fetching specialties:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const specialty = await SpecialtyModel.findById(id);
      
      if (!specialty) {
        return res.status(404).json({ success: false, error: 'Specialty not found' });
      }
      
      res.json({ success: true, data: specialty });
    } catch (error) {
      console.error('Error fetching specialty:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { name, description, is_active } = req.body;
      
      if (!name) {
        return res.status(400).json({ success: false, error: 'Name is required' });
      }

      const specialty = await SpecialtyModel.create({ name, description, is_active });
      res.status(201).json({ success: true, data: specialty });
    } catch (error) {
      console.error('Error creating specialty:', error);
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ success: false, error: 'Specialty name already exists' });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, is_active } = req.body;

      const specialty = await SpecialtyModel.update(id, { name, description, is_active });
      
      if (!specialty) {
        return res.status(404).json({ success: false, error: 'Specialty not found' });
      }
      
      res.json({ success: true, data: specialty });
    } catch (error) {
      console.error('Error updating specialty:', error);
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ success: false, error: 'Specialty name already exists' });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const specialty = await SpecialtyModel.delete(id);
      
      if (!specialty) {
        return res.status(404).json({ success: false, error: 'Specialty not found' });
      }
      
      res.json({ success: true, message: 'Specialty deleted successfully' });
    } catch (error) {
      console.error('Error deleting specialty:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = SpecialtyController;
