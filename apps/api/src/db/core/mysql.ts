import mysql from 'mysql2/promise';
import { config } from 'dotenv';
config({ path: '../../../../../.env' });

export const corePool = mysql.createPool({
  uri: process.env.CORE_DATABASE_URL!,
  connectionLimit: 10,
});
