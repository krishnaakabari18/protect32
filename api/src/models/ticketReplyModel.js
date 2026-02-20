const pool = require('../config/database');

class TicketReplyModel {
  static async create(replyData) {
    const { ticket_id, user_id, message } = replyData;
    const query = `
      INSERT INTO ticket_replies (ticket_id, user_id, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [ticket_id, user_id, message];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByTicketId(ticketId) {
    const query = `
      SELECT 
        tr.id, tr.ticket_id, tr.user_id, tr.message,
        TO_CHAR(tr.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
        TO_CHAR(tr.updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at,
        u.first_name, u.last_name, u.user_type, u.profile_picture
      FROM ticket_replies tr
      JOIN users u ON tr.user_id = u.id
      WHERE tr.ticket_id = $1
      ORDER BY tr.created_at ASC
    `;
    const result = await pool.query(query, [ticketId]);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT 
        tr.*,
        TO_CHAR(tr.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
        TO_CHAR(tr.updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at,
        u.first_name, u.last_name, u.user_type
      FROM ticket_replies tr
      JOIN users u ON tr.user_id = u.id
      WHERE tr.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, replyData) {
    const { message } = replyData;
    const query = `
      UPDATE ticket_replies 
      SET message = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [message, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM ticket_replies WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getReplyCount(ticketId) {
    const query = 'SELECT COUNT(*) as count FROM ticket_replies WHERE ticket_id = $1';
    const result = await pool.query(query, [ticketId]);
    return parseInt(result.rows[0].count);
  }
}

module.exports = TicketReplyModel;
