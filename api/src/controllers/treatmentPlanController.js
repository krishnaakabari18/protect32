const TreatmentPlanModel = require('../models/treatmentPlanModel');

class TreatmentPlanController {
  static async create(req, res) {
    try {
      const data = { ...req.body };
      // Convert empty strings to null for date fields
      if (data.consent_date === '') data.consent_date = null;
      if (data.start_date === '') data.start_date = null;
      if (data.end_date === '') data.end_date = null;
      if (data.payment_requested !== undefined) data.payment_requested = data.payment_requested === 'true' || data.payment_requested === true;
      // Remove id if empty (let DB generate it)
      if (!data.id) delete data.id;
      const result = await TreatmentPlanModel.create(data);
      res.status(201).json({ message: 'treatmentPlan created successfully', data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const data = await TreatmentPlanModel.findAll(req.query);
      
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
      const data = await TreatmentPlanModel.findById(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'treatmentPlan not found' });
      }
      res.json({ data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const data = { ...req.body };
      // Convert empty strings to null for date fields
      if (data.consent_date === '') data.consent_date = null;
      if (data.start_date === '') data.start_date = null;
      if (data.end_date === '') data.end_date = null;
      if (data.payment_requested !== undefined) data.payment_requested = data.payment_requested === 'true' || data.payment_requested === true;
      const result = await TreatmentPlanModel.update(req.params.id, data);
      if (!result) {
        return res.status(404).json({ error: 'treatmentPlan not found' });
      }
      res.json({ message: 'treatmentPlan updated successfully', data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const data = await TreatmentPlanModel.delete(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'treatmentPlan not found' });
      }
      res.json({ message: 'treatmentPlan deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = TreatmentPlanController;
