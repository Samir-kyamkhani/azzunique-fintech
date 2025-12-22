import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
config({ path: "../../.env" });

export default defineConfig({
  out: "./drizzle/core",
  schema: "./src/db/schema/core/*.schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.CORE_DATABASE_URL!,
  },
});
