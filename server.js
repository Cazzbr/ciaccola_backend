import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json' with { type: 'json' };

import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';

dotenv.config();

import connectDB from './src/config/db.js';
import socketController from './src/controllers/socketController.js';
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import messageRoutes from './src/routes/messages.js';

// Connect DB
connectDB();

const app = express();
const uiOptions = {
  swaggerOptions: {
    persistAuthorization: true,  // Keeps token across refreshes
    docExpansion: 'none',        // Optional: Collapse sections
  }
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, uiOptions));
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Attach io to app for use in controllers
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Make io available
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);


// Socket.IO
socketController(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});