const express = require('express');
const router = express.Router();
const { AuthMiddleware } = require('../../middleware/auth');
const ChatModel = require('../../models/chatModel');

const auth = AuthMiddleware.authenticate;

/**
 * @swagger
 * tags:
 *   name: Chats
 *   description: Real-time chat with Socket.IO
 */

/**
 * @swagger
 * /chats/rooms:
 *   get:
 *     summary: Get all chat rooms for the logged-in user
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rooms with last message and unread count
 */
router.get('/rooms', auth, async (req, res) => {
  try {
    const rooms = await ChatModel.getUserRooms(req.user.id);
    res.json({ success: true, data: rooms });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @swagger
 * /chats/rooms/direct:
 *   post:
 *     summary: Get or create a direct (1-on-1) chat room with another user
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [target_user_id]
 *             properties:
 *               target_user_id:
 *                 type: string
 *                 description: UUID of the user to chat with
 *     responses:
 *       200:
 *         description: Room details
 */
router.post('/rooms/direct', auth, async (req, res) => {
  try {
    const { target_user_id } = req.body;
    if (!target_user_id) return res.status(400).json({ error: 'target_user_id is required' });
    const room = await ChatModel.findOrCreateDirectRoom(req.user.id, target_user_id);
    res.json({ success: true, data: room });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @swagger
 * /chats/rooms/group:
 *   post:
 *     summary: Create a group chat room
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, participant_ids]
 *             properties:
 *               name:            { type: string }
 *               participant_ids: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Group room created
 */
router.post('/rooms/group', auth, async (req, res) => {
  try {
    const { name, participant_ids = [] } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const room = await ChatModel.createRoom({ room_type: 'group', name, created_by: req.user.id });
    // Add creator + all participants
    await ChatModel.addParticipant(room.id, req.user.id);
    for (const uid of participant_ids) {
      if (uid !== req.user.id) await ChatModel.addParticipant(room.id, uid);
    }
    const full = await ChatModel.getRoomById(room.id);
    res.status(201).json({ success: true, data: full });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @swagger
 * /chats/rooms/{roomId}:
 *   get:
 *     summary: Get room details with participants
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Room details
 */
router.get('/rooms/:roomId', auth, async (req, res) => {
  try {
    const room = await ChatModel.getRoomById(req.params.roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json({ success: true, data: room });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @swagger
 * /chats/rooms/{roomId}/messages:
 *   get:
 *     summary: Get messages in a room (paginated, oldest first)
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         description: List of messages
 *   post:
 *     summary: Send a message (REST fallback — prefer Socket.IO)
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:      { type: string }
 *               message_type: { type: string, enum: [text, image, file], default: text }
 *               media_url:    { type: string }
 *     responses:
 *       201:
 *         description: Message sent
 */
router.get('/rooms/:roomId/messages', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await ChatModel.getRoomById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Auto-add as participant if not already
    const isParticipant = await ChatModel.isParticipant(roomId, userId);
    if (!isParticipant) await ChatModel.addParticipant(roomId, userId);

    const messages = await ChatModel.getMessages(roomId, req.query);
    await ChatModel.markRead(roomId, userId);
    res.json({ success: true, data: messages });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/rooms/:roomId/messages', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    // Check if room exists
    const room = await ChatModel.getRoomById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Auto-add user as participant if not already (for direct rooms)
    const isParticipant = await ChatModel.isParticipant(roomId, userId);
    if (!isParticipant) {
      await ChatModel.addParticipant(roomId, userId);
    }

    const { content, message_type = 'text', media_url } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required' });

    const msg = await ChatModel.sendMessage({ room_id: roomId, sender_id: userId, content, message_type, media_url });

    // Emit via Socket.IO if available
    const io = req.app.get('io');
    if (io) {
      const fullMsg = {
        ...msg,
        sender_first_name: req.user.first_name,
        sender_last_name: req.user.last_name,
        sender_photo: req.user.profile_picture,
      };
      io.to(roomId).emit('new_message', fullMsg);
    }

    res.status(201).json({ success: true, data: msg });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @swagger
 * /chats/rooms/{roomId}/read:
 *   post:
 *     summary: Mark all messages in a room as read
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Marked as read
 */
router.post('/rooms/:roomId/read', auth, async (req, res) => {
  try {
    await ChatModel.markRead(req.params.roomId, req.user.id);
    res.json({ success: true, message: 'Marked as read' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @swagger
 * /chats/messages/{messageId}:
 *   put:
 *     summary: Edit a message (sender only)
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string }
 *     responses:
 *       200:
 *         description: Message edited
 *   delete:
 *     summary: Delete a message (soft delete, sender only)
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Message deleted
 */
router.put('/messages/:messageId', auth, async (req, res) => {
  try {
    const msg = await ChatModel.editMessage(req.params.messageId, req.user.id, req.body.content);
    if (!msg) return res.status(404).json({ error: 'Message not found or not yours' });
    const io = req.app.get('io');
    if (io) io.to(msg.room_id).emit('message_edited', msg);
    res.json({ success: true, data: msg });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/messages/:messageId', auth, async (req, res) => {
  try {
    const msg = await ChatModel.deleteMessage(req.params.messageId, req.user.id);
    if (!msg) return res.status(404).json({ error: 'Message not found or not yours' });
    const io = req.app.get('io');
    if (io) io.to(msg.room_id).emit('message_deleted', { message_id: msg.id, room_id: msg.room_id });
    res.json({ success: true, message: 'Message deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
