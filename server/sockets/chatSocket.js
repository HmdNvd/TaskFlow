const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Registry to track user-to-socket connections: Map<userId, Set<socketId>>
const activeConnections = new Map();

const getRoomId = (user1, user2) => {
  const min = Math.min(Number(user1), Number(user2));
  const max = Math.max(Number(user1), Number(user2));
  return `room_${min}_${max}`;
};

module.exports = (io) => {
  // 1. WebSocket JWT Authentication Handshake
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

  // 2. Connection Lifecycle - Synchronous Setup
  io.on('connection', (socket) => {
    const currentUserId = socket.user.id;

    // Track active connection
    if (!activeConnections.has(currentUserId)) {
      activeConnections.set(currentUserId, new Set());
    }
    activeConnections.get(currentUserId).add(socket.id);

    // Join personal notification channel
    socket.join(`user_${currentUserId}`);

    // ==========================================
    // REGISTER ALL LISTENERS SYNCHRONOUSLY FIRST
    // ==========================================

    // --- 1-on-1 Chat Room Setup & History ---
    socket.on('chat:join', async ({ targetUserId }) => {
      if (!targetUserId) return;

      const roomId = getRoomId(currentUserId, targetUserId);
      socket.join(roomId);

      try {
        const query = `
          SELECT m.id, m.sender_id, m.receiver_id, 
                 CASE 
                   WHEN m.is_deleted_for_everyone = 1 THEN '[This message was deleted]'
                   ELSE m.encrypted_content 
                 END AS encrypted_content,
                 m.iv, m.status, m.read_at, m.is_deleted_for_everyone, m.created_at
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

        const [targetUser] = await pool.execute(
          'SELECT is_online, last_seen FROM users WHERE id = ?',
          [targetUserId]
        );

        socket.emit('chat:history', {
          roomId,
          messages: history,
          targetUser: targetUser[0] || null
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to retrieve chat history.' });
      }
    });

    // --- Send Message ---
    socket.on('message:send', async ({ receiverId, encryptedContent, iv }) => {
      if (!receiverId || !encryptedContent || !iv) {
        return socket.emit('error', { message: 'Malformed message payload.' });
      }

      const targetId = Number(receiverId);
      const roomId = getRoomId(currentUserId, targetId);

      const isReceiverOnline = activeConnections.has(targetId) && activeConnections.get(targetId).size > 0;
      const initialStatus = isReceiverOnline ? 'delivered' : 'sent';

      try {
        const [result] = await pool.execute(
          'INSERT INTO messages (sender_id, receiver_id, encrypted_content, iv, status) VALUES (?, ?, ?, ?, ?)',
          [currentUserId, targetId, encryptedContent, iv, initialStatus]
        );

        const messagePayload = {
          id: result.insertId,
          sender_id: currentUserId,
          receiver_id: targetId,
          encrypted_content: encryptedContent,
          iv: iv,
          status: initialStatus,
          read_at: null,
          is_deleted_for_everyone: 0,
          created_at: new Date()
        };

        io.to(roomId).emit('message:receive', messagePayload);
      } catch (err) {
        socket.emit('error', { message: 'Failed to persist message.' });
      }
    });

    // --- Delivery Receipt: Client Confirms Receipt (Double Grey) ---
    socket.on('message:delivered', async ({ messageIds, senderId }) => {
      if (!Array.isArray(messageIds) || messageIds.length === 0) return;

      try {
        const placeholders = messageIds.map(() => '?').join(',');
        const query = `
          UPDATE messages 
          SET status = 'delivered' 
          WHERE id IN (${placeholders}) AND receiver_id = ? AND status = 'sent'
        `;
        await pool.execute(query, [...messageIds, currentUserId]);

        // Notify original sender
        io.to(`user_${senderId}`).emit('message:delivered_receipt', {
          messageIds,
          deliveredTo: currentUserId
        });
      } catch (err) {
        console.error('Error marking messages as delivered:', err);
      }
    });

    // --- Read Receipt: Mark Messages as Read (Double Blue) ---
    socket.on('message:read', async ({ messageIds, senderId }) => {
      if (!Array.isArray(messageIds) || messageIds.length === 0) return;

      try {
        const placeholders = messageIds.map(() => '?').join(',');
        const query = `
          UPDATE messages 
          SET status = 'read', read_at = NOW() 
          WHERE id IN (${placeholders}) AND receiver_id = ? AND status != 'read'
        `;
        await pool.execute(query, [...messageIds, currentUserId]);

        io.to(`user_${senderId}`).emit('message:read_receipt', {
          messageIds,
          readBy: currentUserId,
          readAt: new Date()
        });
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    });

    // --- Delete for Everyone ---
    socket.on('message:delete_everyone', async ({ messageId, targetUserId }) => {
      const msgId = Number(messageId);
      const roomId = getRoomId(currentUserId, targetUserId);

      try {
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

    // --- Delete for Me ---
    socket.on('message:delete_me', async ({ messageId }) => {
      const msgId = Number(messageId);

      try {
        await pool.execute(
          'INSERT IGNORE INTO message_user_deletions (message_id, user_id) VALUES (?, ?)',
          [msgId, currentUserId]
        );

        socket.emit('message:deleted_me', { messageId: msgId });
      } catch (err) {
        socket.emit('error', { message: 'Failed to delete message for you.' });
      }
    });

    // --- Typing Indicators ---
    socket.on('typing:start', ({ targetUserId }) => {
      const roomId = getRoomId(currentUserId, targetUserId);
      socket.to(roomId).emit('typing:start', { userId: currentUserId });
    });

    socket.on('typing:stop', ({ targetUserId }) => {
      const roomId = getRoomId(currentUserId, targetUserId);
      socket.to(roomId).emit('typing:stop', { userId: currentUserId });
    });

    // --- Disconnect & Cleanup ---
    socket.on('disconnect', async () => {
      const userSockets = activeConnections.get(currentUserId);
      if (userSockets) {
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          activeConnections.delete(currentUserId);
          const now = new Date();

          try {
            await pool.execute(
              'UPDATE users SET is_online = 0, last_seen = ? WHERE id = ?',
              [now, currentUserId]
            );

            // Renamed to user:status per spec
            io.emit('user:status', {
              userId: currentUserId,
              is_online: 0,
              last_seen: now
            });
          } catch (err) {
            console.error('Error updating offline presence:', err);
          }
        }
      }
    });

    // ==========================================
    // ASYNC PRESENCE RUNS IN BACKGROUND (NON-BLOCKING)
    // ==========================================
    if (activeConnections.get(currentUserId).size === 1) {
      pool.execute('UPDATE users SET is_online = 1 WHERE id = ?', [currentUserId])
        .then(() => {
          // Renamed to user:status per spec
          io.emit('user:status', { userId: currentUserId, is_online: 1, last_seen: null });
        })
        .catch((err) => {
          console.error('Error updating online presence:', err);
        });
    }
  });
};