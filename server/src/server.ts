import http from 'http';
import app from './app';
import { config } from './config';
import { prisma } from './utils/prisma';
import { initSocket } from './utils/socket';

const httpServer = http.createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

const server = httpServer.listen(config.port, () => {
  console.log(`
🚀 =================================================== 🚀
   StoreHub Real-Time REST & WebSocket API Server
   Running on port ${config.port}
   Environment: ${config.nodeEnv}
   Database: ${config.databaseUrl.split('@')[1]}
🚀 =================================================== 🚀
  `);
});

const gracefulShutdown = async () => {
  console.log('Shutting down server gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected. Process exited.');
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

