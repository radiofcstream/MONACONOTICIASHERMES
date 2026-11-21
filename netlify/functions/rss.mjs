
const feeds = [
  {
    category: "FORMOSA",
    url: "https://news.google.com/rss/search?q=Formosa+Argentina&hl=es-419&gl=AR&ceid=AR:es-419"
  },
  {
    category: "INTERIOR DE FORMOSA",
    url: "https://news.google.com/rss/search?q=Clorinda+OR+Piran%C3%A9+OR+%22Las+Lomitas%22+OR+%22Ingeniero+Ju%C3%A1rez%22+OR+Ibarreta+OR+%22El+Colorado%22+Formosa&hl=es-419&gl=AR&ceid=AR:es-419"
  },
  {
    category: "NACIONALES",
    url: "https://news.google.com/rss/search?q=Argentina+noticias&hl=es-419&gl=AR&ceid=AR:es-419"
  }
];

function decodeXML(str = "") {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) =>
      String.fromCodePoint(Number(n))
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
      String.fromCodePoint(parseInt(n, 16))
    )
    .trim();
}

function getTag(xml, tag) {
  const match = xml.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i")
  );
  return match ? decodeXML(match[1]) : "";
}

async function getFeed(feed) {
  try {
    const response = await fetch(feed.url, {
      headers: { "User-Agent": "Mozilla/5.0 MONACO-FM" },
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) return [];

    const xml = await response.text();
    const items = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];

    return items.slice(0, 12).map(item => {
      const title = getTag(item, "title");
      const description = getTag(item, "description");
      const link = getTag(item, "link");
      const date = getTag(item, "pubDate");

      return {
        title,
        description,
        link,
        date,
        category: feed.category
      };
    }).filter(item => item.title && item.link);

  } catch (error) {
    return [];
  }
}

export default async () => {
  const results = await Promise.all(
    feeds.map(getFeed)
  );

  const news = results.flat().sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return new Response(JSON.stringify(news), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    }
  });
};
