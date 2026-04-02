const NotificationModel = require('../models/notificationModel');

class NotificationController {
  // Send notification with targeting
  static async send(req, res) {
    try {
      const {
        title, message, notification_type,
        target_audience,  // 'patient' | 'provider'
        target_type,      // 'all' | 'selected' | 'exclude'
        selected_ids,     // array of user IDs (for selected/exclude)
        exclude_ids,
      } = req.body;

      if (!title || !message) return res.status(400).json({ error: 'title and message are required' });
      if (!['patient', 'provider'].includes(target_audience)) return res.status(400).json({ error: 'target_audience must be patient or provider' });
      if (!['all', 'selected', 'exclude'].includes(target_type)) return res.status(400).json({ error: 'target_type must be all, selected, or exclude' });

      const result = await NotificationModel.send({
        title, message, notification_type,
        target_audience, target_type,
        selected_ids: selected_ids || [],
        exclude_ids: exclude_ids || [],
        sent_by: req.user?.id,
      });

      res.status(201).json({
        message: `Notification sent to ${result.sent_count} ${target_audience}(s)`,
        data: result,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const data = await NotificationModel.create(req.body);
      res.status(201).json({ message: 'Notification created successfully', data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10, notification_type, target_audience } = req.query;
      const filters = {};
      if (notification_type) filters.notification_type = notification_type;
      if (target_audience) filters.target_audience = target_audience;

      const data = await NotificationModel.findAll(filters);
      const pageNum = parseInt(page), limitNum = parseInt(limit);
      const start = (pageNum - 1) * limitNum;
      res.json({
        data: data.slice(start, start + limitNum),
        pagination: { page: pageNum, limit: limitNum, total: data.length, totalPages: Math.ceil(data.length / limitNum) }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const data = await NotificationModel.findById(req.params.id);
      if (!data) return res.status(404).json({ error: 'Notification not found' });
      res.json({ data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const data = await NotificationModel.update(req.params.id, req.body);
      if (!data) return res.status(404).json({ error: 'Notification not found' });
      res.json({ message: 'Notification updated successfully', data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const data = await NotificationModel.delete(req.params.id);
      if (!data) return res.status(404).json({ error: 'Notification not found' });
      res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = NotificationController;
