const FaqModel = require('../models/faqModel');

class FaqController {
  static async getAll(req, res) {
    try {
      const { status, category, search, page = 1, limit = 10 } = req.query;
      const faqs = await FaqModel.findAll({ status, category, search });
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const start = (pageNum - 1) * limitNum;
      res.json({
        data: faqs.slice(start, start + limitNum),
        pagination: { page: pageNum, limit: limitNum, total: faqs.length, totalPages: Math.ceil(faqs.length / limitNum) },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const faq = await FaqModel.findById(req.params.id);
      if (!faq) return res.status(404).json({ error: 'FAQ not found' });
      res.json({ data: faq });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { question, answer, category, sort_order, status } = req.body;
      if (!question) return res.status(400).json({ error: 'Question is required' });
      const faq = await FaqModel.create({ question, answer, category, sort_order, status });
      res.status(201).json({ message: 'FAQ created successfully', data: faq });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const faq = await FaqModel.update(req.params.id, req.body);
      if (!faq) return res.status(404).json({ error: 'FAQ not found' });
      res.json({ message: 'FAQ updated successfully', data: faq });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { status } = req.body;
      if (!['Active', 'Inactive'].includes(status)) {
        return res.status(400).json({ error: 'Status must be Active or Inactive' });
      }
      const faq = await FaqModel.updateStatus(req.params.id, status);
      if (!faq) return res.status(404).json({ error: 'FAQ not found' });
      res.json({ message: `FAQ ${status.toLowerCase()} successfully`, data: faq });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const faq = await FaqModel.delete(req.params.id);
      if (!faq) return res.status(404).json({ error: 'FAQ not found' });
      res.json({ message: 'FAQ deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = FaqController;
