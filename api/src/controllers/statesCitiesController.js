const StatesCitiesModel = require('../models/statesCitiesModel');

class StatesCitiesController {
  static async getStates(req, res) {
    try {
      const data = await StatesCitiesModel.getAllStates();
      res.json({ data, total: data.length });
    } catch (e) { res.status(500).json({ error: e.message }); }
  }

  static async getCitiesByState(req, res) {
    try {
      const data = await StatesCitiesModel.getCitiesByState(req.params.stateId);
      res.json({ data, total: data.length });
    } catch (e) { res.status(500).json({ error: e.message }); }
  }

  static async getAllCities(req, res) {
    try {
      const { search } = req.query;
      const data = search
        ? await StatesCitiesModel.searchCities(search)
        : await StatesCitiesModel.getAllCities();
      res.json({ data, total: data.length });
    } catch (e) { res.status(500).json({ error: e.message }); }
  }

  static async createState(req, res) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'name is required' });
      const data = await StatesCitiesModel.createState(name);
      res.status(201).json({ message: 'State created successfully', data });
    } catch (e) { res.status(500).json({ error: e.message }); }
  }

  static async createCity(req, res) {
    try {
      const { name } = req.body;
      const { stateId } = req.params;
      if (!name) return res.status(400).json({ error: 'name is required' });
      const data = await StatesCitiesModel.createCity(name, stateId);
      res.status(201).json({ message: 'City created successfully', data });
    } catch (e) { res.status(500).json({ error: e.message }); }
  }

  static async update(req, res) {
    try {
      const { name, is_active } = req.body;
      const data = await StatesCitiesModel.update(req.params.id, name, is_active !== undefined ? is_active : true);
      if (!data) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Updated successfully', data });
    } catch (e) { res.status(500).json({ error: e.message }); }
  }

  static async delete(req, res) {
    try {
      const data = await StatesCitiesModel.delete(req.params.id);
      if (!data) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Deleted successfully' });
    } catch (e) { res.status(500).json({ error: e.message }); }
  }
}

module.exports = StatesCitiesController;
