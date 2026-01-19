import { drizzle } from 'drizzle-orm/mysql2';
import { rechargePool } from './mysql.js';
import * as schema from '../../models/recharge/index.js';

export const rechargeDb = drizzle(rechargePool, {
  schema,
  mode: 'default',
});
