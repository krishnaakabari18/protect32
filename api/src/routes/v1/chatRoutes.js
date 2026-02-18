const express = require('express');
const router = express.Router();
const ChatController = require('../../controllers/chatController');
const AuthMiddleware = require('../../middleware/auth');

/**
 * @swagger
 * /chats:
 *   post:
 *     summary: Create a new chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: chat created successfully
 */
router.post('/', AuthMiddleware.authenticate, ChatController.create);

/**
 * @swagger
 * /chats:
 *   get:
 *     summary: Get all chats
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chats
 */
router.get('/', AuthMiddleware.authenticate, ChatController.getAll);

/**
 * @swagger
 * /chats/{id}:
 *   get:
 *     summary: Get chat by ID
 *     tags: [Chats]
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
 *         description: chat details
 */
router.get('/:id', AuthMiddleware.authenticate, ChatController.getById);

/**
 * @swagger
 * /chats/{id}:
 *   put:
 *     summary: Update chat
 *     tags: [Chats]
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
 *         description: chat updated successfully
 */
router.put('/:id', AuthMiddleware.authenticate, ChatController.update);

/**
 * @swagger
 * /chats/{id}:
 *   delete:
 *     summary: Delete chat
 *     tags: [Chats]
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
 *         description: chat deleted successfully
 */
router.delete('/:id', AuthMiddleware.authenticate, ChatController.delete);

module.exports = router;
