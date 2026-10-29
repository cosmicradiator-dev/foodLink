const mongoose = require('mongoose');

/**
 * Connect to MongoDB with retry logic
 * @param {number} retries - Number of connection retries allowed
 * @param {number} delay - Delay between retries in milliseconds
 */
const connectDB = async (retries = 3, delay = 3000) => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/foodlink';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(mongoURI, {
        autoIndex: true, // Build indexes for 2dsphere
        serverSelectionTimeoutMS: 5000,
      });

      console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (error) {
      console.error(`[MongoDB] Connection attempt ${attempt} failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`[MongoDB] Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error('[MongoDB] All connection attempts failed. Continuing without database or check MongoDB status.');
        if (process.env.NODE_ENV === 'production') {
          process.exit(1);
        }
      }
    }
  }
};

module.exports = connectDB;
