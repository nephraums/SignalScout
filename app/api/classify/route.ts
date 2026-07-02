import { fallbackClassification } from "@/lib/classify";
import type { SignalInput } from "@/lib/types";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function cleanHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function getSourceContext(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "SignalScout prototype"
      },
      next: {
        revalidate: 0
      }
    });
    const html = await response.text();
    const title = html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim();
    const description = html
      .match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i)?.[1]
      ?.replace(/\s+/g, " ")
      .trim();
    const pageText = cleanHtml(html).slice(0, 8000);

    return { title, description, pageText };
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const input = (await request.json()) as SignalInput;
  const sourceContext = await getSourceContext(input.sourceUrl);
  const sourceTitle = sourceContext.title;

  return NextResponse.json({
    result: fallbackClassification(
      {
        ...input,
        notes: [
          input.notes,
          sourceContext.description,
          sourceContext.pageText?.slice(0, 3000)
        ]
          .filter(Boolean)
          .join("\n")
      },
      sourceTitle
    ),
    mode: "rules-engine"
  });
}
