import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './config/database';
import { appConfig } from './config/app.config';
import authRoutes from './routes/auth';
import beerRoutes from './routes/beers';
import { errorHandler } from './middleware/errorHandler';
import { Logger } from './utils/logger';

const app = express();
const PORT = appConfig.port;

// Middleware
app.use(cors({
  origin: appConfig.urls.frontend,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/beers', beerRoutes);

// Error handler middleware (must be last)
app.use(errorHandler);

// Database initialization
AppDataSource.initialize()
  .then(() => {
    Logger.info('✅ Database connected successfully!');
    app.listen(PORT, () => {
      Logger.info(`🚀 Server running at http://localhost:${PORT}`);
      Logger.info(`Environment: ${appConfig.nodeEnv}`);
    });
  })
  .catch((error) => {
    Logger.error('Database connection failed:', error);
    app.listen(PORT, () => {
      Logger.warn(`⚠️ Server running WITHOUT database at http://localhost:${PORT}`);
      Logger.warn(`Environment: ${appConfig.nodeEnv}`);
    });
  });

export default app;

