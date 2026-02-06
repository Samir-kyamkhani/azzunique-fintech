import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

import app from './app.js';
import { corePool } from './database/core/mysql.js';
import './events/index.js';
import { startAllCrons } from './crons/index.js';

let server;

async function bootstrap() {
  try {
    const conn = await corePool.getConnection();
    await conn.ping();
    conn.release();

    console.log('✅ Database connected (Drizzle + MySQL)');

    const PORT = process.env.PORT || 3001;

    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Start cron AFTER server is ready
    startAllCrons();
  } catch (error) {
    console.error('❌ Startup error:', error);
    process.exit(1);
  }
}

bootstrap();

//  Graceful shutdown (VERY IMPORTANT for Coolify)
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

async function shutdown() {
  console.log('🛑 Gracefully shutting down...');

  if (server) {
    server.close(() => {
      console.log('✅ HTTP server closed');
    });
  }

  await corePool.end();
  console.log('✅ MySQL pool closed');

  process.exit(0);
}
