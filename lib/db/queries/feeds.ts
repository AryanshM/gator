import { feeds, users } from "../schema"
import { db } from ".."

export type Feed = typeof feeds.$inferSelect
export type User = typeof users.$inferSelect
export async function createFeed(name: string, url: string, userId: string){
    // console.log("creating feed...")

    const [feed] = await db.insert(feeds).values({
        name,
        url,
        user_id: userId
    }).returning()
    // console.log("feed created...")
    return feed
}

export function printFeed(feed: Feed, user: User) {
console.log("printing feed...")

  //console.log("📡 Feed Info:");
  //console.log(`• Name: ${feed.name}`);
  //console.log(`• URL: ${feed.url}`);
  //console.log(`• Added by: ${user.name}`);
console.log("feed printed...")

}