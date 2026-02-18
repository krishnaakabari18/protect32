const ProviderModel = require('../models/providerModel');

class ProviderController {
  static async createProvider(req, res) {
    try {
      const provider = await ProviderModel.create(req.body);
      res.status(201).json({ message: 'Provider created successfully', data: provider });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAllProviders(req, res) {
    try {
      const { specialty, location, page = 1, limit = 10 } = req.query;
      const filters = {};
      if (specialty) filters.specialty = specialty;
      if (location) filters.location = location;

      const providers = await ProviderModel.findAll(filters);
      
      // Pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedData = providers.slice(startIndex, endIndex);
      
      res.json({ 
        data: paginatedData,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: providers.length,
          totalPages: Math.ceil(providers.length / limitNum)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getProviderById(req, res) {
    try {
      const provider = await ProviderModel.findById(req.params.id);
      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }
      res.json({ data: provider });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateProvider(req, res) {
    try {
      const provider = await ProviderModel.update(req.params.id, req.body);
      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }
      res.json({ message: 'Provider updated successfully', data: provider });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteProvider(req, res) {
    try {
      const provider = await ProviderModel.delete(req.params.id);
      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }
      res.json({ message: 'Provider deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProviderController;
