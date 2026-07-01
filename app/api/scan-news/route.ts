import type { NewsArticle, TargetAccount } from "@/lib/types";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ScanRequest = {
  accounts: TargetAccount[];
  relevanceTerms?: string[];
  days?: number;
};

function decodeEntities(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value: string) {
  return decodeEntities(value.replace(/<[^>]+>/g, " "));
}

function getTag(item: string, tag: string) {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeEntities(match[1]) : "";
}

function getSource(item: string) {
  const match = item.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
  return match ? decodeEntities(match[1]) : "Public news";
}

function stableId(accountId: string, url: string, title: string) {
  const input = `${url}-${title}`;
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return `${accountId}-${hash.toString(36)}`;
}

function buildQuery(account: TargetAccount, days: number, relevanceTerms: string[]) {
  const queryTerms = relevanceTerms.slice(0, 18).map((term) => `"${term}"`).join(" OR ");
  const terms = [
    `"${account.name}"`,
    account.country,
    account.industry,
    queryTerms ? `(${queryTerms})` : "(earnings OR guidance OR acquisition OR expansion OR inventory OR supply chain OR transformation OR CFO OR S&OP OR planning)"
  ];

  return `${terms.join(" ")} when:${days}d`;
}

function newsRegion(country: string) {
  const codeByCountry: Record<string, string> = {
    Australia: "AU",
    "New Zealand": "NZ",
    Singapore: "SG",
    Japan: "JP",
    Germany: "DE",
    France: "FR",
    "United States": "US",
    Malaysia: "MY",
    Indonesia: "ID",
    Thailand: "TH",
    Vietnam: "VN",
    Philippines: "PH"
  };

  return codeByCountry[country] ?? "AU";
}

function scoreArticle(article: Pick<NewsArticle, "title" | "snippet" | "source">, relevanceTerms: string[]) {
  const text = `${article.title} ${article.snippet ?? ""} ${article.source}`.toLowerCase();
  const matchedTerms = relevanceTerms.filter((term) => text.includes(term.toLowerCase()));
  const titleMatches = matchedTerms.filter((term) => article.title.toLowerCase().includes(term.toLowerCase())).length;
  const score = Math.min(100, matchedTerms.length * 8 + titleMatches * 7);

  return {
    relevanceScore: score,
    matchedTerms
  };
}

async function scanAccount(account: TargetAccount, days: number, relevanceTerms: string[]): Promise<NewsArticle[]> {
  const query = buildQuery(account, days, relevanceTerms);
  const region = newsRegion(account.country);
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en&gl=${region}&ceid=${region}:en`;
  const response = await fetch(url, {
    headers: {
      "user-agent": "SignalScout prototype"
    },
    next: {
      revalidate: 0
    }
  });

  if (!response.ok) {
    return [];
  }

  const xml = await response.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 5);
  const foundAt = new Date().toISOString();

  return items.map((match) => {
    const item = match[1];
    const title = getTag(item, "title");
    const articleUrl = getTag(item, "link");
    const publishedAt = getTag(item, "pubDate");
    const source = getSource(item);

    const article = {
      id: stableId(account.id, articleUrl, title),
      accountId: account.id,
      accountName: account.name,
      title,
      url: articleUrl,
      source,
      intentSource: "News" as const,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
      snippet: stripTags(getTag(item, "description")),
      foundAt
    };

    return {
      ...article,
      ...scoreArticle(article, relevanceTerms)
    };
  });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as ScanRequest;
  const accounts = (payload.accounts ?? []).filter((account) => account.name.trim());
  const days = Math.min(90, Math.max(1, payload.days ?? 30));
  const relevanceTerms = (payload.relevanceTerms ?? []).map((term) => term.trim()).filter(Boolean);

  const results = await Promise.allSettled(accounts.map((account) => scanAccount(account, days, relevanceTerms)));
  const articles = results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));

  return NextResponse.json({
    articles,
    scannedAccounts: accounts.length,
    scannedAt: new Date().toISOString()
  });
}
