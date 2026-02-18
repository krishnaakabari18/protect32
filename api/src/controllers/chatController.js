const ChatModel = require('../models/chatModel');

class ChatController {
  static async create(req, res) {
    try {
      const data = await ChatModel.create(req.body);
      res.status(201).json({ message: 'chat created successfully', data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const data = await ChatModel.findAll(req.query);
      res.json({ data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const data = await ChatModel.findById(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'chat not found' });
      }
      res.json({ data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const data = await ChatModel.update(req.params.id, req.body);
      if (!data) {
        return res.status(404).json({ error: 'chat not found' });
      }
      res.json({ message: 'chat updated successfully', data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const data = await ChatModel.delete(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'chat not found' });
      }
      res.json({ message: 'chat deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ChatController;
