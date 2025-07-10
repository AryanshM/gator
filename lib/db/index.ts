import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as schema from "./schema.js";
import { readConfig } from "../../src/config.js";

const config = readConfig();
const conn = postgres(config.dbUrl, {
  connect_timeout: 10,
  debug: (connection, query, parameters) => {
    // console.log("🪵 SQL Debug:", query, parameters);
  },
});
// console.log("Drizzle schema tables:", Object.keys(schema));

export const db = drizzle(conn, { schema });

export const testConnection = async () => {
  try {
    await db.execute(sql`SELECT 1`); // ✅ proper template
    // console.log("✅ PostgreSQL connection successful");
  } catch (error) {
    // console.error("❌ PostgreSQL connection failed", error);
    process.exit(1);
  }
};