import { createApp } from './app';
import { connectDB } from './config/db';
import { config } from './config/env';

const startServer = async () => {
  try {
    await connectDB();
    const app = createApp();

    const server = app.listen(config.port, () => {
      console.log(`[The Xperience Server] Running on http://localhost:${config.port}`);
      console.log(`[The Xperience API] Healthcheck: http://localhost:${config.port}/api/health`);
    });

    const shutdown = async () => {
      console.log('Shutting down server...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
};

startServer();
