import mysql from 'mysql2/promise';
import { config } from 'dotenv';
config({ path: '../../../../../.env' });

export const dmtPool = mysql.createPool({
  uri: process.env.DMT_DATABASE_URL!,
  connectionLimit: 10,
});
