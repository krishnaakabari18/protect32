const express = require('express');
const router = express.Router();
const MenuController = require('../../controllers/menuController');
const { authenticate } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Menus
 *   description: Dynamic menu and permissions management
 */

/**
 * @swagger
 * /api/v1/menus:
 *   get:
 *     summary: Get all menus
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of menus
 */
router.get('/', authenticate, MenuController.getAll);

/**
 * @swagger
 * /api/v1/menus/my-menus:
 *   get:
 *     summary: Get menus for current user (with permissions)
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's accessible menus
 */
router.get('/my-menus', authenticate, MenuController.getMyMenus);

/**
 * @swagger
 * /api/v1/menus/{id}:
 *   get:
 *     summary: Get menu by ID
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu details
 */
router.get('/:id', authenticate, MenuController.getById);

/**
 * @swagger
 * /api/v1/menus:
 *   post:
 *     summary: Create a new menu
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
 *               - path
 *             properties:
 *               name:
 *                 type: string
 *               label:
 *                 type: string
 *               path:
 *                 type: string
 *               icon:
 *                 type: string
 *               parent_id:
 *                 type: string
 *               sort_order:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Menu created
 */
router.post('/', authenticate, MenuController.create);

/**
 * @swagger
 * /api/v1/menus/{id}:
 *   put:
 *     summary: Update menu
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Menu updated
 */
router.put('/:id', authenticate, MenuController.update);

/**
 * @swagger
 * /api/v1/menus/{id}:
 *   delete:
 *     summary: Delete menu
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu deleted
 */
router.delete('/:id', authenticate, MenuController.delete);

/**
 * @swagger
 * /api/v1/menus/users/{userId}/permissions:
 *   get:
 *     summary: Get user permissions for all menus
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User permissions
 */
router.get('/users/:userId/permissions', authenticate, MenuController.getUserPermissions);

/**
 * @swagger
 * /api/v1/menus/users/{userId}/permissions:
 *   put:
 *     summary: Update user permissions
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     menu_id:
 *                       type: string
 *                     can_view:
 *                       type: boolean
 *                     can_create:
 *                       type: boolean
 *                     can_edit:
 *                       type: boolean
 *                     can_delete:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Permissions updated
 */
router.put('/users/:userId/permissions', authenticate, MenuController.updateUserPermissions);

module.exports = router;
