import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './src/config/database.js';
import { initializeModels } from './src/models/index.js';
import quizRoutes from './src/routes/quizRoutes.js';
import { errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', quizRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔌 Connecting to database...');
    await db.initialize();
    
    console.log('📦 Initializing models...');
    await initializeModels();
    
    console.log('✅ Models initialized successfully');
    // REMOVED: await models.sequelize.sync({ alter: true });
    // Don't sync - your tables already exist!

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
      console.log(`💡 Tables are using existing database schema`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await db.sequelize.close();
  process.exit(0);
});

startServer();