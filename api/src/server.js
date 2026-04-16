require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const chatSocket = require('./socket/chatSocket');

const PORT = process.env.PORT || 8080;

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Make io accessible in routes via req.app.get('io')
app.set('io', io);

// Register chat socket handlers
chatSocket(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO enabled — connect at ws://localhost:${PORT}`);
});
