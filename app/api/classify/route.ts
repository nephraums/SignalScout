import { fallbackClassification } from "@/lib/classify";
import type { ClassificationResult, SignalInput } from "@/lib/types";
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

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("OpenAI response did not include JSON.");
  }

  return JSON.parse(match[0]) as ClassificationResult;
}

export async function POST(request: Request) {
  const input = (await request.json()) as SignalInput;
  const sourceContext = await getSourceContext(input.sourceUrl);
  const sourceTitle = sourceContext.title;

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      result: fallbackClassification(input, sourceTitle),
      mode: "local-fallback"
    });
  }

  const prompt = `
Analyse the public business signal below. Classify it for enterprise planning, forecasting, consolidation, supply-chain, or performance management relevance.

Return structured JSON only with these keys:
signal_type, source_title, source_date, summary, why_it_matters, possible_business_pain, board_use_case, opportunity_score, suggested_discovery_question, suggested_linkedin_comment, suggested_connection_note, suggested_first_message.
recommended_play_name, recommended_play_reason, relevant_board_use_case, suggested_manual_research_steps, suggested_next_action, copyable_internal_gpt_briefing.

Allowed signal_type values:
Earnings Miss / Guidance Change
Inventory / Working Capital Issue
M&A / Acquisition / Divestment
Expansion / New Market / New Facility
Executive Change
Job Advertisement Signal
Supply Chain Disruption
Technology / Transformation Signal

Allowed board_use_case values:
FP&A / Enterprise Planning
IBP / S&OP
Demand Forecasting / Foresight
Group Consolidation & Reporting
Supply Chain Planning
Workforce / Capacity Planning
Finance Transformation
Performance Management

Tone:
Professional. Enterprise sales appropriate. No hype. No automated spam language. Do not pretend the sender knows private information. Do not overstate certainty. Keep outreach short and relevant.
Use public-information-only language. Do not include internal asset links, CRM data, campaign links, confidential information, or claims based on private knowledge.

Submitted signal:
URL: ${input.sourceUrl}
Source title: ${sourceTitle ?? "Unknown"}
Source description: ${sourceContext.description ?? "Unknown"}
Source page text excerpt: ${sourceContext.pageText || "Unable to retrieve page text. Rely on URL, title, company, country, industry, and user notes only."}
Company: ${input.companyName}
Country: ${input.country}
Industry: ${input.industry}
User notes: ${input.notes ?? "None"}
`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with ${response.status}`);
    }

    const data = await response.json();
    const outputText =
      data.output_text ??
      data.output?.flatMap((item: { content?: Array<{ text?: string }> }) => item.content ?? [])
        ?.map((content: { text?: string }) => content.text)
        ?.join("\n");

    const result = extractJson(outputText ?? "");
    return NextResponse.json({ result, mode: "openai" });
  } catch {
    return NextResponse.json({
      result: fallbackClassification(input, sourceTitle),
      mode: "local-fallback"
    });
  }
}
