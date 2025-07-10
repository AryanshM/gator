import { db } from "../index";
import { users } from "../schema";
import { eq } from "drizzle-orm";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  console.log("📦 createUser called with:", name);
  return result;
}


import { sql } from "drizzle-orm";

export async function getUserByName(name: string) {
//   console.log("➡ getUserByName(): querying for", name);
  try {
    console.log("entered")
    const result = await db.execute(
      sql`SELECT * FROM users WHERE name = ${name} LIMIT 5`
    );
    console.log("leaving")

    // console.log("↪ getUserByName(): result", result);
    return result[0] ?? null;
  } catch (err) {
    console.error("❌ getUserByName(): query failed", err);
    throw err;
  }
}

