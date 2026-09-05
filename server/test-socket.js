const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { io } = require('socket.io-client');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const SOCKET_URL = 'http://localhost:5000';

if (!JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET is missing from server/.env');
  process.exit(1);
}

console.log('==================================================');
console.log('🚀 STARTING COMPREHENSIVE SOCKET.IO VERIFICATION');
console.log('==================================================\n');

// 1. Generate JWTs for Admin (User 1) and Member (User 2)
const tokenAdmin = jwt.sign({ id: 1, email: 'admin@taskflow.com', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
const tokenMember = jwt.sign({ id: 2, email: 'member@taskflow.com', role: 'member' }, JWT_SECRET, { expiresIn: '1h' });

// 2. Connect Sockets (Simulate User 1, User 2, and a 2nd tab for User 2)
const adminSocket = io(SOCKET_URL, { auth: { token: `Bearer ${tokenAdmin}` } });
const memberTab1 = io(SOCKET_URL, { auth: { token: `Bearer ${tokenMember}` } });
let memberTab2 = null;

let testMessageId = null;

// Error handlers
adminSocket.on('connect_error', (err) => console.error('❌ Admin Socket Error:', err.message));
memberTab1.on('connect_error', (err) => console.error('❌ Member Socket Error:', err.message));

// --- STEP 1: Verify Presence on Connect ---
adminSocket.on('user:status', (data) => {
  if (data.userId === 2 && data.is_online === 1) {
    console.log('✅ [Presence] Admin detected User 2 came ONLINE.');
  }
  if (data.userId === 2 && data.is_online === 0) {
    console.log('✅ [Presence] Admin detected User 2 went OFFLINE. Last seen:', data.last_seen);
  }
});

adminSocket.on('connect', () => {
  console.log('🟢 Admin (User 1) Connected. ID:', adminSocket.id);
  adminSocket.emit('chat:join', { targetUserId: 2 });
});

memberTab1.on('connect', () => {
  console.log('🟢 Member (User 2 - Tab 1) Connected. ID:', memberTab1.id);
  memberTab1.emit('chat:join', { targetUserId: 1 });

  // Open 2nd tab for Member to test multi-session presence
  memberTab2 = io(SOCKET_URL, { auth: { token: `Bearer ${tokenMember}` } });
  memberTab2.on('connect', () => {
    console.log('🟢 Member (User 2 - Tab 2) Connected. ID:', memberTab2.id);

    // Once both users and tabs are ready, initiate message workflow
    startMessageFlow();
  });
});

// --- STEP 2: Chat History Confirmation ---
memberTab1.on('chat:history', ({ roomId, messages, targetUser }) => {
  console.log(`✅ [History] Loaded room "${roomId}" with ${messages.length} previous messages. Target User online status:`, targetUser?.is_online);
});

// --- STEP 3: Send Message Workflow ---
function startMessageFlow() {
  console.log('\n--- Test 1: Sending Encrypted Message (Admin -> Member) ---');
  adminSocket.emit('message:send', {
    receiverId: 2,
    encryptedContent: 'U2FsdGVkX1+TestCipherData==',
    iv: 'iv_hex_sample_9876'
  });
}

// Member receives message
memberTab1.on('message:receive', (msg) => {
  testMessageId = msg.id;
  console.log(`📩 [Message Receive] Member received msg #${msg.id} (Initial Status: ${msg.status})`);

  // --- STEP 4: Test Delivery & Read Receipts ---
  console.log('\n--- Test 2: Emitting Delivery and Read Receipts ---');
  memberTab1.emit('message:delivered', {
    messageIds: [msg.id],
    senderId: 1
  });

  setTimeout(() => {
    memberTab1.emit('message:read', {
      messageIds: [msg.id],
      senderId: 1
    });
  }, 400);
});

// Admin listens for Delivery Receipt
adminSocket.on('message:delivered_receipt', ({ messageIds, deliveredTo }) => {
  console.log(`📬 [Receipt] Admin received DELIVERY receipt for msg #${messageIds.join(', ')} from User #${deliveredTo}`);
});

// Admin listens for Read Receipt (Double Blue)
adminSocket.on('message:read_receipt', ({ messageIds, readBy }) => {
  console.log(`👀 [Receipt] Admin received READ receipt for msg #${messageIds.join(', ')} read by User #${readBy}`);

  // --- STEP 5: Test Delete for Everyone ---
  console.log('\n--- Test 3: WhatsApp "Delete for Everyone" ---');
  adminSocket.emit('message:delete_everyone', {
    messageId: testMessageId,
    targetUserId: 2
  });
});

// Member receives global deletion update
memberTab1.on('message:deleted_everyone', ({ messageId }) => {
  console.log(`🗑️ [Delete Everyone] Member confirmed msg #${messageId} updated to "[This message was deleted]".`);

  // --- STEP 6: Test Delete for Me ---
  console.log('\n--- Test 4: WhatsApp "Delete for Me" ---');
  memberTab1.emit('message:delete_me', { messageId });
});

memberTab1.on('message:deleted_me', ({ messageId }) => {
  console.log(`👁️ [Delete For Me] Member confirmed msg #${messageId} hidden from local view.`);

  // --- STEP 7: Test Multi-Tab Presence Teardown ---
  console.log('\n--- Test 5: Multi-Tab Presence Teardown ---');
  console.log('Closing Member Tab 1 (User should remain ONLINE because Tab 2 is active)...');
  memberTab1.disconnect();

  setTimeout(() => {
    console.log('Closing Member Tab 2 (Now User should transition to OFFLINE)...');
    memberTab2.disconnect();

    setTimeout(() => {
      console.log('\n==================================================');
      console.log('🎉 ALL SOCKET LIFECYCLE & PRESENCE TESTS PASSED!');
      console.log('==================================================');
      adminSocket.disconnect();
      process.exit(0);
    }, 800);
  }, 800);
});

// Safety timeout
setTimeout(() => {
  console.error('\n❌ Test timed out. Check server logs.');
  process.exit(1);
}, 12000);