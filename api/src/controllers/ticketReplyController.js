const TicketReplyModel = require('../models/ticketReplyModel');
const SupportTicketModel = require('../models/supportTicketModel');

class TicketReplyController {
  static async createReply(req, res) {
    try {
      const { ticket_id } = req.params;
      const { message } = req.body;
      const user_id = req.user.id; // From auth middleware

      // Check if ticket exists
      const ticket = await SupportTicketModel.findById(ticket_id);
      if (!ticket) {
        return res.status(404).json({ error: 'Support ticket not found' });
      }

      // Check if ticket is closed
      if (ticket.status === 'Closed') {
        return res.status(400).json({ 
          error: 'Cannot reply to a closed ticket. Please reopen the ticket first.' 
        });
      }

      // Create reply
      const reply = await TicketReplyModel.create({
        ticket_id,
        user_id,
        message
      });

      // Update ticket status to "In Progress" if it was "Open"
      if (ticket.status === 'Open') {
        await SupportTicketModel.update(ticket_id, { status: 'In Progress' });
      }

      res.status(201).json({ 
        message: 'Reply added successfully', 
        data: reply 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getRepliesByTicket(req, res) {
    try {
      const { ticket_id } = req.params;

      // Check if ticket exists
      const ticket = await SupportTicketModel.findById(ticket_id);
      if (!ticket) {
        return res.status(404).json({ error: 'Support ticket not found' });
      }

      const replies = await TicketReplyModel.findByTicketId(ticket_id);
      
      res.json({ 
        data: replies,
        count: replies.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateReply(req, res) {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const user_id = req.user.id;

      // Check if reply exists
      const existingReply = await TicketReplyModel.findById(id);
      if (!existingReply) {
        return res.status(404).json({ error: 'Reply not found' });
      }

      // Check if user owns the reply
      if (existingReply.user_id !== user_id) {
        return res.status(403).json({ error: 'You can only edit your own replies' });
      }

      const reply = await TicketReplyModel.update(id, { message });
      
      res.json({ 
        message: 'Reply updated successfully', 
        data: reply 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteReply(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      // Check if reply exists
      const existingReply = await TicketReplyModel.findById(id);
      if (!existingReply) {
        return res.status(404).json({ error: 'Reply not found' });
      }

      // Check if user owns the reply
      if (existingReply.user_id !== user_id) {
        return res.status(403).json({ error: 'You can only delete your own replies' });
      }

      await TicketReplyModel.delete(id);
      
      res.json({ message: 'Reply deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = TicketReplyController;
