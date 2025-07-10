import postgres from "postgres";
const sql = postgres("postgres://aryansh:aryansh@localhost:5432/gator?sslmode=disable", {
  debug: console.log,
});

await sql`SELECT 1`; // Should log debug output
