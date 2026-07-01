import type { DiscoveryArticle } from "@/lib/types";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type MarketScanRequest = {
  countries: string[];
  industries: string[];
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

function stableId(country: string, industry: string, url: string, title: string) {
  const input = `${country}-${industry}-${url}-${title}`;
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return `disco-${hash.toString(36)}`;
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

function inferCompanyName(title: string) {
  const cleanTitle = title.split(" - ")[0];
  const patterns = [
    /^([A-Z][A-Za-z0-9&.' -]{2,60})\s+(announces|reports|expands|opens|plans|targets|acquires|wins|invests|raises|launches)\b/i,
    /^([A-Z][A-Za-z0-9&.' -]{2,60})\s+to\s+/i,
    /^([A-Z][A-Za-z0-9&.' -]{2,60})[:,]\s+/i
  ];

  for (const pattern of patterns) {
    const match = cleanTitle.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return cleanTitle.split(/\s+(announces|reports|expands|opens|plans|targets|acquires|wins|invests|raises|launches|to)\s+/i)[0].slice(0, 70).trim();
}

function scoreArticle(title: string, snippet: string, terms: string[]) {
  const text = `${title} ${snippet}`.toLowerCase();
  const matchedTerms = terms.filter((term) => text.includes(term.toLowerCase()));
  const revenueTerms = [
    "revenue",
    "sales",
    "annual revenue",
    "$500 million",
    "500 million",
    "billion",
    "bn",
    "large enterprise",
    "multinational"
  ];
  const revenueMatches = revenueTerms.filter((term) => text.includes(term));
  const score = Math.min(100, matchedTerms.length * 8 + revenueMatches.length * 10);

  return {
    relevanceScore: score,
    matchedTerms,
    revenueSignal: revenueMatches.length ? `Revenue-size clue: ${revenueMatches.slice(0, 3).join(", ")}` : "Revenue not verified from article"
  };
}

async function scanMarket(country: string, industry: string, relevanceTerms: string[], days: number) {
  const region = newsRegion(country);
  const intentQuery = relevanceTerms.slice(0, 14).map((term) => `"${term}"`).join(" OR ");
  const revenueQuery = `("revenue" OR "sales" OR "annual revenue" OR "billion" OR "$500 million" OR "large enterprise")`;
  const query = `${country} "${industry}" (${intentQuery}) ${revenueQuery} when:${days}d`;
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
  const foundAt = new Date().toISOString();

  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 6).map((match): DiscoveryArticle => {
    const item = match[1];
    const title = getTag(item, "title");
    const articleUrl = getTag(item, "link");
    const snippet = stripTags(getTag(item, "description"));
    const scoring = scoreArticle(title, snippet, relevanceTerms);

    return {
      id: stableId(country, industry, articleUrl, title),
      accountId: `discover-${country}-${industry}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      accountName: inferCompanyName(title),
      inferredCompanyName: inferCompanyName(title),
      inferredCountry: country,
      inferredIndustry: industry,
      inferredWebsite: "",
      title,
      url: articleUrl,
      source: getSource(item),
      intentSource: "News",
      publishedAt: getTag(item, "pubDate") ? new Date(getTag(item, "pubDate")).toISOString() : null,
      snippet,
      foundAt,
      ...scoring
    };
  });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as MarketScanRequest;
  const countries = (payload.countries ?? []).filter(Boolean);
  const industries = (payload.industries ?? []).filter(Boolean);
  const relevanceTerms = (payload.relevanceTerms ?? []).filter(Boolean);
  const days = Math.min(90, Math.max(1, payload.days ?? 30));

  const jobs = countries.flatMap((country) => industries.map((industry) => scanMarket(country, industry, relevanceTerms, days)));
  const results = await Promise.allSettled(jobs);
  const articles = results
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));

  return NextResponse.json({
    articles,
    scannedAt: new Date().toISOString()
  });
}
