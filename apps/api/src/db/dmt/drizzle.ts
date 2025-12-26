import { drizzle } from 'drizzle-orm/mysql2';
import { dmtPool } from './mysql';
import * as schema from './schema';

export const dmtDb = drizzle(dmtPool, {
  schema,
  mode: 'default',
});
