import { drizzle } from 'drizzle-orm/mysql2';
import { corePool } from './mysql';
import * as schema from './schema';

export const CoreDbService = drizzle(corePool, {
  schema,
  mode: 'default',
});
