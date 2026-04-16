const ChatModel = require('../models/chatModel');
const JWTUtil = require('../utils/jwt');
const UserModel = require('../models/userModel');

module.exports = (io) => {
  // Auth middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) return next(new Error('Authentication required'));
      const decoded = JWTUtil.verifyToken(token);
      if (!decoded) return next(new Error('Invalid token'));
      const user = await UserModel.findById(decoded.userId);
      if (!user || !user.is_active) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (e) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`[Socket] User connected: ${userId} (${socket.user.first_name})`);

    // ── Join user's rooms automatically ──────────────────────────────────────
    ChatModel.getUserRooms(userId).then(rooms => {
      rooms.forEach(room => socket.join(room.id));
    }).catch(() => {});

    // ── Join a specific room ──────────────────────────────────────────────────
    socket.on('join_room', async ({ room_id }) => {
      try {
        const isParticipant = await ChatModel.isParticipant(room_id, userId);
        if (!isParticipant) { socket.emit('error', { message: 'Not a participant' }); return; }
        socket.join(room_id);
        await ChatModel.markRead(room_id, userId);
        socket.emit('joined_room', { room_id });
      } catch (e) { socket.emit('error', { message: e.message }); }
    });

    // ── Send message ──────────────────────────────────────────────────────────
    socket.on('send_message', async ({ room_id, content, message_type = 'text', media_url = null }) => {
      try {
        if (!room_id || !content) { socket.emit('error', { message: 'room_id and content required' }); return; }
        const isParticipant = await ChatModel.isParticipant(room_id, userId);
        if (!isParticipant) { socket.emit('error', { message: 'Not a participant' }); return; }

        const msg = await ChatModel.sendMessage({ room_id, sender_id: userId, content, message_type, media_url });
        const fullMsg = {
          ...msg,
          sender_first_name: socket.user.first_name,
          sender_last_name: socket.user.last_name,
          sender_photo: socket.user.profile_picture,
        };

        // Broadcast to all room participants
        io.to(room_id).emit('new_message', fullMsg);
      } catch (e) { socket.emit('error', { message: e.message }); }
    });

    // ── Typing indicator ──────────────────────────────────────────────────────
    socket.on('typing', ({ room_id }) => {
      socket.to(room_id).emit('user_typing', {
        room_id, user_id: userId,
        name: `${socket.user.first_name} ${socket.user.last_name}`,
      });
    });

    socket.on('stop_typing', ({ room_id }) => {
      socket.to(room_id).emit('user_stop_typing', { room_id, user_id: userId });
    });

    // ── Edit message ──────────────────────────────────────────────────────────
    socket.on('edit_message', async ({ message_id, content }) => {
      try {
        const msg = await ChatModel.editMessage(message_id, userId, content);
        if (!msg) { socket.emit('error', { message: 'Message not found or not yours' }); return; }
        io.to(msg.room_id).emit('message_edited', msg);
      } catch (e) { socket.emit('error', { message: e.message }); }
    });

    // ── Delete message ────────────────────────────────────────────────────────
    socket.on('delete_message', async ({ message_id }) => {
      try {
        const msg = await ChatModel.deleteMessage(message_id, userId);
        if (!msg) { socket.emit('error', { message: 'Message not found or not yours' }); return; }
        io.to(msg.room_id).emit('message_deleted', { message_id: msg.id, room_id: msg.room_id });
      } catch (e) { socket.emit('error', { message: e.message }); }
    });

    // ── Mark read ─────────────────────────────────────────────────────────────
    socket.on('mark_read', async ({ room_id }) => {
      try {
        await ChatModel.markRead(room_id, userId);
        socket.to(room_id).emit('messages_read', { room_id, user_id: userId });
      } catch (e) { socket.emit('error', { message: e.message }); }
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${userId}`);
    });
  });
};
