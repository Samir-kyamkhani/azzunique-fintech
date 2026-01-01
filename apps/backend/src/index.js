import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import app from './app.js';
import { corePool } from './database/core/mysql.js';

(async function bootstrap() {
  try {
    const conn = await corePool.getConnection();
    await conn.ping();
    conn.release();

    console.log('✅ Database connected (Drizzle + MySQL)');

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Startup error:', error);
    process.exit(1);
  }
})();
