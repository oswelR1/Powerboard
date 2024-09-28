const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();

// Wrap the entire server setup in a try-catch block
try {
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
        console.log('Request body:', JSON.stringify(req.body));
        next();
      });

      // API routes
      app.use('/api/auth', authRoutes);

      // Test route
      app.get('/api/test', (req, res) => {
        console.log('Test route accessed');
        res.json({ message: 'Backend is working', env: process.env.NODE_ENV });
      });

      // Catch-all route for debugging
      app.use('*', (req, res) => {
        console.log(`Unhandled route: ${req.method} ${req.originalUrl}`);
        res.status(404).json({ message: 'Route not found' });
      });

      // Error handling middleware
      app.use((err, req, res, next) => {
        console.error('Error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message, stack: err.stack });
      });

      const PORT = process.env.PORT || 5000;

      if (process.env.NODE_ENV !== 'production') {
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
      }
    })
    .catch((error) => {
      console.error('Failed to connect to the database:', error);
      // Don't exit the process in production, just log the error
      if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
      }
    });
} catch (error) {
  console.error('Unhandled error in server setup:', error);
}

module.exports = app;