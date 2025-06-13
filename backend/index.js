import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import errorHandler from './middleware/errorhandler.js';
import dailySync from './cron/dailySync.js';

// Load env vars
dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('MongoDB connected');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import studentRoutes from './routes/student.js';
import exportRoutes from './routes/export.js';
import syncRoutes from './routes/sync.js';
app.use('/api/students', studentRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/sync', syncRoutes);

// Error handler
app.use(errorHandler);

// Start cron job
dailySync.start();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});