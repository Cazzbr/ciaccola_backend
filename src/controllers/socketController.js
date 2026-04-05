import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const socketController = (io) => {
  // Socket auth middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ ${socket.username} connected (${socket.id})`);

    // Join chat room
    socket.on('join-room', async ({ room }) => {
      socket.join(room);
      socket.to(room).emit('user-joined', { 
        userId: socket.userId, 
        username: socket.username 
      });
    });

    // WebRTC signaling (P2P messages)
    socket.on('offer', (data) => socket.to(data.room).emit('offer', data));
    socket.on('answer', (data) => socket.to(data.room).emit('answer', data));
    socket.on('ice-candidate', (data) => socket.to(data.room).emit('ice-candidate', data));

    // Admin audio only
    socket.on('audio-offer', async (data) => {
      const user = await User.findById(socket.userId).select('role');
      if (user.role !== 'admin') {
        return socket.emit('error', { message: 'Admin audio only' });
      }
      socket.to(data.room).emit('audio-offer', data);
    });

    // Typing indicators
    socket.on('typing', ({ room }) => socket.to(room).emit('typing', socket.username));
    socket.on('stop-typing', ({ room }) => socket.to(room).emit('stop-typing'));

    socket.on('user-offline', (data) => {
      socket.to(data.room).emit('user-offline', { from: data.from });
    });

    socket.on('disconnect', () => {
      console.log(`❌ ${socket.username} disconnected`);
    });
  });
};

export default socketController;
