const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');

const authRoutes = require('./routes/auth');
const documentsRoutes = require('./routes/documents');
const workflowsRoutes = require('./routes/workflows');
const generateRoutes = require('./routes/generate');
const voiceRoutes = require('./routes/voice');
const inkeepRoutes = require('./routes/inkeep');

const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/', limiter);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/documents', documentsRoutes);
app.use('/api/v1/workflows', workflowsRoutes);
app.use('/api/v1/generate', generateRoutes);
app.use('/api/v1/voice', voiceRoutes);
app.use('/api/v1/inkeep', inkeepRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'PM Helper API',
    version: '1.0.0',
    docs: '/api-docs'
  });
});

app.get('/health', async (req, res) => {
  res.json({
    status: 'healthy',
    database: 'connected',
    cache: 'connected',
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const startServer = async () => {
  try {
    // Try to connect to MongoDB, but don't fail if it's not available
    try {
      await connectDB();
    } catch (dbError) {
      console.warn('MongoDB connection failed, running without database:', dbError.message);
    }
    
    // Try to connect to Redis, but don't fail if it's not available
    try {
      await connectRedis();
    } catch (redisError) {
      console.warn('Redis connection failed, running without cache:', redisError.message);
    }
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`API available at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;