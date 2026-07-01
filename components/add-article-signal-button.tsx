"use client";

import { buildArticleNotes, classifyAndSaveSignal } from "@/lib/signal-actions";
import type { NewsArticle, TargetAccount } from "@/lib/types";
import { Check, Loader2, Plus } from "lucide-react";
import { useState } from "react";

export function AddArticleSignalButton({
  article,
  account,
  onSignalAdded,
  existingSignal
}: {
  article: NewsArticle;
  account: TargetAccount;
  onSignalAdded: () => void;
  existingSignal?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(existingSignal ?? false);
  const [error, setError] = useState<string | null>(null);

  async function addSignal() {
    setLoading(true);
    setError(null);

    try {
      await classifyAndSaveSignal({
        sourceUrl: article.url,
        companyName: account.name,
        country: account.country,
        industry: account.industry,
        companyId: account.id.replace(/^acct-/, ""),
        website: account.website ?? null,
        intentSource: article.intentSource,
        notes: buildArticleNotes(article, account)
      });
      setAdded(true);
      onSignalAdded();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The signal could not be added.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={addSignal}
        disabled={loading || added}
        className={`focus-ring inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold ${
          added
            ? "border border-success/20 bg-success/10 text-success"
            : "border border-line bg-white text-ink hover:border-board hover:text-board"
        } disabled:cursor-not-allowed`}
      >
        {loading ? <Loader2 className="animate-spin" size={15} aria-hidden /> : added ? <Check size={15} aria-hidden /> : <Plus size={15} aria-hidden />}
        {loading ? "Adding" : added ? "Added" : "Add Signal"}
      </button>
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </div>
  );
}
