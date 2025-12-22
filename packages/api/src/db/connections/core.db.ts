import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../schema/core/index.js";

const pool = new Pool({
  connectionString: process.env.CORE_DATABASE_URL,
});

export const coreDb = drizzle(pool, { schema });
