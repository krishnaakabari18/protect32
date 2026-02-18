const PaymentModel = require('../models/paymentModel');

class PaymentController {
  static async create(req, res) {
    try {
      const payment = await PaymentModel.create(req.body);
      res.status(201).json({ message: 'Payment created successfully', data: payment });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const { patient_id, provider_id, status, page = 1, limit = 10 } = req.query;
      const filters = {};
      if (patient_id) filters.patient_id = patient_id;
      if (provider_id) filters.provider_id = provider_id;
      if (status) filters.status = status;

      const payments = await PaymentModel.findAll(filters);
      
      // Pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedData = payments.slice(startIndex, endIndex);
      
      res.json({ 
        data: paginatedData,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: payments.length,
          totalPages: Math.ceil(payments.length / limitNum)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const payment = await PaymentModel.findById(req.params.id);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      res.json({ data: payment });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const payment = await PaymentModel.update(req.params.id, req.body);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      res.json({ message: 'Payment updated successfully', data: payment });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PaymentController;
