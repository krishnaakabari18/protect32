const PlanFeatureModel = require('../models/planFeatureModel');

class PlanFeatureController {
  static async getAll(req, res) {
    try {
      const features = await PlanFeatureModel.findAll();
      res.json({ data: features });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ error: 'Feature name is required' });
      const feature = await PlanFeatureModel.create({ name, description });
      res.status(201).json({ message: 'Feature created successfully', data: feature });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'A feature with this name already exists' });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const feature = await PlanFeatureModel.update(req.params.id, req.body);
      if (!feature) return res.status(404).json({ error: 'Feature not found' });
      res.json({ message: 'Feature updated successfully', data: feature });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const feature = await PlanFeatureModel.delete(req.params.id);
      if (!feature) return res.status(404).json({ error: 'Feature not found' });
      res.json({ message: 'Feature deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PlanFeatureController;
