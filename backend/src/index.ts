import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import { xss } from 'express-xss-sanitizer';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { logger } from './lib/logger';
import { errorHandler } from './middlewares/error-handler';
import authRouter from './routers/auth.router';
import usersRouter from './routers/users.router';
import tasksRouter from './routers/tasks.router';
import teamsRouter from './routers/teams.router';
import commentsRouter from './routers/comments.router';
import eventsRouter from './routers/events.router';
import attachmentsRouter from './routers/attachments.router';
import activityLogsRouter from './routers/activity-logs.router';

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Data sanitization against XSS
app.use(xss());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/attachments', attachmentsRouter);
app.use('/api/activity-logs', activityLogsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.success(`Server running on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`CORS Origin: ${config.corsOrigin}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.warn('SIGINT received, shutting down gracefully...');
  server.close(() => {
    logger.success('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  logger.warn('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    logger.success('Server closed');
    process.exit(0);
  });
});

export default app;
