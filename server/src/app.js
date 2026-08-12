import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import adminRoutes from './routes/adminRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import markRoutes from './routes/markRoutes.js';
import { seedAdmin } from './controllers/adminController.js';

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/marks', markRoutes);

app.get('/', (req, res) => {
    return res.status(200).json({ message: "Student Grading System API is working" });
});

// Sync Database and Seed Admin
sequelize.sync({ force: false }) // Keep existing data
    .then(async () => {
        console.log('Database synced successfully.');
        await seedAdmin();
    })
    .catch((error) => {
        console.error('Error syncing database:', error);
    });

export default app;