const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { io } = require('socket.io-client');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET is not defined in server/.env');
  process.exit(1);
}

console.log('--- Initializing Socket Diagnostic Test ---');
console.log('JWT Secret detected:', JWT_SECRET ? 'YES' : 'NO');

// Generate test tokens
const tokenUser1 = jwt.sign(
  { id: 1, email: 'admin@taskflow.com', role: 'admin' },
  JWT_SECRET,
  { expiresIn: '1h' }
);
const tokenUser2 = jwt.sign(
  { id: 2, email: 'member@taskflow.com', role: 'member' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const SOCKET_URL = 'http://localhost:5000';

const client1 = io(SOCKET_URL, {
  auth: { token: `Bearer ${tokenUser1}` },
  transports: ['websocket', 'polling']
});

const client2 = io(SOCKET_URL, {
  auth: { token: `Bearer ${tokenUser2}` },
  transports: ['websocket', 'polling']
});

// Handshake / Connection error listeners
client1.on('connect_error', (err) => {
  console.error('❌ Client 1 Connection Failed:', err.message);
});

client2.on('connect_error', (err) => {
  console.error('❌ Client 2 Connection Failed:', err.message);
});

client1.on('connect', () => {
  console.log('✅ Client 1 (Admin) connected. Socket ID:', client1.id);
  client1.emit('chat:join', { targetUserId: 2 });
});

client2.on('connect', () => {
  console.log('✅ Client 2 (Member) connected. Socket ID:', client2.id);
  client2.emit('chat:join', { targetUserId: 1 });
});

// Message workflow
client2.on('message:receive', (msg) => {
  console.log('📩 Client 2 received message ID:', msg.id, 'Content:', msg.encrypted_content);
  console.log('\n--- Testing Delete for Everyone ---');
  client1.emit('message:delete_everyone', { messageId: msg.id, targetUserId: 2 });
});

client2.on('message:deleted_everyone', ({ messageId }) => {
  console.log(`🗑️ Client 2 confirmed: Message ${messageId} deleted for everyone.`);
  console.log('\n--- Testing Delete for Me ---');
  client2.emit('message:delete_me', { messageId });
});

client2.on('message:deleted_me', ({ messageId }) => {
  console.log(`👁️ Client 2 confirmed: Message ${messageId} hidden (Delete for Me).`);
  console.log('\n🎉 ALL REAL-TIME SOCKET TESTS PASSED!');
  client1.disconnect();
  client2.disconnect();
  process.exit(0);
});

// Send message 1 second after script starts
setTimeout(() => {
  console.log('\n--- Client 1 Sending Test Message ---');
  client1.emit('message:send', {
    receiverId: 2,
    encryptedContent: 'U2FsdGVkX19...',
    iv: 'a1b2c3d4e5f6'
  });
}, 1000);

// 10s Timeout Guard
setTimeout(() => {
  console.error('\n❌ Test timed out. Check if server terminal shows connection logs.');
  client1.disconnect();
  client2.disconnect();
  process.exit(1);
}, 10000);