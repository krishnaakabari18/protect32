const NotificationModel = require('../models/notificationModel');

class NotificationController {
  static async create(req, res) {
    try {
      const data = await NotificationModel.create(req.body);
      res.status(201).json({ message: 'notification created successfully', data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const data = await NotificationModel.findAll(req.query);
      
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
      const data = await NotificationModel.findById(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'notification not found' });
      }
      res.json({ data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const data = await NotificationModel.update(req.params.id, req.body);
      if (!data) {
        return res.status(404).json({ error: 'notification not found' });
      }
      res.json({ message: 'notification updated successfully', data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const data = await NotificationModel.delete(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'notification not found' });
      }
      res.json({ message: 'notification deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = NotificationController;
