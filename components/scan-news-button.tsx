"use client";

import { getSettings, getSignals, saveNewsArticles } from "@/lib/storage";
import { buildArticleNotes, classifyAndSaveSignal } from "@/lib/signal-actions";
import type { NewsArticle, TargetAccount } from "@/lib/types";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";

export function ScanNewsButton({ onScanComplete }: { onScanComplete: (articles: NewsArticle[]) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoAdded, setAutoAdded] = useState<number | null>(null);

  async function scan() {
    setLoading(true);
    setError(null);
    setAutoAdded(null);

    try {
      const settings = getSettings();
      const response = await fetch("/api/scan-news", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          accounts: settings.targetAccounts,
          relevanceTerms: settings.relevanceTerms,
          days: 30
        })
      });

      if (!response.ok) {
        throw new Error("The news scan did not complete.");
      }

      const payload = (await response.json()) as { articles: NewsArticle[] };
      const accountsById = new Map(settings.targetAccounts.map((account) => [account.id, account]));
      const existingSignalUrls = new Set(getSignals().map((signal) => signal.source_url));
      const articlesWithSignals = await autoAddRelevantSignals(
        payload.articles,
        accountsById,
        settings.autoAddThreshold,
        existingSignalUrls
      );

      saveNewsArticles(articlesWithSignals);
      setAutoAdded(articlesWithSignals.filter((article) => article.autoAddedSignalId).length);
      onScanComplete(articlesWithSignals);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The news scan did not complete.");
    } finally {
      setLoading(false);
    }
  }

  async function autoAddRelevantSignals(
    articles: NewsArticle[],
    accountsById: Map<string, TargetAccount>,
    threshold: number,
    existingSignalUrls: Set<string>
  ) {
    const updated: NewsArticle[] = [];

    for (const article of articles) {
      const account = accountsById.get(article.accountId);
      const shouldAdd = (article.relevanceScore ?? 0) >= threshold;

      if (!account || !shouldAdd || existingSignalUrls.has(article.url)) {
        updated.push(article);
        continue;
      }

      try {
        const signal = await classifyAndSaveSignal({
          sourceUrl: article.url,
          companyName: account.name,
          country: account.country,
          industry: account.industry,
          companyId: account.id.replace(/^acct-/, ""),
          website: account.website ?? null,
          intentSource: article.intentSource,
          notes: buildArticleNotes(article, account)
        });
        updated.push({
          ...article,
          autoAddedSignalId: signal.id
        });
        existingSignalUrls.add(article.url);
      } catch {
        updated.push(article);
      }
    }

    return updated;
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={scan}
        disabled={loading}
        className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md bg-board px-4 text-sm font-semibold text-white hover:bg-board/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? <Loader2 className="animate-spin" size={17} aria-hidden /> : <Search size={17} aria-hidden />}
        {loading ? "Scanning" : "Scan Public News"}
      </button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {autoAdded !== null ? <p className="text-sm text-steel">{autoAdded} high-relevance articles added as signals.</p> : null}
    </div>
  );
}
