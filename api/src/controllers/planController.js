const PlanModel = require('../models/planModel');

class PlanController {
  static async createPlan(req, res) {
    try {
      const plan = await PlanModel.create(req.body);
      res.status(201).json({ message: 'Plan created successfully', data: plan });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAllPlans(req, res) {
    try {
      const { is_active, page = 1, limit = 10, search = '' } = req.query;
      const filters = {};
      if (is_active !== undefined) filters.is_active = is_active === 'true';

      const plans = await PlanModel.findAll(filters);
      
      // Apply search filter
      let filteredPlans = plans;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredPlans = plans.filter(plan => 
          plan.title?.toLowerCase().includes(searchLower) ||
          plan.provider_first_name?.toLowerCase().includes(searchLower) ||
          plan.provider_last_name?.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const paginatedPlans = filteredPlans.slice(offset, offset + parseInt(limit));

      res.json({ 
        data: paginatedPlans,
        pagination: {
          total: filteredPlans.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(filteredPlans.length / parseInt(limit))
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getPlanById(req, res) {
    try {
      const plan = await PlanModel.findById(req.params.id);
      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }
      res.json({ data: plan });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updatePlan(req, res) {
    try {
      const plan = await PlanModel.update(req.params.id, req.body);
      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }
      res.json({ message: 'Plan updated successfully', data: plan });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deletePlan(req, res) {
    try {
      const plan = await PlanModel.delete(req.params.id);
      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }
      res.json({ message: 'Plan deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PlanController;
