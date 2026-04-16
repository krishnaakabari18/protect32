const pool = require('../config/database');

class ChatModel {

  // ── Rooms ─────────────────────────────────────────────────────────────────

  static async createRoom({ room_type = 'direct', name = null, created_by }) {
    const r = await pool.query(
      `INSERT INTO chat_rooms (room_type, name, created_by) VALUES ($1,$2,$3) RETURNING *`,
      [room_type, name, created_by]
    );
    return r.rows[0];
  }

  static async findOrCreateDirectRoom(userId1, userId2) {
    // Check if a direct room already exists between these two users
    const existing = await pool.query(
      `SELECT cr.* FROM chat_rooms cr
       JOIN chat_participants cp1 ON cr.id = cp1.room_id AND cp1.user_id = $1
       JOIN chat_participants cp2 ON cr.id = cp2.room_id AND cp2.user_id = $2
       WHERE cr.room_type = 'direct'
       LIMIT 1`,
      [userId1, userId2]
    );
    if (existing.rows[0]) return existing.rows[0];

    // Create new direct room
    const room = await this.createRoom({ room_type: 'direct', created_by: userId1 });
    await this.addParticipant(room.id, userId1);
    await this.addParticipant(room.id, userId2);
    return room;
  }

  static async getUserRooms(userId) {
    const r = await pool.query(
      `SELECT cr.*,
         (SELECT content FROM chat_messages WHERE room_id = cr.id AND is_deleted = false ORDER BY created_at DESC LIMIT 1) as last_message,
         (SELECT created_at FROM chat_messages WHERE room_id = cr.id AND is_deleted = false ORDER BY created_at DESC LIMIT 1) as last_message_at,
         (SELECT COUNT(*) FROM chat_messages cm WHERE cm.room_id = cr.id AND cm.sender_id != $1 AND cm.created_at > COALESCE((SELECT last_read_at FROM chat_participants WHERE room_id = cr.id AND user_id = $1), '1970-01-01')) as unread_count,
         (SELECT json_agg(json_build_object('user_id', cp.user_id, 'first_name', u.first_name, 'last_name', u.last_name, 'profile_picture', u.profile_picture))
          FROM chat_participants cp JOIN users u ON cp.user_id = u.id WHERE cp.room_id = cr.id) as participants
       FROM chat_rooms cr
       JOIN chat_participants cp ON cr.id = cp.room_id AND cp.user_id = $1
       ORDER BY last_message_at DESC NULLS LAST`,
      [userId]
    );
    return r.rows;
  }

  static async getRoomById(roomId) {
    const r = await pool.query(
      `SELECT cr.*,
         (SELECT json_agg(json_build_object('user_id', cp.user_id, 'first_name', u.first_name, 'last_name', u.last_name, 'profile_picture', u.profile_picture))
          FROM chat_participants cp JOIN users u ON cp.user_id = u.id WHERE cp.room_id = cr.id) as participants
       FROM chat_rooms cr WHERE cr.id = $1`,
      [roomId]
    );
    return r.rows[0];
  }

  // ── Participants ──────────────────────────────────────────────────────────

  static async addParticipant(roomId, userId) {
    await pool.query(
      `INSERT INTO chat_participants (room_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
      [roomId, userId]
    );
  }

  static async isParticipant(roomId, userId) {
    const r = await pool.query(
      `SELECT 1 FROM chat_participants WHERE room_id = $1 AND user_id = $2`,
      [roomId, userId]
    );
    return r.rows.length > 0;
  }

  static async markRead(roomId, userId) {
    await pool.query(
      `UPDATE chat_participants SET last_read_at = NOW() WHERE room_id = $1 AND user_id = $2`,
      [roomId, userId]
    );
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  static async sendMessage({ room_id, sender_id, content, message_type = 'text', media_url = null, metadata = null }) {
    const r = await pool.query(
      `INSERT INTO chat_messages (room_id, sender_id, content, message_type, media_url, metadata)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [room_id, sender_id, content, message_type, media_url, metadata ? JSON.stringify(metadata) : null]
    );
    // Update room updated_at
    await pool.query(`UPDATE chat_rooms SET updated_at = NOW() WHERE id = $1`, [room_id]);
    return r.rows[0];
  }

  static async getMessages(roomId, { page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;
    const r = await pool.query(
      `SELECT cm.*,
         u.first_name as sender_first_name, u.last_name as sender_last_name,
         u.profile_picture as sender_photo
       FROM chat_messages cm
       JOIN users u ON cm.sender_id = u.id
       WHERE cm.room_id = $1 AND cm.is_deleted = false
       ORDER BY cm.created_at DESC
       LIMIT $2 OFFSET $3`,
      [roomId, limit, offset]
    );
    return r.rows.reverse(); // oldest first
  }

  static async editMessage(messageId, userId, content) {
    const r = await pool.query(
      `UPDATE chat_messages SET content = $1, is_edited = true, updated_at = NOW()
       WHERE id = $2 AND sender_id = $3 RETURNING *`,
      [content, messageId, userId]
    );
    return r.rows[0];
  }

  static async deleteMessage(messageId, userId) {
    const r = await pool.query(
      `UPDATE chat_messages SET is_deleted = true, content = 'This message was deleted', updated_at = NOW()
       WHERE id = $1 AND sender_id = $2 RETURNING *`,
      [messageId, userId]
    );
    return r.rows[0];
  }

  static async getMessageById(messageId) {
    const r = await pool.query('SELECT * FROM chat_messages WHERE id = $1', [messageId]);
    return r.rows[0];
  }
}

module.exports = ChatModel;
