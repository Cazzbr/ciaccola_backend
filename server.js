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
    persistAuthorization: true, 
    docExpansion: 'none', 
  }
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, uiOptions));
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.set('io', io);

// Middlewares for safety and CORS
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.set('io', io);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

socketController(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});