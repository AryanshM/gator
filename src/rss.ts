import { XMLParser } from "fast-xml-parser";

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

export async function fetchFeed(feedURL: string) {
  try {
    const resp = await fetch(feedURL, {
      headers: {
        "User-Agent": "gator",
      },
    });

    if (!resp.ok) {
      throw new Error(`Failed to fetch feed: ${resp.status} ${resp.statusText}`);
    }

    const feedText = await resp.text();

    const parser = new XMLParser();
    const jsonObj: RSSFeed = parser.parse(feedText);

    const channel = jsonObj.channel;
    if (!channel || !channel.title || !channel.link || !channel.description) {
      throw new Error("Incomplete RSS feed metadata.");
    }

    const { title, link, description } = channel;

    // Ensure items is an array
    const rawItems = Array.isArray(channel.item)
      ? channel.item
      : channel.item
      ? [channel.item]
      : [];

    const items: RSSItem[] = rawItems.map((item) => ({
      title: item.title ?? "",
      link: item.link ?? "",
      description: item.description ?? "",
      pubDate: item.pubDate ?? "",
    }));

    const result = {
      title,
      link,
      description,
      items,
    };

    console.log("✅ Parsed RSS Feed:");
    console.log(result);

    return result;
  } catch (error) {
    console.error("❌ Error fetching or parsing feed:", error);
    throw error;
  }
}
