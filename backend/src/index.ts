import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'https://ai-gym-six.vercel.app',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin === 'null') {
      return callback(null, true);
    }
    console.warn(`CORS blocked request from origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

import authRoutes from './routes/auth';
import trainerRoutes from './routes/trainers';
import bookingRoutes from './routes/bookings';
import paymentRoutes from './routes/payments';
import subscriptionRoutes from './routes/subscriptions';
import dashboardRoutes from './routes/dashboard';
import userRoutes from './routes/users';
import aiRoutes from './routes/ai';
import dietRoutes from './routes/diet';
import communityRoutes from './routes/community';
import rewardRoutes from './routes/rewards';
import workoutRoutes from './routes/workouts';

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/workouts', workoutRoutes);

// Catch-all for undefined routes
app.use((req, res) => {
  console.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('SERVER_ERROR:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong on the server'
  });
});

// Only start the server when running locally (not on Vercel serverless)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
