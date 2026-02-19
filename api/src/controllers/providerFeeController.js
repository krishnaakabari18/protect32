const ProviderFeeModel = require('../models/providerFeeModel');

class ProviderFeeController {
  static async createFee(req, res) {
    try {
      const fee = await ProviderFeeModel.create(req.body);
      res.status(201).json({ message: 'Provider fee created successfully', data: fee });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'This procedure already exists for this provider' });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async getAllFees(req, res) {
    try {
      const { provider_id, status, search, page = 1, limit = 10 } = req.query;
      const filters = {};
      
      if (provider_id) filters.provider_id = provider_id;
      if (status) filters.status = status;
      if (search) filters.search = search;

      const fees = await ProviderFeeModel.findAll(filters);

      // Apply pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const paginatedFees = fees.slice(offset, offset + parseInt(limit));

      res.json({ 
        data: paginatedFees,
        pagination: {
          total: fees.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(fees.length / parseInt(limit))
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getFeeById(req, res) {
    try {
      const fee = await ProviderFeeModel.findById(req.params.id);
      if (!fee) {
        return res.status(404).json({ error: 'Provider fee not found' });
      }
      res.json({ data: fee });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getFeesByProvider(req, res) {
    try {
      const fees = await ProviderFeeModel.findByProviderId(req.params.providerId);
      res.json({ data: fees });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateFee(req, res) {
    try {
      const fee = await ProviderFeeModel.update(req.params.id, req.body);
      if (!fee) {
        return res.status(404).json({ error: 'Provider fee not found' });
      }
      res.json({ message: 'Provider fee updated successfully', data: fee });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'This procedure already exists for this provider' });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteFee(req, res) {
    try {
      const fee = await ProviderFeeModel.delete(req.params.id);
      if (!fee) {
        return res.status(404).json({ error: 'Provider fee not found' });
      }
      res.json({ message: 'Provider fee deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async bulkUpsertFees(req, res) {
    try {
      const { provider_id, fees } = req.body;
      
      if (!provider_id || !fees || !Array.isArray(fees)) {
        return res.status(400).json({ error: 'provider_id and fees array are required' });
      }

      const results = await ProviderFeeModel.bulkUpsert(provider_id, fees);
      res.json({ 
        message: 'Provider fees updated successfully', 
        data: results 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProviderFeeController;
