import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectDB, getDB } from './db.js';
import userRoutes from './database/routes/userRoutes.js';
import studentRoutes from './database/routes/studentRoutes.js';
import subjectRoutes from './database/routes/subjectRoutes.js';
import gradeRoutes from './database/routes/gradeRoutes.js';
import { initGradingPeriodCron } from './database/utils/cron.js';

const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(bodyParser.json());

const startServer = async () => {
    try {
        // Connect to DB
        await connectDB();
        const db = getDB(); // Get the DB instance if needed elsewhere
        console.log('✅ Database connected');

        // Initialize cron jobs
        initGradingPeriodCron();

        // Routes
        app.use('/api/v1/user', userRoutes);
        app.use('/api/v1/student', studentRoutes);
        app.use('/api/v1/subject', subjectRoutes);
        app.use('/api/v1/grade', gradeRoutes);

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