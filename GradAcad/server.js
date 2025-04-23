import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import { connectDB, getDB } from './database/config/db.js';
import userRoutes from './database/routes/userRoutes.js';
import studentRoutes from './database/routes/studentRoutes.js';
import subjectRoutes from './database/routes/subjectRoutes.js';
import gradeRoutes from './database/routes/gradeRoutes.js';
import emailRoutes from './database/routes/emailRoutes.js';
import authRoutes from './database/routes/authRoutes.js';
import enrollmentRoutes from './database/routes/enrollmentRoutes.js';
import botRoutes from './database/routes/botRoutes.js';
import { initGradingPeriodCron, stopGradingPeriodCron } from './database/utils/cron.js';
import { authenticateJWT } from './database/utils/jwt.js';

const allowedOrigins = [
    process.env.ENROLLPRO_URL,
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5000",
    process.env.BACKEND_URL
  ];
const app = express();

// Middleware
app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true // Enable if using cookies/auth
  }));

app.use(bodyParser.json());

const startServer = async () => {
    try {
        // Connect to DB
        await connectDB();
        const db = getDB();
        console.log('✅ Database connected');

        // Initialize cron jobs
        initGradingPeriodCron();

        // Public Routes
        app.use('/api/v1/auth', authRoutes);
        app.use('/api/v1/email', emailRoutes);
        app.use('/api/v1/enrollment', enrollmentRoutes);


        // Protected Routes (Require JWT Authentication)
        app.use('/api/v1/user', authenticateJWT, userRoutes);
        app.use('/api/v1/student', authenticateJWT, studentRoutes);
        app.use('/api/v1/subject', authenticateJWT, subjectRoutes);
        app.use('/api/v1/grade', authenticateJWT, gradeRoutes);
        app.use('/api/v1/bot', authenticateJWT, botRoutes);
        

        // Health check (modified for native driver)
        app.get('/api/v1/health', async (req, res) => {
            try {
                // Check DB connection by pinging
                await db.command({ ping: 1 });
                res.status(200).json({ 
                    status: 'OK',
                    db: 'connected'
                });
            } catch (err) {
                res.status(500).json({ 
                    status: 'Unhealthy',
                    db: 'disconnected'
                });
            }
        });

        // Start server
        const PORT = process.env.PORT || 5000;
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

        // Graceful shutdown
        const shutdown = () => {
            console.log('🛑 Shutting down gracefully...');
            stopGradingPeriodCron();
            server.close(() => {
                // Add any cleanup here
                console.log('✅ Server closed');
                process.exit(0);
            });
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();