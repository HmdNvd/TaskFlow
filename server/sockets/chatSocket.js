const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Helper to generate a deterministic room ID for 1-on-1 chats
const getRoomId = (user1, user2) => {
  const min = Math.min(Number(user1), Number(user2));
  const max = Math.max(Number(user1), Number(user2));
  return `room_${min}_${max}`;
};

module.exports = (io) => {
  // 1. WebSocket Authentication Middleware
  io.use((socket, next) => {
    const rawToken = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

    if (!rawToken) {
      return next(new Error('Authentication error: Token missing'));
    }

    const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, email, role }
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  // 2. Connection Lifecycle
  io.on('connection', (socket) => {
    const currentUserId = socket.user.id;

    // Join user's personal room for direct system notifications
    socket.join(`user_${currentUserId}`);

    // Join a private 1-on-1 chat room with another user
    socket.on('chat:join', async ({ targetUserId }) => {
      if (!targetUserId) return;

      const roomId = getRoomId(currentUserId, targetUserId);
      socket.join(roomId);

      // Fetch chat history (excluding messages deleted for this user)
      try {
        const query = `
          SELECT m.id, m.sender_id, m.receiver_id, 
                 CASE 
                   WHEN m.is_deleted_for_everyone = 1 THEN '[This message was deleted]'
                   ELSE m.encrypted_content 
                 END AS encrypted_content,
                 m.iv, m.is_deleted_for_everyone, m.created_at
          FROM messages m
          LEFT JOIN message_user_deletions mud 
                 ON m.id = mud.message_id AND mud.user_id = ?
          WHERE ((m.sender_id = ? AND m.receiver_id = ?) 
             OR  (m.sender_id = ? AND m.receiver_id = ?))
            AND mud.user_id IS NULL
          ORDER BY m.created_at ASC
          LIMIT 100
        `;
        const [history] = await pool.execute(query, [
          currentUserId,
          currentUserId, targetUserId,
          targetUserId, currentUserId
        ]);

        socket.emit('chat:history', { roomId, messages: history });
      } catch (err) {
        socket.emit('error', { message: 'Failed to retrieve chat history.' });
      }
    });

    // Send a message
    socket.on('message:send', async ({ receiverId, encryptedContent, iv }) => {
      if (!receiverId || !encryptedContent || !iv) {
        return socket.emit('error', { message: 'Malformed message payload.' });
      }

      const targetId = Number(receiverId);
      const roomId = getRoomId(currentUserId, targetId);

      try {
        const [result] = await pool.execute(
          'INSERT INTO messages (sender_id, receiver_id, encrypted_content, iv) VALUES (?, ?, ?, ?)',
          [currentUserId, targetId, encryptedContent, iv]
        );

        const messagePayload = {
          id: result.insertId,
          sender_id: currentUserId,
          receiver_id: targetId,
          encrypted_content: encryptedContent,
          iv: iv,
          is_deleted_for_everyone: 0,
          created_at: new Date()
        };

        // Broadcast exclusively to participants inside the room
        io.to(roomId).emit('message:receive', messagePayload);
      } catch (err) {
        socket.emit('error', { message: 'Failed to persist message.' });
      }
    });

    // WhatsApp-Style "Delete for Everyone"
    socket.on('message:delete_everyone', async ({ messageId, targetUserId }) => {
      const msgId = Number(messageId);
      const roomId = getRoomId(currentUserId, targetUserId);

      try {
        // Only author or admin can delete for everyone
        const [rows] = await pool.execute('SELECT sender_id FROM messages WHERE id = ?', [msgId]);
        if (rows.length === 0) return;

        if (rows[0].sender_id !== currentUserId && socket.user.role !== 'admin') {
          return socket.emit('error', { message: 'Unauthorized to delete this message.' });
        }

        await pool.execute(
          'UPDATE messages SET is_deleted_for_everyone = 1, encrypted_content = "[This message was deleted]" WHERE id = ?',
          [msgId]
        );

        io.to(roomId).emit('message:deleted_everyone', { messageId: msgId });
      } catch (err) {
        socket.emit('error', { message: 'Failed to delete message for everyone.' });
      }
    });

    // WhatsApp-Style "Delete for Me"
    socket.on('message:delete_me', async ({ messageId }) => {
      const msgId = Number(messageId);

      try {
        await pool.execute(
          'INSERT IGNORE INTO message_user_deletions (message_id, user_id) VALUES (?, ?)',
          [msgId, currentUserId]
        );

        // Notify only the requesting client's socket
        socket.emit('message:deleted_me', { messageId: msgId });
      } catch (err) {
        socket.emit('error', { message: 'Failed to delete message for you.' });
      }
    });

    // Typing Indicators
    socket.on('typing:start', ({ targetUserId }) => {
      const roomId = getRoomId(currentUserId, targetUserId);
      socket.to(roomId).emit('typing:start', { userId: currentUserId });
    });

    socket.on('typing:stop', ({ targetUserId }) => {
      const roomId = getRoomId(currentUserId, targetUserId);
      socket.to(roomId).emit('typing:stop', { userId: currentUserId });
    });

    socket.on('disconnect', () => {
      // Socket automatically cleans up room subscriptions
    });
  });
};