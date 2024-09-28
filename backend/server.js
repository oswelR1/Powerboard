const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();

// Connect to database
connectDB()
  .then(() => {
    console.log('Database connection established');
    
    app.use(cors());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    // Logging middleware
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });

    // API routes
    app.use('/api/auth', authRoutes);

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(500).json({ msg: 'Server error', error: err.message });
    });

    app.get('/api/test', (req, res) => {
      res.json({ message: 'Backend is working' });
    });

    const PORT = process.env.PORT || 5000;

    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    }
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  });

module.exports = app;