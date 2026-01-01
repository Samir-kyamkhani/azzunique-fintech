import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
config({ path: '../../../../../.env' });

export default defineConfig({
  schema: './schema/index',
  out: './drizzle/dmt',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
