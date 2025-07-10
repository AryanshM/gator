import { db } from "../lib/db"; // Adjust if your path differs
import { sql } from "drizzle-orm";

async function testReadUsers() {
  try {
    const result = await db.execute(sql`SELECT * FROM users`);
    console.log("✅ All users in database:");
    console.table(result);
    process.exit(0);
  } catch (err) {
    console.error("❌ testReadUsers(): query failed", err);
    process.exit(1);
  }
}

testReadUsers();
