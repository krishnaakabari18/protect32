const pool = require('../config/database');

class NotificationModel {
  // Resolve target user IDs based on audience + targeting mode
  static async resolveTargetIds(target_audience, target_type, selected_ids = [], exclude_ids = []) {
    let query;
    if (target_audience === 'patient') {
      query = `SELECT u.id FROM patients p JOIN users u ON p.id = u.id`;
    } else {
      query = `SELECT u.id FROM providers p JOIN users u ON p.id = u.id`;
    }

    const result = await pool.query(query);
    let ids = result.rows.map(r => r.id);

    if (target_type === 'selected') {
      ids = ids.filter(id => selected_ids.includes(id));
    } else if (target_type === 'exclude') {
      ids = ids.filter(id => !exclude_ids.includes(id));
    }
    // 'all' → keep all ids
    return ids;
  }

  // Create a notification broadcast record and insert one row per recipient
  static async send(data) {
    const {
      title, message, notification_type,
      target_audience, target_type,
      selected_ids = [], exclude_ids = [],
      sent_by
    } = data;

    const recipientIds = await NotificationModel.resolveTargetIds(
      target_audience, target_type, selected_ids, exclude_ids
    );

    if (recipientIds.length === 0) {
      return { sent_count: 0, recipients: [] };
    }

    // Insert one notification row per recipient
    const inserted = [];
    for (const userId of recipientIds) {
      const r = await pool.query(
        `INSERT INTO notifications
           (user_id, title, message, notification_type, target_type, target_audience,
            selected_ids, exclude_ids, sent_count, sent_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW()) RETURNING *`,
        [userId, title, message, notification_type || 'system',
         target_type, target_audience,
         selected_ids, exclude_ids, recipientIds.length]
      );
      inserted.push(r.rows[0]);
    }

    return { sent_count: inserted.length, recipients: recipientIds };
  }

  static async create(data) {
    const keys = Object.keys(data);
    const placeholders = keys.map((_, i) => '$' + (i + 1)).join(', ');
    const values = Object.values(data);
    const result = await pool.query(
      'INSERT INTO notifications (' + keys.join(', ') + ') VALUES (' + placeholders + ') RETURNING *',
      values
    );
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    // Return distinct broadcast records (group by title+message+sent_at)
    let query = `
      SELECT DISTINCT ON (n.title, n.message, n.notification_type, n.target_audience, n.target_type, n.sent_at)
        n.id, n.title, n.message, n.notification_type,
        n.target_type, n.target_audience, n.selected_ids, n.exclude_ids,
        n.sent_count, n.sent_at, n.created_at, n.is_read
      FROM notifications n
      WHERE 1=1
    `;
    const values = [];
    let p = 1;
    if (filters.notification_type) { query += ' AND n.notification_type = $' + p++; values.push(filters.notification_type); }
    if (filters.target_audience) { query += ' AND n.target_audience = $' + p++; values.push(filters.target_audience); }
    query += ' ORDER BY n.title, n.message, n.notification_type, n.target_audience, n.target_type, n.sent_at, n.created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM notifications WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async update(id, data) {
    const keys = Object.keys(data).filter(k => data[k] !== undefined);
    const fields = keys.map((key, i) => key + ' = $' + (i + 1)).join(', ');
    const values = keys.map(k => data[k]);
    values.push(id);
    const result = await pool.query(
      'UPDATE notifications SET ' + fields + ' WHERE id = $' + values.length + ' RETURNING *',
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM notifications WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = NotificationModel;
