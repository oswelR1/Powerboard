const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Test the connection by listing databases
    const adminDb = conn.connection.db.admin();
    const result = await adminDb.listDatabases();
    console.log('Available databases:', result.databases.map(db => db.name));
    
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // Rethrow the error to be caught in server.js
  }
};

module.exports = connectDB;