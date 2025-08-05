import app from './app';
import { config } from './config';
import { prisma } from './config/database';

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log(' Database connected successfully');

    // Start server
    const server = app.listen(config.port, () => {
      console.log(`=� Server is running on port ${config.port}`);
      console.log(`<
 Environment: ${config.env}`); 
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('L Unable to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();