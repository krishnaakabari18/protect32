const ProcedureModel = require('../models/procedureModel');

class ProcedureController {
  static async createProcedure(req, res) {
    try {
      const procedure = await ProcedureModel.create(req.body);
      res.status(201).json({ message: 'Procedure created successfully', data: procedure });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'This procedure name already exists' });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async getAllProcedures(req, res) {
    try {
      const { is_active, category, search } = req.query;
      const filters = {};
      
      if (is_active !== undefined) filters.is_active = is_active === 'true';
      if (category) filters.category = category;
      if (search) filters.search = search;

      const procedures = await ProcedureModel.findAll(filters);
      res.json({ data: procedures });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getProcedureById(req, res) {
    try {
      const procedure = await ProcedureModel.findById(req.params.id);
      if (!procedure) {
        return res.status(404).json({ error: 'Procedure not found' });
      }
      res.json({ data: procedure });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateProcedure(req, res) {
    try {
      const procedure = await ProcedureModel.update(req.params.id, req.body);
      if (!procedure) {
        return res.status(404).json({ error: 'Procedure not found' });
      }
      res.json({ message: 'Procedure updated successfully', data: procedure });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'This procedure name already exists' });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteProcedure(req, res) {
    try {
      const procedure = await ProcedureModel.delete(req.params.id);
      if (!procedure) {
        return res.status(404).json({ error: 'Procedure not found' });
      }
      res.json({ message: 'Procedure deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProcedureController;
