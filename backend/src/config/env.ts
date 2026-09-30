import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/xperience_events',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_for_dev_xperience_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  aiProvider: process.env.AI_PROVIDER || 'openai',
  aiApiKey: process.env.AI_API_KEY || '',
  aiModel: process.env.AI_MODEL || 'gpt-4o-mini',
  aiBaseUrl: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
};
