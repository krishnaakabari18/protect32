const pool = require('../config/database');

class MenuModel {
  // Get all menus
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM menus WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.is_active !== undefined) {
      query += ` AND is_active = $${paramCount}`;
      values.push(filters.is_active);
      paramCount++;
    }

    if (filters.parent_id !== undefined) {
      if (filters.parent_id === null) {
        query += ' AND parent_id IS NULL';
      } else {
        query += ` AND parent_id = $${paramCount}`;
        values.push(filters.parent_id);
        paramCount++;
      }
    }

    query += ' ORDER BY sort_order ASC, label ASC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get menus for specific user with permissions
  static async findByUserId(userId) {
    const query = `
      SELECT 
        m.*,
        up.can_view,
        up.can_create,
        up.can_edit,
        up.can_delete
      FROM menus m
      LEFT JOIN user_permissions up ON m.id = up.menu_id AND up.user_id = $1
      WHERE m.is_active = true
        AND (up.can_view = true OR up.can_view IS NULL)
      ORDER BY m.sort_order ASC, m.label ASC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Get single menu
  static async findById(id) {
    const result = await pool.query('SELECT * FROM menus WHERE id = $1', [id]);
    return result.rows[0];
  }

  // Create menu
  static async create(data) {
    const { name, label, path, icon, parent_id, sort_order, is_active } = data;
    const query = `
      INSERT INTO menus (name, label, path, icon, parent_id, sort_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await pool.query(query, [name, label, path, icon, parent_id, sort_order, is_active]);
    return result.rows[0];
  }

  // Update menu
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['name', 'label', 'path', 'icon', 'parent_id', 'sort_order', 'is_active'];
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        values.push(data[field]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE menus 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete menu
  static async delete(id) {
    const result = await pool.query('DELETE FROM menus WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // Get user permissions for a menu
  static async getUserPermissions(userId, menuId) {
    const query = `
      SELECT * FROM user_permissions 
      WHERE user_id = $1 AND menu_id = $2
    `;
    const result = await pool.query(query, [userId, menuId]);
    return result.rows[0];
  }

  // Set user permissions
  static async setUserPermissions(userId, menuId, permissions) {
    const { can_view, can_create, can_edit, can_delete } = permissions;
    const query = `
      INSERT INTO user_permissions (user_id, menu_id, can_view, can_create, can_edit, can_delete)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, menu_id) 
      DO UPDATE SET 
        can_view = EXCLUDED.can_view,
        can_create = EXCLUDED.can_create,
        can_edit = EXCLUDED.can_edit,
        can_delete = EXCLUDED.can_delete,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await pool.query(query, [userId, menuId, can_view, can_create, can_edit, can_delete]);
    return result.rows[0];
  }

  // Get all permissions for a user
  static async getAllUserPermissions(userId) {
    const query = `
      SELECT 
        m.id as menu_id,
        m.name,
        m.label,
        m.path,
        COALESCE(up.can_view, false) as can_view,
        COALESCE(up.can_create, false) as can_create,
        COALESCE(up.can_edit, false) as can_edit,
        COALESCE(up.can_delete, false) as can_delete
      FROM menus m
      LEFT JOIN user_permissions up ON m.id = up.menu_id AND up.user_id = $1
      WHERE m.is_active = true
      ORDER BY m.sort_order ASC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Bulk update user permissions
  static async bulkUpdateUserPermissions(userId, permissionsArray) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const perm of permissionsArray) {
        await client.query(`
          INSERT INTO user_permissions (user_id, menu_id, can_view, can_create, can_edit, can_delete)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (user_id, menu_id) 
          DO UPDATE SET 
            can_view = EXCLUDED.can_view,
            can_create = EXCLUDED.can_create,
            can_edit = EXCLUDED.can_edit,
            can_delete = EXCLUDED.can_delete,
            updated_at = CURRENT_TIMESTAMP
        `, [userId, perm.menu_id, perm.can_view, perm.can_create, perm.can_edit, perm.can_delete]);
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = MenuModel;
