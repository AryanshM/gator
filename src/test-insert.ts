import { db } from "../lib/db/index"; // adjust the path as needed
import { sql } from "drizzle-orm";

export async function testInsertRawUser(name: string) {
  try {
    const result = await db.execute(
      sql`INSERT INTO users (id, name, created_at, updated_at)
          VALUES (
            gen_random_uuid(),
            ${name},
            NOW(),
            NOW()
          )`
    );
    console.log("✅ Inserted user with name:", name);
    process.exit(0)
  } catch (err) {
    console.error("❌ testInsertRawUser(): insert failed", err);
    throw err;
  }
}

testInsertRawUser("aryansh2")