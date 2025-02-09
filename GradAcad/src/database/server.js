import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectDB } from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import studentRoutes from './routes/studentRoutes.js'
import subjectRoutes from './routes/subjectRoutes.js'
import gradeRoutes from './routes/gradeRoutes.js'

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const startServer = async () => {
    try {
        // Wait for the database connection before starting the server
        await connectDB();

        // Routes
        app.use('/api/v1/user', userRoutes);
        app.use('/api/v1/student', studentRoutes);
        app.use('/api/v1/subject', subjectRoutes);
        app.use('/api/v1/terms', gradeRoutes);

        // Start the server
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();
