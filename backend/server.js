require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const hallRoutes = require('./routes/halls');
const subjectRoutes = require('./routes/subjects');
const scheduleRoutes = require('./routes/schedule');
const invigilatorRoutes = require('./routes/invigilators');
const allocationRoutes = require('./routes/allocations');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Examination Hall Allocation API is running', status: 'OK' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/invigilators', invigilatorRoutes);
app.use('/api/allocations', allocationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
