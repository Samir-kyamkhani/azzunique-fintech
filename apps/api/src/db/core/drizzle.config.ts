import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import path from 'path';
config({
  path: path.resolve(__dirname, '../../../../../.env'),
});
export default defineConfig({
  schema: './src/db/core/schema/index.ts',
  out: './drizzle/core',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.CORE_DATABASE_URL!,
  },
});
