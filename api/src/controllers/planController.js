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
      const { is_active } = req.query;
      const filters = {};
      if (is_active !== undefined) filters.is_active = is_active === 'true';

      const plans = await PlanModel.findAll(filters);
      res.json({ data: plans });
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
