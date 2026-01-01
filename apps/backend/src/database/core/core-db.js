import { drizzle } from 'drizzle-orm/mysql2';
import { corePool } from './mysql.js';
import * as schema from './schema/index.js';

export const db = drizzle(corePool, {
  schema,
  mode: 'default',
});
