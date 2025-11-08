import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

export const connectDB = async (retries = 0) => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-dashboard';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('✅ MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
      if (retries < MAX_RETRIES) {
        setTimeout(() => connectDB(retries + 1), RETRY_DELAY);
      }
    });

    return mongoose.connection;
  } catch (error) {
    logger.error(`MongoDB connection failed (attempt ${retries + 1}/${MAX_RETRIES}):`, error.message);
    
    if (retries < MAX_RETRIES) {
      logger.info(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDB(retries + 1);
    } else {
      throw new Error('Failed to connect to MongoDB after maximum retries');
    }
  }
};

