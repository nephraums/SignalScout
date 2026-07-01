"use client";

import { getCurrentUser, saveSignal } from "@/lib/storage";
import type { ClassificationResult, IntentSource, NewsArticle, Signal, TargetAccount } from "@/lib/types";

export function slug(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function classifyAndSaveSignal({
  sourceUrl,
  companyName,
  country,
  industry,
  notes,
  companyId,
  website,
  intentSource = "Public Signal"
}: {
  sourceUrl: string;
  companyName: string;
  country: string;
  industry: string;
  notes?: string;
  companyId?: string;
  website?: string | null;
  intentSource?: IntentSource;
}) {
  const response = await fetch("/api/classify", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ sourceUrl, companyName, country, industry, notes })
  });

  if (!response.ok) {
    throw new Error("The signal could not be classified.");
  }

  const payload = (await response.json()) as {
    result: ClassificationResult;
    mode: string;
  };
  const timestamp = new Date().toISOString();
  const currentUser = getCurrentUser();
  const stableCompanyId = companyId ?? `co-${slug(companyName)}-${Date.now()}`;
  const signal: Signal = {
    id: `sig-${slug(companyName)}-${Date.now()}`,
    company_id: stableCompanyId,
    company: {
      id: stableCompanyId,
      name: companyName,
      country,
      industry,
      website: website ?? null,
      created_at: timestamp,
      updated_at: timestamp
    },
    source_url: sourceUrl,
    source_title: payload.result.source_title,
    source_date: payload.result.source_date,
    intent_source: intentSource,
    signal_type: payload.result.signal_type,
    summary: payload.result.summary,
    why_it_matters: payload.result.why_it_matters,
    possible_business_pain: payload.result.possible_business_pain,
    board_use_case: payload.result.board_use_case,
    opportunity_score: payload.result.opportunity_score,
    suggested_discovery_question: payload.result.suggested_discovery_question,
    recommended_play_name: payload.result.recommended_play_name,
    recommended_play_reason: payload.result.recommended_play_reason,
    suggested_manual_research_steps: payload.result.suggested_manual_research_steps,
    suggested_next_action: payload.result.suggested_next_action,
    copyable_internal_gpt_briefing: payload.result.copyable_internal_gpt_briefing,
    suggested_linkedin_comment: payload.result.suggested_linkedin_comment,
    suggested_connection_note: payload.result.suggested_connection_note,
    suggested_first_message: payload.result.suggested_first_message,
    status: "New",
    created_by_user_id: currentUser.id,
    owner_user_id: currentUser.id,
    assigned_to_user_id: null,
    play_id: null,
    copied_to_internal_gpt: false,
    copied_to_gong_flow: false,
    manually_added_to_crm: false,
    last_action_at: timestamp,
    user_notes: notes,
    created_at: timestamp,
    updated_at: timestamp
  };

  saveSignal(signal);
  return signal;
}

export function buildArticleNotes(article: NewsArticle, account: TargetAccount) {
  return [
    `Scanned public news article for ${account.name}.`,
    `Intent source: ${article.intentSource}.`,
    `Article title: ${article.title}`,
    `Source: ${article.source}`,
    article.publishedAt ? `Published: ${article.publishedAt.slice(0, 10)}` : null,
    account.notes ? `Account notes: ${account.notes}` : null
  ]
    .filter(Boolean)
    .join("\n");
}
