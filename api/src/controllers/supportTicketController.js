const SupportTicketModel = require('../models/supportTicketModel');

class SupportTicketController {
  static async createTicket(req, res) {
    try {
      const ticket = await SupportTicketModel.create(req.body);
      res.status(201).json({ 
        message: 'Support ticket created successfully', 
        data: ticket 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAllTickets(req, res) {
    try {
      const { patient_id, provider_id, status, from_date, to_date, page = 1, limit = 10 } = req.query;
      const filters = {};
      
      if (patient_id) filters.patient_id = patient_id;
      if (provider_id) filters.provider_id = provider_id;
      if (status) filters.status = status;
      if (from_date) filters.from_date = from_date;
      if (to_date) filters.to_date = to_date;

      const tickets = await SupportTicketModel.findAll(filters);
      
      // Pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedData = tickets.slice(startIndex, endIndex);
      
      res.json({ 
        data: paginatedData,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: tickets.length,
          totalPages: Math.ceil(tickets.length / limitNum)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getTicketById(req, res) {
    try {
      const ticket = await SupportTicketModel.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ error: 'Support ticket not found' });
      }
      res.json({ data: ticket });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateTicket(req, res) {
    try {
      const ticket = await SupportTicketModel.update(req.params.id, req.body);
      if (!ticket) {
        return res.status(404).json({ error: 'Support ticket not found' });
      }
      res.json({ 
        message: 'Support ticket updated successfully', 
        data: ticket 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteTicket(req, res) {
    try {
      const ticket = await SupportTicketModel.delete(req.params.id);
      if (!ticket) {
        return res.status(404).json({ error: 'Support ticket not found' });
      }
      res.json({ message: 'Support ticket deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = SupportTicketController;
