import mongoose from 'mongoose';
import { config } from './env';

export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    // Silent in production/test unless debugging
    if (config.nodeEnv !== 'test') {
      console.log(`[MongoDB] Connected to database: ${conn.connection.name} on ${conn.connection.host}`);
    }
    return conn;
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};
