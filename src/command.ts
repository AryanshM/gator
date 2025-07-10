import { setUser } from "./config";
import { db } from "../lib/db/index"; // adjust the path as needed
import { users, feeds } from "../lib/db/schema"; // adjust the path as needed
import { createUser, getUserByName } from "../lib/db/queries/users"
type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
import { eq, sql, and } from "drizzle-orm";
import {changeUsername} from "./config"
import { readConfig } from "./config";
import { feedFollows } from "../lib/db/schema";
export const handlerReset: CommandHandler = async (cmdName, ...args) => {
    if(args.length != 0){ 
        throw new Error("invalid arguments")
    }
    try {
    await db.execute(sql`DELETE FROM users`);
    console.log("🗑️ All users deleted from the 'users' table.");
    
    changeUsername("")
      
  } catch (err) {
    console.error("❌ Failed to delete all users:", err);
    process.exit(1);
  }
}

export const handlerListusers: CommandHandler = async (cmdName, ...args) => {
    const result = await db.select().from(users)
    const current_user_name = readConfig().current_user_name
    for( const record of result){
        console.log("*" + record.name + (record.name === current_user_name ? " (current)" : ""))
    }
}
export const handlerRegister: CommandHandler = async (cmdName, ...args) => {
  if (args.length === 0) {
    throw new Error("The register command expects a username.");
  }

  const name = args[0];
  console.log("name:", name);

  const existingUser = await getUserByName(name);
  console.log("result from getUserByName:", existingUser);

  if (existingUser) {
    console.log("User already exists...");
    throw new Error(`User "${name}" already exists.`);
  }

  const newUser = await createUser(name);
  console.log(`Registered user "${newUser.name}" with id ${newUser.id}`);

  setUser(name);  // ✅ Add this line
  console.log("✅ User set in .gatorconfig.json");
};


export async function handlerLogin(cmdName: string, ...args: string[]):Promise<void> {
	
    if(args.length === 0){
        throw new Error(" the login handler expects a single argument, the username.")
    }

  const existingUser = await getUserByName(args[0]);

  if(existingUser){
setUser(args[0])
    console.log("the user has been set")

  }
  else{
    throw new Error("User doesnt exist")
  }
    }
export type CommandsRegistry = {
  [commandName: string]: CommandHandler;
};


export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[] ): Promise<void>{
    if (cmdName in registry){
        console.log(cmdName + " command registered...")
        // console.log(registry)
        console.log(cmdName + " command running...")
        await registry[cmdName](cmdName,...args)
    } else {
    console.error(`Unknown command: ${cmdName}`);
  }
}

export async function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): Promise<void> {
    registry[cmdName] = handler;
}
import { XMLParser } from "fast-xml-parser";
import { createFeed, Feed, printFeed, User } from "lib/db/queries/feeds";
import { UUID } from "crypto";

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate?: string;
};

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[] | RSSItem;
  };
};


// export async function handlerAggreggate(cmdName: string, ...args: string[]):Promise<void> {
//   try {
//     const resp = await fetch("https://www.wagslane.dev/index.xml", {
//       headers: {
//         "User-Agent": "gator",
//       },
//     });

//     if (!resp.ok) {
//       throw new Error(`Failed to fetch feed: ${resp.status} ${resp.statusText}`);
//     }

//     const feedText = await resp.text();

//     const parser = new XMLParser();
//     const jsonObj = parser.parse(feedText);

//     const channel = jsonObj.rss.channel;
//     if (!channel || !channel.title || !channel.link || !channel.description) {
//       throw new Error("Incomplete RSS feed metadata.");
//     }

//     const { title, link, description } = channel;

//     // Ensure items is an array
//     const rawItems = Array.isArray(channel.item)
//       ? channel.item
//       : channel.item
//       ? [channel.item]
//       : [];

//     const items: RSSItem[] = rawItems.map((item: RSSItem) => ({
//       title: item.title ?? "",
//       link: item.link ?? "",
//       description: item.description ?? "",
//       pubDate: item.pubDate ?? "",
//     }));

//     const result = {
//       title,
//       link,
//       description,
//       items,
//     };

//     console.log("✅ Parsed RSS Feed:");
//     console.log(result);

//   } catch (error) {
//     console.error("❌ Error fetching or parsing feed:", error);
//     throw error;
//   }
// }
export async function addfeed(cmdName: string, user: User, ...args: string[]):Promise<void> 
{

    if(args.length != 2){
        throw new Error("invalid number of arguments")
        
    }
    const name = args[0]
    const url = args[1]

    // const user = readConfig().current_user_name
    //  if(!user){
    //     throw new Error("username not logged in")
    // }
    // console.log("current user: "+ user)
//     const userRecord: User | undefined = await db.query.users.findFirst({
//     where: eq(users.name, user),

//   });
//   console.log("current user record: "+ userRecord)

   
//     if (!userRecord) {
//         throw new Error(`❌ User record for "${user}" not found`);


    const newFeed = await 
    createFeed(name, url, user.id)

    console.log(newFeed)
    await printFeed(newFeed, user)

    await createFeedFollow(newFeed, user)
}

export async function showFeed(cmdName: string, ...args: string[]):Promise<void> 
{
    // 1. Argument check
  if (args.length > 0) {
    throw new Error("❌ 'showFeed' does not take any arguments.");
  }

  
  // 4. Fetch all feeds for the current user
  const userFeeds = await db.query.feeds.findMany();

  if (userFeeds.length === 0) {
    console.log("📭 No feeds found for this user.");
    return;
  }

  // 5. Display feeds
  for(const feed of userFeeds){
    console.log(feed)
    const user = await db.query.users.findFirst({
      where: eq(users.id, feed.user_id),
    });
    console.log("added by: "+user?.name)
    // find name by through logic that find the userid in the feeds table which is equal to the id in users table
  }

}


async function createFeedFollow (feed: Feed, user:User){
    try {
    await db.insert(feedFollows).values({
      user_id: user.id,
      feed_id: feed.id,
    });
    console.log("✅ Feed followed successfully");
  } catch (error: any) {
    console.error("❌ Failed to follow feed:", error.message || error);
  }
}

export async function handlerFollow(cmdName: string, user: User, ...args: string[]): Promise<void> {
  // ✅ 1. Validate argument count
  if (args.length !== 1) {
    throw new Error("❌ 'follow' command requires exactly 1 argument: feed URL");
  }

  const url = args[0];

  // ✅ 2. Find feed by URL
  const feedRecord: Feed | undefined = await db.query.feeds.findFirst({
    where: eq(feeds.url, url),
  });

  if (!feedRecord) {
    throw new Error(`❌ No feed found with URL: ${url}`);
  }


 

  // ✅ 5. Insert into feed_follows
  await createFeedFollow(feedRecord, user);

  console.log(`✅ ${user.name} is now following feed: "${feedRecord.name}"`);
}

export async function handlerFollowing(cmdName: string, user: User, ...args: string[]): Promise<void> {
  // ✅ 1. Validate argument count
  if (args.length !== 0) {
    throw new Error("❌ 'follow' command requires no argument ");
  }

 
 

  // ✅ 5. Insert into feed_follows
  await showFeedFollowing(user);

  
}
export async function handlerUnfollow(cmdName: string, user: User, ...args: string[]): Promise<void> {
  // ✅ 1. Validate argument count
  if (args.length !== 1) {
    throw new Error("❌ 'unfollow' command requires  argument ");
  }
  const url = args[0]
  const feed = await db.query.feeds.findFirst({
    where: eq(feeds.url, url)
  });
  if (!feed) {
    throw new Error(`❌ No feed found with URL: ${url}`);
  }
  // ✅ 5. Insert into feed_follows
  await unfollowUser(user, feed);
  
}

async function unfollowUser(user: User, feed: Feed ){
    await db.delete(feedFollows).where(and(eq(feedFollows.feed_id, feed.id),eq(feedFollows.user_id,user.id))) // and also feed_follows.user_id is user.id
}

async function showFeedFollowing(userRecord: User){
    const follows = await db.query.feedFollows.findMany({
        where : 
            eq(feedFollows.user_id, userRecord.id )
        
    })

    if (follows.length === 0) {
    console.log("📭 No followed feeds found for this user.");
    return;
  }

  // Step 2: For each followed feed, fetch the feed record and print
  for (const follow of follows) {
    const feed = await db.query.feeds.findFirst({
      where: eq(feeds.id, follow.feed_id),
    });

    if (feed) {
      console.log("📡 Followed Feed:");
      console.log(`• Name: ${feed.name}`);
      console.log(`• URL: ${feed.url}`);
    } else {
      console.warn(`⚠️ Feed not found for ID ${follow.feed_id}`);
    }
  }
}

type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;

export  function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler  {
    return async (cmdName, ...args) => {

    const userName = readConfig().current_user_name;

    if (!userName) {
      throw new Error("❌ No user is logged in.");
    }

    const user = await db.query.users.findFirst({
      where: eq(users.name, userName),
    });

    if (!user) {
      throw new Error(`❌ User '${userName}' not found.`);
    }
        return handler(cmdName , user, ...args)
    }
}


async function markFeedFetched(feedId: string) {
  await db.update(feeds)
    .set({
      last_fetched: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(feeds.id, feedId));
}

async function getNextFeedToFetch(): Promise<Feed | undefined> {
  const result = await db.execute(
    sql`SELECT * FROM feeds ORDER BY last_fetched NULLS FIRST LIMIT 1`
  );
  const rows = result as unknown as Feed[];
  return rows[0];
}

import Parser from "rss-parser";
const parser = new Parser();

async function scrapeFeeds() {
  const feed = await getNextFeedToFetch();
  if (!feed) {
    console.log("📭 No feeds found.");
    return;
  }

  console.log(`🌐 Fetching: ${feed.url}`);

  const rss = await parser.parseURL(feed.url);

  console.log(`📰 Posts from ${feed.name}:`);
  for (const item of rss.items) {
  const publishedAt = item.pubDate ? new Date(item.pubDate) : null;
  await createPost({
    title: item.title || "No title",
    url: item.link || "No URL",
    description: item.contentSnippet || item.content || null,
    publishedAt,
    feed_id: feed.id,
  });
}
  await markFeedFetched(feed.id);
}


function parseDuration(str: string): number {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = str.match(regex);
  if (!match) throw new Error("Invalid duration format");
  const [_, numStr, unit] = match;
  const num = parseInt(numStr);
  switch (unit) {
    case "ms": return num;
    case "s": return num * 1000;
    case "m": return num * 60_000;
    case "h": return num * 60 * 60_000;
    default: throw new Error("Unknown unit");
  }
}

export async function handlerAggreggate(cmdName: string, ...args: string[]) {
  if (args.length !== 1) throw new Error("agg requires 1 arg");

  const timeBetweenMs = parseDuration(args[0]);
  console.log(`🔁 Collecting feeds every ${args[0]}`);

  // First run
  await scrapeFeeds().catch(console.error);

  // Schedule repeated runs
  const interval = setInterval(() => {
    scrapeFeeds().catch(console.error);
  }, timeBetweenMs);

  // Graceful shutdown
  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("🛑 Shutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
}


import { posts } from "../lib/db/schema";

export type Post = typeof posts.$inferSelect;

export async function createPost(post: {
  title: string;
  url: string;
  description?: string | null;
  publishedAt?: Date | null;
  feed_id: string;
}) {
  try {
    const [created] = await db.insert(posts).values(post).onConflictDoNothing().returning();
    return created;
  } catch (e) {
    console.error("❌ Failed to insert post:", e);
    return null;
  }
}




import { desc, inArray } from "drizzle-orm";

export async function getPostsForUser(userId: string, limit = 2) {
  // Step 1: Get followed feed_ids
  const follows = await db.query.feedFollows.findMany({
    where: eq(feedFollows.user_id, userId),
  });
  const followedFeedIds = follows.map(f => f.feed_id);

  if (followedFeedIds.length === 0) return [];

  // Step 2: Get posts
  const results = await db.query.posts.findMany({
    where: inArray(posts.feed_id, followedFeedIds),
    orderBy: [desc(posts.publishedAt)],
    limit,
  });

  return results;
}


export async function handlerBrowse(cmdName: string, ...args: string[]) {
  const userName = readConfig().current_user_name;
  if (!userName) throw new Error("❌ Not logged in");

  const user = await db.query.users.findFirst({
    where: eq(users.name, userName),
  });
  if (!user) throw new Error(`❌ User not found: ${userName}`);

  const limit = args[0] ? parseInt(args[0]) : 2;
  const posts = await getPostsForUser(user.id, limit);

  if (posts.length === 0) {
    console.log("📭 No posts available");
    return;
  }

  for (const post of posts) {
    console.log("📰 Post");
    console.log(`• Title: ${post.title}`);
    console.log(`• URL: ${post.url}`);
    if (post.publishedAt) {
      console.log(`• Published: ${post.publishedAt.toISOString()}`);
    }
    console.log("---");
  }
}
