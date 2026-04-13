const express = require('express');
const router = express.Router();
const { AuthMiddleware } = require('../../middleware/auth'); const authenticate = AuthMiddleware.authenticate;
const pool = require('../../config/database');

/**
 * @swagger
 * tags:
 *   name: Menus
 *   description: Manage sidebar menu items
 */

/**
 * @swagger
 * /menus:
 *   get:
 *     summary: Get all menu items
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of menu items
 */
router.get('/', authenticate, async (req, res) => {
  try {
    let query = 'SELECT * FROM menus WHERE 1=1';
    const values = [];
    if (req.query.is_active !== undefined) {
      query += ' AND is_active=$1';
      values.push(req.query.is_active === 'true');
    }
    query += ' ORDER BY sort_order ASC, id ASC';
    const result = await pool.query(query, values);
    res.json({ data: result.rows, total: result.rows.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @swagger
 * /menus/my-menus:
 *   get:
 *     summary: Get menus accessible to the current user based on their permissions
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of accessible menu items with permissions
 */
router.get('/my-menus', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user type and menu_permissions from users table
    const userResult = await pool.query(
      'SELECT user_type, menu_permissions FROM users WHERE id = $1', [userId]
    );
    if (!userResult.rows[0]) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { user_type, menu_permissions } = userResult.rows[0];
    const normalizedUserType = user_type.toLowerCase().replace(/\s+/g, '_');

    // super_admin gets ALL active menus
    if (normalizedUserType === 'super_admin') {
      const result = await pool.query(
        `SELECT m.*, true as can_view, true as can_create, true as can_edit, true as can_delete
         FROM menus m WHERE m.is_active = true ORDER BY m.sort_order ASC, m.label ASC`
      );
      return res.json({ success: true, data: result.rows, user_type: normalizedUserType, total: result.rows.length });
    }

    // For admin/support/account — filter menus by menu_permissions array (stores menu names)
    const allowedNames = Array.isArray(menu_permissions) ? menu_permissions : [];

    if (allowedNames.length === 0) {
      return res.json({ success: true, data: [], user_type: normalizedUserType, total: 0 });
    }

    const result = await pool.query(
      `SELECT m.*, true as can_view, true as can_create, true as can_edit, true as can_delete
       FROM menus m
       WHERE m.is_active = true AND m.name = ANY($1::text[])
       ORDER BY m.sort_order ASC, m.label ASC`,
      [allowedNames]
    );

    res.json({ success: true, data: result.rows, user_type: normalizedUserType, total: result.rows.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * @swagger
 * /menus/{id}:
 *   get:
 *     summary: Get menu item by ID
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Menu item details
 *       404:
 *         description: Menu not found
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menus WHERE id=$1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Menu not found' });
    res.json({ data: result.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @swagger
 * /menus:
 *   post:
 *     summary: Create a new menu item
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - label
 *             properties:
 *               name:
 *                 type: string
 *                 example: my-menu
 *               label:
 *                 type: string
 *                 example: My Menu
 *               icon:
 *                 type: string
 *               path:
 *                 type: string
 *               parent_id:
 *                 type: integer
 *               sort_order:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Menu created successfully
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, label, icon, path, parent_id, sort_order, is_active } = req.body;
    if (!name || !label) return res.status(400).json({ error: 'name and label are required' });
    const result = await pool.query(
      'INSERT INTO menus (name,label,icon,path,parent_id,sort_order,is_active) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [name, label, icon || null, path || null, parent_id || null, sort_order || 0, is_active !== false]
    );
    res.status(201).json({ message: 'Menu created successfully', data: result.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @swagger
 * /menus/{id}:
 *   put:
 *     summary: Update a menu item
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               label:
 *                 type: string
 *               icon:
 *                 type: string
 *               path:
 *                 type: string
 *               parent_id:
 *                 type: integer
 *               sort_order:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Menu updated successfully
 *       404:
 *         description: Menu not found
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, label, icon, path, parent_id, sort_order, is_active } = req.body;
    const result = await pool.query(
      `UPDATE menus SET
        name=COALESCE($1,name), label=COALESCE($2,label), icon=$3, path=$4,
        parent_id=$5, sort_order=COALESCE($6,sort_order), is_active=COALESCE($7,is_active),
        updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [name, label, icon, path, parent_id || null, sort_order, is_active, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Menu not found' });
    res.json({ message: 'Menu updated successfully', data: result.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @swagger
 * /menus/{id}:
 *   delete:
 *     summary: Delete a menu item
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Menu deleted successfully
 *       404:
 *         description: Menu not found
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM menus WHERE id=$1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Menu not found' });
    res.json({ message: 'Menu deleted successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
